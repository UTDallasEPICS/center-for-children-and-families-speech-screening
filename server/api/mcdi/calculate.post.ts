// The endpoint will receive parsed CSV data + form type from the frontend
// The algorithm will be:
//   - Map CSV columns to standardized fields based on form type
//   - Compute combined totals for bilingual forms (SE, ME)
//   - Calculate vocal score (total words known - pull from total_expressive col Q -> col R)
//   - Calculate lower and higher percentile (Based on age (in months), sex, and combined receptive/expressive vocabulary)
//     words based on percentile tables (When percentile is not given exact)
//   - Calculate combined word percentile
//   - Determine Pass/At Risk status (if risk < 20 or "<5" is given then the child is at risk)
//   - Return processed rows ready for the results
//   - (((Score - LowerWords) / (UpperWords - LowerWords)) × (UpperPercentile - LowerPercentile)) + LowerPercentile

import { defineEventHandler, readBody } from 'h3'

// trims the 00:00:00 that openpyxl appends to date fields
function cleanDate(val: string): string {
  if (!val) return ''
  return val.split(' ')[0]
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { formType, rows } = body

  console.log('[calculate] Form type:', formType)
  console.log('[calculate] Rows received:', rows?.length)

  const today = new Date().toISOString().split('T')[0]

  let outputRows: Record<string, any>[] = []

  // ─── engSF 8-18 ───────────────────────────────────────────────────────────
  // Monolingual English, 8-18 months
  // Two percentiles: WU (receptive) and WP (expressive)
  if (formType === 'engSF_8_18') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id: '',
      chname_reg: row.chname_reg ?? '',
      chlname_reg: row.chlname_reg ?? '',
      sem: row.sem ?? '',
      site: row.site ?? '',
      chdob_reg: cleanDate(row.chdob_reg ?? ''),
      chgender_reg: row.chgender_reg ?? '',
      age: row.age ?? '',
      age_mcdi: row.age_mcdi ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language: row.language ?? '',
      total_receptive_eng_mon: row.total_receptive_eng_mon ?? '',
      total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
      WU_Precentile: '',
      WP_Percentile: '',
      WU_Status: '',
      WP_Status: '',
      mcdi_english_short_form_818_months_timestamp: row.mcdi_english_short_form_818_months_timestamp ?? '',
      date_of_report: today,
    }))
  }

  // ─── engSF 16-30 ──────────────────────────────────────────────────────────
  // Monolingual English, 16-30 months
  // One percentile: WP (expressive only)
  else if (formType === 'engSF_16_30') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id: '',
      chname_reg: row.chname_reg ?? '',
      chlname_reg: row.chlname_reg ?? '',
      sem: row.sem ?? '',
      site: row.site ?? '',
      chdob_reg: cleanDate(row.chdob_reg ?? ''),
      chgender_reg: row.chgender_reg ?? '',
      age: row.age ?? '',
      age_mcdi: row.age_mcdi ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language: row.language ?? '',
      es2_english_total_mon: row.es2_english_total_mon ?? '',
      WP_Percentile: '',
      WP_Status: '',
      mcdi_english_short_form_1630_months_timestamp: row.mcdi_english_short_form_1630_months_timestamp ?? '',
      date_of_report: today,
    }))
  }

  // ─── SE 8-18 ──────────────────────────────────────────────────────────────
  // Spanish-English bilingual, 8-18 months
  // Computes combined receptive and expressive totals (eng + span)
  // Two percentiles: WU (combined receptive) and WP (combined expressive)
  else if (formType === 'SE_8_18') {
    outputRows = rows.map((row: Record<string, any>) => {
      const totalReceptive =
        (parseFloat(row.total_receptive_eng) || 0) +
        (parseFloat(row.total_receptive_span) || 0)
      const totalExpressive =
        (parseFloat(row.total_expressive_eng) || 0) +
        (parseFloat(row.total_expressive_span) || 0)
      return {
        child_id: '',
        chname_reg: row.chname_reg ?? '',
        chlname_reg: row.chlname_reg ?? '',
        sem: row.sem ?? '',
        site: row.site ?? '',
        chdob_reg: cleanDate(row.chdob_reg ?? ''),
        chgender_reg: row.chgender_reg ?? '',
        age: row.age ?? '',
        age_mcdi: row.age_mcdi ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language: row.language ?? '',
        total_receptive_eng: row.total_receptive_eng ?? '',
        total_expressive_eng: row.total_expressive_eng ?? '',
        total_receptive_span: row.total_receptive_span ?? '',
        total_expressive_span: row.total_expressive_span ?? '',
        total_receptive: totalReceptive,
        total_expressive: totalExpressive,
        WU_Precentile: '',
        WP_Percentile: '',
        WU_Status: '',
        WP_Status: '',
        mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp: row.mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp ?? '',
        date_of_report: today,
      }
    })
  }

  // ─── SE 16-30 ─────────────────────────────────────────────────────────────
  // Spanish-English bilingual, 16-30 months
  // total_span_eng_expressive already provided in input (eng + span combined)
  // One percentile: WP (combined expressive)
  else if (formType === 'SE_16_30') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id: '',
      chname_reg: row.chname_reg ?? '',
      chlname_reg: row.chlname_reg ?? '',
      sem: row.sem ?? '',
      site: row.site ?? '',
      chdob_reg: cleanDate(row.chdob_reg ?? ''),
      chgender_reg: row.chgender_reg ?? '',
      age: row.age ?? '',
      age_mcdi: row.age_mcdi ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language: row.language ?? '',
      es2_english_total: row.es2_english_total ?? '',
      es2_spanish_total: row.es2_spanish_total ?? '',
      total_span_eng_expressive: row.total_span_eng_expressive ?? '',
      WP_Percentile: '',
      WP_Status: '',
      mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp: row.mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp ?? '',
      date_of_report: today,
    }))
  }

  // ─── ME 8-18 ──────────────────────────────────────────────────────────────
  // Mandarin-English bilingual, 8-18 months
  // Computes combined receptive and expressive totals (eng + zh)
  // Two percentiles: WU (combined receptive) and WP (combined expressive)
  else if (formType === 'ME_8_18') {
    outputRows = rows.map((row: Record<string, any>) => {
      const totalReceptive =
        (parseFloat(row.total_receptive_eng_fa66b7) || 0) +
        (parseFloat(row.total_receptive_zh) || 0)
      const totalExpressive =
        (parseFloat(row.total_expressive_eng_77b77e) || 0) +
        (parseFloat(row.total_expressive_zh) || 0)
      return {
        child_id: '',
        chname_reg: row.chname_reg ?? '',
        chlname_reg: row.chlname_reg ?? '',
        sem: row.sem ?? '',
        site: row.site ?? '',
        chdob_reg: cleanDate(row.chdob_reg ?? ''),
        chgender_reg: row.chgender_reg ?? '',
        age: row.age ?? '',
        age_mcdi: row.age_mcdi ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language: row.language ?? '',
        total_receptive_eng_fa66b7: row.total_receptive_eng_fa66b7 ?? '',
        total_expressive_eng_77b77e: row.total_expressive_eng_77b77e ?? '',
        total_receptive_zh: row.total_receptive_zh ?? '',
        total_expressive_zh: row.total_expressive_zh ?? '',
        total_receptive: totalReceptive,
        total_expressive: totalExpressive,
        WU_Precentile: '',
        WP_Percentile: '',
        WU_Status: '',
        WP_Status: '',
        mcdimandarin_timestamp: row.mcdimandarin_timestamp ?? '',
        date_of_report: today,
      }
    })
  }

  // ─── ME 16-30 ─────────────────────────────────────────────────────────────
  // Mandarin-English bilingual, 16-30 months
  // Computes combined expressive total (eng + zh)
  // One percentile: WP (combined expressive)
  else if (formType === 'ME_16_30') {
    outputRows = rows.map((row: Record<string, any>) => {
      const totalExpressive =
        (parseFloat(row.total_expressive_eng_77b77e) || 0) +
        (parseFloat(row.total_expressive_zh) || 0)
      return {
        child_id: '',
        chname_reg: row.chname_reg ?? '',
        chlname_reg: row.chlname_reg ?? '',
        sem: row.sem ?? '',
        site: row.site ?? '',
        chdob_reg: cleanDate(row.chdob_reg ?? ''),
        chgender_reg: row.chgender_reg ?? '',
        age: row.age ?? '',
        age_mcdi: row.age_mcdi ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language: row.language ?? '',
        total_expressive_eng_77b77e: row.total_expressive_eng_77b77e ?? '',
        total_expressive_zh: row.total_expressive_zh ?? '',
        total_expressive: totalExpressive,
        WP_Percentile: '',
        WP_Status: '',
        mcdimandarin_timestamp: row.mcdimandarin_timestamp ?? '',
        date_of_report: today,
      }
    })
  }

  // ─── engOther 8-18 ────────────────────────────────────────────────────────
  // English + other language (not Spanish or Mandarin), 8-18 months
  // No percentile — just pass through raw English word counts
  else if (formType === 'engOther_8_18') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id: '',
      chname_reg: row.chname_reg ?? '',
      chlname_reg: row.chlname_reg ?? '',
      sem: row.sem ?? '',
      site: row.site ?? '',
      chdob_reg: cleanDate(row.chdob_reg ?? ''),
      chgender_reg: row.chgender_reg ?? '',
      age: row.age ?? '',
      age_mcdi: row.age_mcdi ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language: row.language ?? '',
      specify_language: row.specify_language ?? '',
      total_receptive_eng_mon: row.total_receptive_eng_mon ?? '',
      total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
      mcdi_english_short_form_818_months_timestamp: row.mcdi_english_short_form_818_months_timestamp ?? '',
      mcdi_english_short_form_1630_months_timestamp: row.mcdi_english_short_form_1630_months_timestamp ?? '',
      date_of_report: today,
    }))
  }

  // ─── engOther 16-30 ───────────────────────────────────────────────────────
  // English + other language (not Spanish or Mandarin), 16-30 months
  // No percentile — just pass through raw English word counts
  else if (formType === 'engOther_16_30') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id: '',
      chname_reg: row.chname_reg ?? '',
      chlname_reg: row.chlname_reg ?? '',
      sem: row.sem ?? '',
      site: row.site ?? '',
      chdob_reg: cleanDate(row.chdob_reg ?? ''),
      chgender_reg: row.chgender_reg ?? '',
      age: row.age ?? '',
      age_mcdi: row.age_mcdi ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language: row.language ?? '',
      specify_language: row.specify_language ?? '',
      total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
      mcdi_english_short_form_1630_months_timestamp: row.mcdi_english_short_form_1630_months_timestamp ?? '',
      date_of_report: today,
    }))
  }

  console.log('[calculate] Output rows:', JSON.stringify(outputRows, null, 2))

  return {
    success: true,
    outputRows,
  }
})