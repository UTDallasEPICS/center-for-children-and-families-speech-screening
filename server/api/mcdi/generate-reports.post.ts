import { defineEventHandler, readBody } from 'h3'
import { join } from 'path'
import { readFileSync } from 'fs'
import PizZip from 'pizzip'

const TEMPLATES_DIR = join(process.cwd(), 'public', 'templates')

// Template filenames per form type — engOther uses a single template, others split by AT RISK vs TYPICAL
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

// 8-18mo: at risk if WU or WP <= 20th pct. 16-30mo: WP only
function isAtRisk(formType: string, row: Record<string, any>): boolean {
  console.log('[isAtRisk]', row.chname_reg, '| WU:', row.WU_Precentile, '| WP:', row.WP_Percentile)
  if (formType.startsWith('engOther')) return false

  const wu = row.WU_Precentile
  const wp = row.WP_Percentile

  const atRiskValue = (val: any): boolean => {
    if (val === '<5') return true
    const num = parseFloat(val)
    return !isNaN(num) && num <= 20
  }

  if (formType.endsWith('8_18')) return atRiskValue(wu) || atRiskValue(wp)
  return atRiskValue(wp)
}

// Format date string to spelled-out format like March 5, 2026
function formatDate(val: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Escape special characters before inserting into XML
function xmlEscape(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Ordered list of score/percentile values to substitute into ENTERnumber slots
function getPositionalValues(formType: string, row: Record<string, any>): string[] {
  switch (formType) {
    case 'engSF_8_18':
      return [
        String(row.total_receptive_eng_mon  ?? ''),
        String(row.total_expressive_eng_mon ?? ''),
        String(row.WU_Precentile ?? ''),
        String(row.WP_Percentile ?? ''),
      ]
    case 'engSF_16_30':
      return [
        String(row.es2_english_total_mon ?? ''),
        String(row.WP_Percentile ?? ''),
      ]
    case 'SE_8_18':
      return [
        String(row.total_receptive_eng   ?? ''),
        String(row.total_expressive_eng  ?? ''),
        String(row.total_receptive_span  ?? ''),
        String(row.total_expressive_span ?? ''),
        String(row.total_receptive       ?? ''),
        String(row.total_expressive      ?? ''),
        String(row.WU_Precentile         ?? ''),
        String(row.WP_Percentile         ?? ''),
      ]
    case 'SE_16_30':
      return [
        String(row.es2_english_total          ?? ''),
        String(row.es2_spanish_total          ?? ''),
        String(row.total_span_eng_expressive  ?? ''),
        String(row.WP_Percentile              ?? ''),
      ]
    case 'ME_8_18':
      return [
        String(row.total_receptive_eng_fa66b7  ?? ''),
        String(row.total_expressive_eng_77b77e ?? ''),
        String(row.total_receptive_zh          ?? ''),
        String(row.total_expressive_zh         ?? ''),
        String(row.total_receptive             ?? ''),
        String(row.total_expressive            ?? ''),
        String(row.WU_Precentile               ?? ''),
        String(row.WP_Percentile               ?? ''),
      ]
    case 'ME_16_30':
      return [
        String(row.total_expressive_eng_77b77e ?? ''),
        String(row.total_expressive_zh         ?? ''),
        String(row.total_expressive            ?? ''),
        String(row.WP_Percentile               ?? ''),
      ]
    case 'engOther_8_18':
      return [
        String(row.total_receptive_eng_mon  ?? ''),
        String(row.total_expressive_eng_mon ?? ''),
      ]
    case 'engOther_16_30':
      return [
        String(row.total_expressive_eng_mon ?? ''),
      ]
    default:
      return []
  }
}

// Fills a Word template with child data via direct XML string replacements
function fillTemplate(templatePath: string, row: Record<string, any>, formType: string, programName: string): Buffer {
  const content = readFileSync(templatePath, 'binary')
  const zip = new PizZip(content)
  let xml = zip.file('word/document.xml')!.asText()

  const fullName   = xmlEscape(`${row.chname_reg ?? ''} ${row.chlname_reg ?? ''}`.trim())
  const gender     = xmlEscape(String(row.chgender_reg ?? ''))
  const age        = xmlEscape(String(row.age_mcdi ?? row.age ?? ''))
  const birthDate  = xmlEscape(formatDate(row.chdob_reg ?? ''))
  const dateOfMcdi = xmlEscape(formatDate(
    row.mcdi_english_short_form_818_months_timestamp  ||
    row.mcdi_english_short_form_1630_months_timestamp ||
    row.mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp  ||
    row.mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp  ||
    row.mcdimandarin_timestamp || ''
  ))
  const dateOfReport = xmlEscape(formatDate(new Date().toISOString().split('T')[0]))

  // Word sometimes splits 'ENTERnumber' across two runs — merge before replacing
  xml = xml.replace(
    /(<w:r\b[^>]*><w:rPr>(?:(?!<\/w:r>).)*?<\/w:rPr><w:t[^>]*>)ENTER(<\/w:t><\/w:r>)(<w:r\b[^>]*><w:rPr>(?:(?!<\/w:r>).)*?<\/w:rPr><w:t[^>]*>)number(<\/w:t><\/w:r>)/g,
    '$3ENTERnumber$4'
  )

  // Replace program name
  xml = xml.replace(/(<w:t[^>]*>)\[\s*\](<\/w:t>)/g, (_, o, c) => `${o}${programName}${c}`)

  // Replace name, gender, age placeholders
  xml = xml.replace(/(<w:t[^>]*>)xx(<\/w:t>)/g,  (_, o, c) => `${o}${fullName}${c}`)
  xml = xml.replace(/(<w:t[^>]*>)xxx(<\/w:t>)/g, (_, o, c) => `${o}${gender}${c}`)

  // Gender and Género cells also use 'xx' so target them specifically after name replacement
  xml = xml.replace(/(Gender(?::)?[\s\S]*?<w:highlight[^>]*\/>[\s\S]*?<w:t[^>]*>)([^<]*?)(<\/w:t>)/,  (_, b, _c, c) => `${b}${gender}${c}`)
  xml = xml.replace(/(G[eé]nero(?::)?[\s\S]*?<w:highlight[^>]*\/>[\s\S]*?<w:t[^>]*>)([^<]*?)(<\/w:t>)/, (_, b, _c, c) => `${b}${gender}${c}`)

  // Age and Edad cells also use 'xx'
  xml = xml.replace(/(Age[\s\S]*?months[\s\S]*?<w:highlight[^>]*\/>[\s\S]*?<w:t[^>]*>)([^<]*?)(<\/w:t>)/,  (_, b, _c, c) => `${b}${age}${c}`)
  xml = xml.replace(/(Edad[\s\S]*?meses[\s\S]*?<w:highlight[^>]*\/>[\s\S]*?<w:t[^>]*>)([^<]*?)(<\/w:t>)/, (_, b, _c, c) => `${b}${age}${c}`)

  // XX date placeholders in order: Date of Report, Date of MCDI, Birth Date — doubled for bilingual templates
  const dateValues = [dateOfReport, dateOfMcdi, birthDate, dateOfReport, dateOfMcdi, birthDate]
  let dateIdx = 0
  xml = xml.replace(/(<w:t[^>]*>)XX(<\/w:t>)/g, (_, o, c) => `${o}${dateValues[dateIdx++] ?? ''}${c}`)

  // ENTERnumber slots filled positionally — SE/ME templates doubled for their second section
  const baseValues = getPositionalValues(formType, row)
  const allValues  = ['SE_8_18', 'SE_16_30', 'ME_8_18', 'ME_16_30'].includes(formType)
    ? [...baseValues, ...baseValues]
    : baseValues

  let valueIdx = 0
  xml = xml.replace(/(<w:t[^>]*>)ENTERnumber(<\/w:t>)/g, (_, o, c) => `${o}${xmlEscape(allValues[valueIdx++] ?? '')}${c}`)

  zip.file('word/document.xml', xml)
  return zip.generate({ type: 'nodebuffer' }) as Buffer
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { formType, outputRows, selectedIndices, programName } = body

  console.log('[generate-reports] Form type:', formType)
  console.log('[generate-reports] Selected indices:', selectedIndices)
  console.log('[generate-reports] Output rows received:', outputRows?.length)
  console.log('[generate-reports] Program name: ', programName)

  const templateConfig = TEMPLATES[formType]
  if (!templateConfig) {
    return { success: false, message: `Unknown form type: ${formType}` }
  }

  // Build zip synchronously using PizZip — no streams, no race conditions
  const outputZip = new PizZip()

  for (const idx of selectedIndices) {
    const row = outputRows[idx]
    if (!row) continue

    const templateFile = 'single' in templateConfig
      ? templateConfig.single
      : isAtRisk(formType, row) ? templateConfig.atRisk : templateConfig.typical

    const templatePath = join(TEMPLATES_DIR, templateFile)
    const docBuffer = fillTemplate(templatePath, row, formType, programName)

    const firstName = (row.chname_reg ?? 'Unknown').replace(/\s+/g, '_')
    const lastName  = (row.chlname_reg ?? 'Unknown').replace(/\s+/g, '_')
    outputZip.file(`${firstName}_${lastName}_${formType}.docx`, docBuffer)
  }

  const zipBuffer = outputZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
  const base64    = zipBuffer.toString('base64')
  const today     = new Date().toISOString().split('T')[0]
  const fileName  = `${formType}_reports_${today}.zip`

  console.log('[generate-reports] Zip generated:', fileName)
  return { success: true, fileName, base64 }
})