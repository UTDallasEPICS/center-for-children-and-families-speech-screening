import { defineEventHandler, readBody } from 'h3'
import { getTable, type PercentileTable } from '../../utils/mcdiPercentileTables'

// Strips the 00:00:00 that openpyxl appends to date fields
function cleanDate(val: string): string {
  if (!val) return ''
  return val.split(' ')[0]
}

// Maps REDCap numeric gender codes to text labels
function normalizeGender(val: string): string {
  if (val === '1') return 'Girl'
  if (val === '2') return 'Boy'
  return val
}

type PercentileResult = number | '<5'
type StatusResult = 'At Risk' | 'Typical'

// Bracket data returned alongside the percentile for Excel output
interface BracketData {
  lowerWords:  number
  higherWords: number
  lowerPct:    number
  higherPct:   number
}

interface LookupResult {
  percentile: PercentileResult
  bracket:    BracketData
}

const PERCENTILE_ROWS = [99, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5]

// Interpolates a score against a percentile table — returns percentile + bracket data
function lookupPercentile(table: PercentileTable, age: number, score: number): LookupResult {
  if (isNaN(age) || age <= 0) {
    return { percentile: '<5', bracket: { lowerWords: 0, higherWords: 0, lowerPct: 5, higherPct: 5 } }
  }
  if (isNaN(score) || score < 0) {
    return { percentile: '<5', bracket: { lowerWords: 0, higherWords: 0, lowerPct: 5, higherPct: 5 } }
  }

  const rows = PERCENTILE_ROWS.map(pct => ({ pct, threshold: table[pct]?.[age] ?? 0 }))

  // Score at or above 99th percentile row
  if (score >= rows[0].threshold) {
    return {
      percentile: 99,
      bracket: { lowerWords: rows[0].threshold, higherWords: rows[0].threshold, lowerPct: 99, higherPct: 99 },
    }
  }

  // Score below 5th percentile row
  if (score < rows[rows.length - 1].threshold) {
    return {
      percentile: '<5',
      bracket: { lowerWords: rows[rows.length - 1].threshold, higherWords: rows[rows.length - 1].threshold, lowerPct: 5, higherPct: 5 },
    }
  }

  // Find the bracket and interpolate
  for (let i = 0; i < rows.length - 1; i++) {
    const higher = rows[i]
    const lower  = rows[i + 1]
    if (score >= lower.threshold && score < higher.threshold) {
      let interpolated: number
      if (higher.threshold === lower.threshold) {
        interpolated = lower.pct
      } else {
        interpolated =
          ((score - lower.threshold) / (higher.threshold - lower.threshold)) *
          (higher.pct - lower.pct) + lower.pct
        interpolated = Math.round(interpolated * 100) / 100
      }
      return {
        percentile: interpolated,
        bracket: {
          lowerWords:  lower.threshold,
          higherWords: higher.threshold,
          lowerPct:    lower.pct,
          higherPct:   higher.pct,
        },
      }
    }
  }

  // Fallback — should never be hit
  return {
    percentile: '<5',
    bracket: { lowerWords: rows[rows.length - 1].threshold, higherWords: rows[rows.length - 1].threshold, lowerPct: 5, higherPct: 5 },
  }
}

function getStatus(pct: PercentileResult): StatusResult {
  if (pct === '<5') return 'At Risk'
  if (typeof pct === 'number' && pct <= 20) return 'At Risk'
  return 'Typical'
}

// engSF_8_18 and SE_8_18 — WU from B.2/B.3, WP from B.5/B.6
function calcPercentiles_SF_8_18(gender: string, age: number, wuScore: number, wpScore: number, prefix: string = '') {
  const wu = lookupPercentile(getTable('B', 'WU', '8_18', gender), age, wuScore)
  const wp = lookupPercentile(getTable('B', 'WP', '8_18', gender), age, wpScore)
  const p  = prefix ? `${prefix} ` : ''
  return {
    WU_Precentile:   wu.percentile,
    WU_Status:       getStatus(wu.percentile),
    [`${p}WU: Lower End Percentile Words`]:  wu.bracket.lowerWords,
    [`${p}WU: Higher End Percentile Words`]: wu.bracket.higherWords,
    [`${p}WU: Lower End Percentile`]:        wu.bracket.lowerPct,
    [`${p}WU: Higher End Percentile`]:       wu.bracket.higherPct,
    WP_Percentile:   wp.percentile,
    WP_Status:       getStatus(wp.percentile),
    [`${p}WP: Lower End Percentile Words`]:  wp.bracket.lowerWords,
    [`${p}WP: Higher End Percentile Words`]: wp.bracket.higherWords,
    [`${p}WP: Lower End Percentile`]:        wp.bracket.lowerPct,
    [`${p}WP: Higher End Percentile`]:       wp.bracket.higherPct,
  }
}

// engSF_16_30 and SE_16_30 — WP only from B.8/B.9
function calcPercentiles_SF_16_30(gender: string, age: number, wpScore: number, prefix: string = '') {
  const wp = lookupPercentile(getTable('B', 'WP', '16_30', gender), age, wpScore)
  const p  = prefix ? `${prefix} ` : ''
  return {
    WP_Percentile:   wp.percentile,
    WP_Status:       getStatus(wp.percentile),
    [`${p}WP: Lower End Percentile Words`]:  wp.bracket.lowerWords,
    [`${p}WP: Higher End Percentile Words`]: wp.bracket.higherWords,
    [`${p}WP: Lower End Percentile`]:        wp.bracket.lowerPct,
    [`${p}WP: Higher End Percentile`]:       wp.bracket.higherPct,
  }
}

// ME_8_18 — WU from A.5/A.6, WP from A.8/A.9
function calcPercentiles_LF_8_18(gender: string, age: number, wuScore: number, wpScore: number) {
  const wu = lookupPercentile(getTable('A', 'WU', '8_18', gender), age, wuScore)
  const wp = lookupPercentile(getTable('A', 'WP', '8_18', gender), age, wpScore)
  return {
    WU_Precentile:   wu.percentile,
    WU_Status:       getStatus(wu.percentile),
    'combined WU: Lower End Percentile Words':  wu.bracket.lowerWords,
    'combined WU: Higher End Percentile Words': wu.bracket.higherWords,
    'combined WU: Lower End Percentile':        wu.bracket.lowerPct,
    'combined WU: Higher End Percentile':       wu.bracket.higherPct,
    WP_Percentile:   wp.percentile,
    WP_Status:       getStatus(wp.percentile),
    'combined WP: Lower End Percentile Words':  wp.bracket.lowerWords,
    'combined WP: Higher End Percentile Words': wp.bracket.higherWords,
    'combined WP: Lower End Percentile':        wp.bracket.lowerPct,
    'combined WP: Higher End Percentile':       wp.bracket.higherPct,
  }
}

// ME_16_30 — WP only from A.20/A.21
function calcPercentiles_LF_16_30(gender: string, age: number, wpScore: number) {
  const wp = lookupPercentile(getTable('A', 'WP', '16_30', gender), age, wpScore)
  return {
    WP_Percentile:   wp.percentile,
    WP_Status:       getStatus(wp.percentile),
    'comb WP: Lower End Percentile Words':  wp.bracket.lowerWords,
    'comb WP: Higher End Percentile Words': wp.bracket.higherWords,
    'comb WP: Lower End Percentile':        wp.bracket.lowerPct,
    'comb WP: Higher End Percentile':       wp.bracket.higherPct,
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { formType, rows } = body

  console.log('[calculate] Form type:', formType)
  console.log('[calculate] Rows received:', rows?.length)

  let outputRows: Record<string, any>[] = []

  if (formType === 'engSF_8_18') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const wuScore = parseFloat(row.total_receptive_eng_mon)  || 0
      const wpScore = parseFloat(row.total_expressive_eng_mon) || 0
      const pcts    = calcPercentiles_SF_8_18(gender, age, wuScore, wpScore)
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        total_receptive_eng_mon:  row.total_receptive_eng_mon  ?? '',
        total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
        ...pcts,
        mcdi_english_short_form_818_months_timestamp: row.mcdi_english_short_form_818_months_timestamp ?? '',
      }
    })
  }

  else if (formType === 'engSF_16_30') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const wpScore = parseFloat(row.es2_english_total_mon) || 0
      const pcts    = calcPercentiles_SF_16_30(gender, age, wpScore)
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        es2_english_total_mon: row.es2_english_total_mon ?? '',
        ...pcts,
        mcdi_english_short_form_1630_months_timestamp: row.mcdi_english_short_form_1630_months_timestamp ?? '',
      }
    })
  }

  else if (formType === 'SE_8_18') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const wuScore = parseFloat(row.total_receptive)  || 0
      const wpScore = parseFloat(row.total_expressive) || 0
      const pcts    = calcPercentiles_SF_8_18(gender, age, wuScore, wpScore, 'comb')
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        total_receptive_eng:   row.total_receptive_eng   ?? '',
        total_expressive_eng:  row.total_expressive_eng  ?? '',
        total_receptive_span:  row.total_receptive_span  ?? '',
        total_expressive_span: row.total_expressive_span ?? '',
        total_receptive:       row.total_receptive       ?? '',
        total_expressive:      row.total_expressive      ?? '',
        ...pcts,
        mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp: row.mcdi_spanishenglish_short_form_with_ces_8_18_month_timestamp ?? '',
      }
    })
  }

  else if (formType === 'SE_16_30') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const wpScore = parseFloat(row.total_span_eng_expressive) || 0
      const pcts    = calcPercentiles_SF_16_30(gender, age, wpScore, 'comb')
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        es2_english_total:         row.es2_english_total         ?? '',
        es2_spanish_total:         row.es2_spanish_total         ?? '',
        total_span_eng_expressive: row.total_span_eng_expressive ?? '',
        ...pcts,
        mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp: row.mcdi_spanishenglish_short_form_with_ces_16_30_mont_timestamp ?? '',
      }
    })
  }

  else if (formType === 'ME_8_18') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const totalWU = (parseFloat(row.total_receptive_eng_fa66b7)  || 0) + (parseFloat(row.total_receptive_zh)  || 0)
      const totalWP = (parseFloat(row.total_expressive_eng_77b77e) || 0) + (parseFloat(row.total_expressive_zh) || 0)
      const pcts    = calcPercentiles_LF_8_18(gender, age, totalWU, totalWP)
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        total_receptive_eng_fa66b7:  row.total_receptive_eng_fa66b7  ?? '',
        total_expressive_eng_77b77e: row.total_expressive_eng_77b77e ?? '',
        total_receptive_zh:          row.total_receptive_zh          ?? '',
        total_expressive_zh:         row.total_expressive_zh         ?? '',
        total_receptive:  totalWU,
        total_expressive: totalWP,
        ...pcts,
        mcdimandarin_timestamp: row.mcdimandarin_timestamp ?? '',
      }
    })
  }

  else if (formType === 'ME_16_30') {
    outputRows = rows.map((row: Record<string, any>) => {
      const age     = parseInt(row.age_mcdi)
      const gender  = normalizeGender(row.chgender_reg ?? '')
      const totalWP = (parseFloat(row.total_expressive_eng_77b77e) || 0) + (parseFloat(row.total_expressive_zh) || 0)
      const pcts    = calcPercentiles_LF_16_30(gender, age, totalWP)
      return {
        child_id:     '',
        chname_reg:   row.chname_reg   ?? '',
        chlname_reg:  row.chlname_reg  ?? '',
        sem:          row.sem          ?? '',
        site_reg:     row.site_reg ?? row.site ?? '',
        chdob_reg:    cleanDate(row.chdob_reg ?? ''),
        chgender_reg: gender,
        age:          row.age          ?? '',
        age_mcdi:     row.age_mcdi     ?? '',
        otherlangexpo: row.otherlangexpo ?? '',
        language:      row.language      ?? '',
        total_expressive_eng_77b77e: row.total_expressive_eng_77b77e ?? '',
        total_expressive_zh:         row.total_expressive_zh         ?? '',
        total_expressive: totalWP,
        ...pcts,
        mcdimandarin_timestamp: row.mcdimandarin_timestamp ?? '',
      }
    })
  }

  else if (formType === 'engOther_8_18') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id:     '',
      chname_reg:   row.chname_reg   ?? '',
      chlname_reg:  row.chlname_reg  ?? '',
      sem:          row.sem          ?? '',
      site_reg:     row.site_reg ?? row.site ?? '',
      chdob_reg:    cleanDate(row.chdob_reg ?? ''),
      chgender_reg: normalizeGender(row.chgender_reg ?? ''),
      age:          row.age          ?? '',
      age_mcdi:     row.age_mcdi     ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language:      row.language      ?? '',
      specify_language:         row.specify_language         ?? '',
      total_receptive_eng_mon:  row.total_receptive_eng_mon  ?? '',
      total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
      mcdi_english_short_form_818_months_timestamp:  row.mcdi_english_short_form_818_months_timestamp  ?? '',
      mcdi_english_short_form_1630_months_timestamp: row.mcdi_english_short_form_1630_months_timestamp ?? '',
    }))
  }

  else if (formType === 'engOther_16_30') {
    outputRows = rows.map((row: Record<string, any>) => ({
      child_id:     '',
      chname_reg:   row.chname_reg   ?? '',
      chlname_reg:  row.chlname_reg  ?? '',
      sem:          row.sem          ?? '',
      site_reg:     row.site_reg ?? row.site ?? '',
      chdob_reg:    cleanDate(row.chdob_reg ?? ''),
      chgender_reg: normalizeGender(row.chgender_reg ?? ''),
      age:          row.age          ?? '',
      age_mcdi:     row.age_mcdi     ?? '',
      otherlangexpo: row.otherlangexpo ?? '',
      language:      row.language      ?? '',
      specify_language:         row.specify_language         ?? '',
      total_expressive_eng_mon: row.total_expressive_eng_mon ?? '',
    }))
  }

  console.log('[calculate] Output rows:', outputRows.length)

  return { success: true, outputRows }
})