interface FormValidationRule {
  minAge: number;
  maxAge: number;
  expectedLanguage: string;
}

const FORM_RULES: Record<string, FormValidationRule> = {
  engSF_8_18: { minAge: 8, maxAge: 18, expectedLanguage: '' },
  engSF_16_30: { minAge: 16, maxAge: 30, expectedLanguage: '' },
  SE_8_18: { minAge: 8, maxAge: 18, expectedLanguage: '1' },
  SE_16_30: { minAge: 16, maxAge: 30, expectedLanguage: '1' },
  ME_8_18: { minAge: 8, maxAge: 18, expectedLanguage: '2' },
  ME_16_30: { minAge: 16, maxAge: 30, expectedLanguage: '2' },
  engOther_8_18: { minAge: 8, maxAge: 18, expectedLanguage: '3' },
  engOther_16_30: { minAge: 16, maxAge: 30, expectedLanguage: '3' },
}

export function validateFormData(formType: string, rows: Record<string, string>[]): true | string[] {
  const rule = FORM_RULES[formType]
  if (!rule) {
    return ['Unknown form type selected']
  }

  let hasAgeError = false
  let hasLangError = false

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    
    // Parse age (handle 'age_mcdi' or 'age' dynamically)
    const rawAge = row['age_mcdi'] || row['age'] || ''
    const age = parseInt(rawAge, 10)
    
    if (isNaN(age) || age < rule.minAge || age > rule.maxAge) {
      hasAgeError = true
    }

    // Default to empty string if missing (e.g. engSF templates)
    const language = (row['language'] || '').trim()
    
    if (language !== rule.expectedLanguage) {
      hasLangError = true
    }
  }

  const errors: string[] = []
  if (hasLangError) errors.push('wrong language')
  if (hasAgeError) errors.push('wrong age-range')

  if (errors.length > 0) {
    return errors
  }

  return true
}
