// Receives outputRows + formType + selectedIndices from the frontend
// For each selected row:
//   1. Pick the correct Word template based on formType and AT RISK vs TYPICAL status
//   2. Fill in child info fields (xx/XX placeholders)
//   3. Fill in score and percentile fields (ENTERnumber placeholders) positionally
//   4. Zip all generated .docx files
//   5. Return base64 encoded zip for frontend to trigger download

import { defineEventHandler, readBody } from 'h3'
import { join } from 'path'
import { readFileSync } from 'fs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import archiver from 'archiver'
import { PassThrough } from 'stream'

const TEMPLATES_DIR = join(process.cwd(), 'public', 'templates')

// Template filenames per form type and status
const TEMPLATES: Record<string, { atRisk: string; typical: string } | { single: string }> = {
  engSF_8_18:    { atRisk: 'MBCDI report English 8-18mo_AT RISK.docx',   typical: 'MBCDI report English 8-18mo_TYPICAL.docx' },
  engSF_16_30:   { atRisk: 'MBCDI report English 16-30mo_AT RISK.docx',  typical: 'MBCDI report English 16-30mo_TYPICAL.docx' },
  SE_8_18:       { atRisk: 'MBCDI report SE 8-18mo_AT RISK.docx',        typical: 'MBCDI report SE 8-18mo_TYPICAL.docx' },
  SE_16_30:      { atRisk: 'MBCDI report SE 16-30mo_AT RISK.docx',       typical: 'MBCDI report SE 16-30mo_TYPICAL.docx' },
  ME_8_18:       { atRisk: 'MBCDI report ME 8-18mo_AT RISK.docx',        typical: 'MBCDI report ME 8-18mo_TYPICAL.docx' },
  ME_16_30:      { atRisk: 'MBCDI report ME 16-30mo_AT RISK.docx',       typical: 'MBCDI report ME 16-30mo_TYPICAL.docx' },
  engOther_8_18: { single: 'MCDI report template_DNE bilingual 8-18 mo.docx' },
  engOther_16_30:{ single: 'MCDI report template_DNE bilingual 16-30 mo.docx' },
}

// Function 
function isAtRisk(formType: string, row: Record<string, any>): boolean {
  // engOther forms never have a percentile
  if (formType.startsWith('engOther')) return false

  const wu = row.WU_Precentile
  const wp = row.WP_Percentile

  // a value is at risk if it's ≤ 20 or is the string '<5'
  const atRiskValue = (val: any): boolean => {
    if (val === '<5') return true
    const num = parseFloat(val)
    return !isNaN(num) && num <= 20
  }

  // 8-18 month forms: EITHER WU or WP ≤ 20 = at risk
  if (formType.endsWith('8_18')) {
    return atRiskValue(wu) || atRiskValue(wp)
  }

  // 16-30 month forms: only WP matters
  return atRiskValue(wp)
}

// Format a date string to spelled-out format e.g. "March 5, 2026"
function formatDate(val: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Get all runs in a paragraph into a single run
// needed because Word splits text across runs unpredictably
// e.g. "ENTER" + "number" instead of "ENTERnumber"
function consolidateRuns(paragraph: any) {
  if (!paragraph.runs || paragraph.runs.length <= 1) return
  const fullText = paragraph.runs.map((r: any) => r.text).join('')
  // put all text in first run, clear the rest
  paragraph.runs[0].text = fullText
  for (let i = 1; i < paragraph.runs.length; i++) {
    paragraph.runs[i].text = ''
  }
}

// Replace placeholder string 
function replacePlaceholder(doc: any, placeholder: string, value: string) {
  const body = doc.getZip().files['word/document.xml']
  if (!body) return

  // Use docxtemplater's method to get all paragraphs
  const xml = body.asText()
  const replaced = xml.split(placeholder).join(value)
  doc.getZip().file('word/document.xml', replaced)
}

// Build the values to substitute into ENTERnumber slots positionally per form type
function getPositionalValues(formType: string, row: Record<string, any>): string[] {
  switch (formType) {
    case 'engSF_8_18':
      // Receptive (out of 89), Expressive (out of 89), WU percentile%, WP percentile%
      return [
        row.total_receptive_eng_mon ?? '',
        row.total_expressive_eng_mon ?? '',
        row.WU_Precentile ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'engSF_16_30':
      // Expressive (out of 100), WP percentile%
      return [
        row.es2_english_total_mon ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'SE_8_18':
      // Eng receptive (89), Eng expressive (89), Span receptive (105), Span expressive (105),
      // Combined receptive, Combined expressive, WU percentile%, WP percentile%
      // Spanish section repeats same values
      return [
        row.total_receptive_eng ?? '',
        row.total_expressive_eng ?? '',
        row.total_receptive_span ?? '',
        row.total_expressive_span ?? '',
        row.total_receptive ?? '',
        row.total_expressive ?? '',
        row.WU_Precentile ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'SE_16_30':
      // Eng expressive (100), Span expressive (100), Combined expressive, WP percentile%
      // Spanish section repeats same values
      return [
        row.es2_english_total ?? '',
        row.es2_spanish_total ?? '',
        row.total_span_eng_expressive ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'ME_8_18':
      // Eng receptive (680), Eng expressive (680), Mand receptive (799), Mand expressive (799),
      // Combined receptive, Combined expressive, WU percentile%, WP percentile%
      return [
        row.total_receptive_eng_fa66b7 ?? '',
        row.total_expressive_eng_77b77e ?? '',
        row.total_receptive_zh ?? '',
        row.total_expressive_zh ?? '',
        row.total_receptive ?? '',
        row.total_expressive ?? '',
        row.WU_Precentile ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'ME_16_30':
      // Eng expressive (680), Mand expressive (799), Combined expressive, WP percentile%
      return [
        row.total_expressive_eng_77b77e ?? '',
        row.total_expressive_zh ?? '',
        row.total_expressive ?? '',
        row.WP_Percentile ?? '',
      ]
    case 'engOther_8_18':
      // Receptive (out of 89), Expressive (out of 89) — no percentile
      return [
        row.total_receptive_eng_mon ?? '',
        row.total_expressive_eng_mon ?? '',
      ]
    case 'engOther_16_30':
      // Expressive (out of 100) — no percentile
      return [
        row.total_expressive_eng_mon ?? '',
      ]
    default:
      return []
  }
}

// Fill a Word template with child data and return the filled buffer
function fillTemplate(templatePath: string, row: Record<string, any>, formType: string): Buffer {
  const content = readFileSync(templatePath, 'binary')
  const zip = new PizZip(content)

  // manipulate the raw xml
  let xml = zip.file('word/document.xml')!.asText()

  // ── Child info fields ──────────────────────────────────────────────────────
  const fullName = `${row.chname_reg ?? ''} ${row.chlname_reg ?? ''}`.trim()
  const dateOfReport = formatDate(row.date_of_report ?? '')
  const dateOfMcdi = formatDate(
    row.mcdi_english_short_form_818_months_timestamp ||
    row.mcdi_english_short_form_1630_months_timestamp ||
    row.mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp ||
    row.mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp ||
    row.mcdimandarin_timestamp || ''
  )
  const birthDate = formatDate(row.chdob_reg ?? '')
  const age = row.age_mcdi ?? row.age ?? ''
  const gender = row.chgender_reg ?? ''

  // Replace child info placeholders — handle both xx and xxx versions
  xml = xml.split('xxx').join(gender)  
  xml = xml.split('xx').join(fullName) 

  // Replace date placeholders — XX used for all date fields
  // We replace them in document order Date of Report, Date of MCDI, Birth Date
  let dateReplacements = [dateOfReport, dateOfMcdi, birthDate]
  let dateIdx = 0
  xml = xml.replace(/XX/g, () => dateReplacements[dateIdx++] ?? 'XX')

  // Age — appears as 'xx' 
  // Age is in its own cell
  // Re-replace age specifically by targeting the Age months context
  xml = xml.replace(
    /Age \(months\)[^<]*<\/w:t>/g,
    (match) => match.replace(fullName, age)
  )

  // ── ENTERnumber fields (positional) ───────────────────────────────────────
  const values = getPositionalValues(formType, row)
  let valueIdx = 0
  xml = xml.replace(/ENTERnumber/g, () => String(values[valueIdx++] ?? ''))

  zip.file('word/document.xml', xml)

  return zip.generate({ type: 'nodebuffer' }) as Buffer
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { formType, outputRows, selectedIndices } = body

  console.log('[generate-reports] Form type:', formType)
  console.log('[generate-reports] Selected indices:', selectedIndices)
  console.log('[generate-reports] Output rows received:', outputRows?.length)

  const templateConfig = TEMPLATES[formType]
  if (!templateConfig) {
    return { success: false, message: `Unknown form type: ${formType}` }
  }

  // Build zip in memory
  const passThrough = new PassThrough()
  const archive = archiver('zip', { zlib: { level: 6 } })
  archive.pipe(passThrough)

  for (const idx of selectedIndices) {
    const row = outputRows[idx]
    if (!row) continue

    // Pick template file
    let templateFile: string
    if ('single' in templateConfig) {
      templateFile = templateConfig.single
    } else {
      templateFile = isAtRisk(formType, row) ? templateConfig.atRisk : templateConfig.typical
    }

    const templatePath = join(TEMPLATES_DIR, templateFile)
    const docBuffer = fillTemplate(templatePath, row, formType)

    const firstName = (row.chname_reg ?? 'Unknown').replace(/\s+/g, '_')
    const lastName = (row.chlname_reg ?? 'Unknown').replace(/\s+/g, '_')
    const docName = `${firstName}_${lastName}_${formType}.docx`

    archive.append(docBuffer, { name: docName })
  }

  await archive.finalize()

  // Collect zip buffer from stream
  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    passThrough.on('data', (chunk) => chunks.push(chunk))
    passThrough.on('end', resolve)
    passThrough.on('error', reject)
  })

  const zipBuffer = Buffer.concat(chunks)
  const base64 = zipBuffer.toString('base64')

  const today = new Date().toISOString().split('T')[0]
  const fileName = `${formType}_reports_${today}.zip`

  console.log('[generate-reports] Zip generated:', fileName)

  return {
    success: true,
    fileName,
    base64,
  }
})