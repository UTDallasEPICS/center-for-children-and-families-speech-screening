import { defineEventHandler, readBody } from 'h3'
import ExcelJS from 'exceljs'

// Maps form type keys to the sheet tab name in the output Excel file
const FORM_TYPE_TO_TAB: Record<string, string> = {
  engSF_8_18:    'engSF8-18',
  engSF_16_30:   'engSF16-30',
  SE_8_18:       'SE8-18',
  SE_16_30:      'SE16-30',
  ME_8_18:       'ME8-18',
  ME_16_30:      'ME16-30',
  engOther_8_18: 'engOther8-18',
  engOther_16_30:'engOther16-30',
}

// Output column order per form type — child_id is always first so researchers can backfill it
const FORM_COLUMNS: Record<string, string[]> = {
  engSF_8_18: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'total_receptive_eng_mon', 'total_expressive_eng_mon',
    'WU_Precentile', 'WP_Percentile', 'WU_Status', 'WP_Status',
    'mcdi_english_short_form_818_months_timestamp',
  ],
  engSF_16_30: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'es2_english_total_mon',
    'WP_Percentile', 'WP_Status',
    'mcdi_english_short_form_1630_months_timestamp',
  ],
  SE_8_18: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'total_receptive_eng', 'total_expressive_eng',
    'total_receptive_span', 'total_expressive_span',
    'total_receptive', 'total_expressive',
    'WU_Precentile', 'WP_Percentile', 'WU_Status', 'WP_Status',
    'mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp',
  ],
  SE_16_30: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'es2_english_total', 'es2_spanish_total', 'total_span_eng_expressive',
    'WP_Percentile', 'WP_Status',
    'mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp',
  ],
  ME_8_18: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'total_receptive_eng_fa66b7', 'total_expressive_eng_77b77e',
    'total_receptive_zh', 'total_expressive_zh',
    'total_receptive=total_receptive_eng_fa66b7+total_receptive_zh',
    'total_expressive=total_expressive_eng_77b77e+total_expressive_zh',
    'WU_Precentile', 'WP_Percentile', 'WU_Status', 'WP_Status',
    'mcdimandarin_timestamp',
  ],
  ME_16_30: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'total_expressive_eng_77b77e', 'total_expressive_zh',
    'total_expressive=total_expressive_eng_77b77e+total_expressive_zh',
    'WP_Percentile', 'WP_Status',
    'mcdimandarin_timestamp',
  ],
  engOther_8_18: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'specify_language', 'total_receptive_eng_mon', 'total_expressive_eng_mon',
    'mcdi_english_short_form_818_months_timestamp',
    'mcdi_english_short_form_1630_months_timestamp',
  ],
  engOther_16_30: [
    'child_id',
    'chname_reg', 'chlname_reg', 'sem', 'site', 'chdob_reg', 'chgender_reg',
    'age', 'age_mcdi', 'otherlangexpo', 'language',
    'specify_language', 'total_expressive_eng_mon',
  ],
}

// The ME combined total columns have big display names but map to simpler row keys
const COLUMN_TO_ROW_KEY: Record<string, string> = {
  'total_receptive=total_receptive_eng_fa66b7+total_receptive_zh': 'total_receptive',
  'total_expressive=total_expressive_eng_77b77e+total_expressive_zh': 'total_expressive',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { formType, outputRows } = body

  console.log('[generate-excel] Form type:', formType)
  console.log('[generate-excel] Output rows received:', outputRows?.length)

  const workbook = new ExcelJS.Workbook()

  // First tab: abbreviation key for researchers
  const colorSheet = workbook.addWorksheet('colorkey')
  colorSheet.getColumn('A').width = 80
  colorSheet.getCell('A1').value = 'Abbreviations'
  colorSheet.getCell('A1').font = { bold: true }
  const colorKeyRows = [
    'ME= mandarin english; denotes MCDI english form for ME bilinguals',
    'SE= spanish english ; denotes the MCDI combined SE forms for SE bilinguals',
    'engSF = monolingual english form',
    'WU = Words Understood (receptive)',
    'WP = Words Produced (expressive)',
    'At Risk = percentile at or below 20th percentile',
    'Typical = percentile above 20th percentile',
    'child_id = to be backfilled by researcher after download',
  ]
  colorKeyRows.forEach((text, i) => { colorSheet.getCell(`A${i + 2}`).value = text })

  // Second tab: the data
  const tabName = FORM_TYPE_TO_TAB[formType]
  const columns = FORM_COLUMNS[formType]
  if (!tabName || !columns) return { success: false, message: `Unknown form type: ${formType}` }

  const dataSheet = workbook.addWorksheet(tabName)
  dataSheet.addRow(columns)

  // Style the header row
  const headerRow = dataSheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
  headerRow.alignment = { wrapText: true }
  columns.forEach((_, i) => { dataSheet.getColumn(i + 1).width = 20 })

  // Write each output row, resolving big ME column names back to their row keys
  outputRows.forEach((row: Record<string, any>) => {
    const rowData = columns.map((col: string) => {
      const rowKey = COLUMN_TO_ROW_KEY[col] ?? col
      const val = row[rowKey]
      return val !== undefined && val !== null ? val : ''
    })
    dataSheet.addRow(rowData)
  })

  dataSheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const today = new Date().toISOString().split('T')[0]
  const fileName = `${formType}_output_${today}.xlsx`

  console.log('[generate-excel] File generated:', fileName)

  return { success: true, fileName, base64 }
})