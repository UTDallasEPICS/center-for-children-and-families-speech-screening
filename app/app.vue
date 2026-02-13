<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>

<template>
  <UApp>
<<<<<<< Updated upstream
    <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header class="border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur-md sticky top-0 z-50">
        <UContainer class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-heroicons-cube-transparent" class="w-8 h-8 text-primary-500" />
            <span>Home</span>
          </NuxtLink>
          
          <div class="flex items-center gap-2">
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="neutral"
              variant="ghost"
              @click="isDark = !isDark"
              aria-label="Toggle Theme"
            />
          </div>
        </UContainer>
      </header>

      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
=======
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- HEADER -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/ccf-logo.png" alt="Center for Children and Families" class="h-12" />
            <div class="border-l border-gray-200 pl-2">
              <p class="text-xs font-semibold text-[#0077C0] leading-tight">MCDI Percentile Calculator</p>
            </div>
          </div>


          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-[#0077C0] flex items-center justify-center">
                <span class="text-white text-sm font-semibold">JX</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700">Dr. Jingyi Xu</p>
                <p class="text-[10px] text-[#8DC63F] font-semibold uppercase tracking-wider">Admin</p>
              </div>
            </div>
            <UButton icon="i-heroicons-cog-6-tooth" variant="ghost" color="neutral" />
            <UButton variant="link" color="neutral" size="sm">Sign Out</UButton>
          </div>
        </div>
      </header>

      <!-- STEP INDICATOR -->
      <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-center">
            <template v-for="(step, i) in steps" :key="step">
              <div
                class="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
                :class="currentStep === i
                  ? 'bg-[#0077C0] text-white'
                  : currentStep > i
                    ? 'bg-[#8DC63F]/10 text-[#8DC63F]'
                    : 'bg-gray-100 text-gray-400'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  :class="currentStep === i
                    ? 'bg-white/20'
                    : currentStep > i
                      ? 'bg-[#8DC63F]/20'
                      : 'bg-gray-200'"
                >
                  <template v-if="currentStep > i">✓</template>
                  <template v-else>{{ i + 1 }}</template>
                </div>
                <span class="text-sm font-semibold">{{ step }}</span>
              </div>
              <div
                v-if="i < steps.length - 1"
                class="w-12 h-0.5 transition-colors duration-200"
                :class="currentStep > i ? 'bg-[#8DC63F]' : 'bg-gray-200'"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <main class="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">

        <!-- UPLOAD -->
        <div v-if="currentStep === 0">
          <div
            class="bg-white rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-200"
            :class="dragOver
              ? 'border-[#0077C0] bg-[#0077C0]/[0.02] scale-[1.005]'
              : 'border-gray-300 hover:border-[#0077C0] hover:shadow-md'"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            @click="fileInput?.click()"
          >
            <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />
            <div class="flex flex-col items-center gap-4">
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200"
                :class="dragOver ? 'bg-[#0077C0]/10 scale-110' : 'bg-[#0077C0]/5'"
              >
                <UIcon name="i-heroicons-arrow-up-tray" class="text-[#0077C0] text-3xl" />
              </div>
              <div>
                <p class="text-lg font-semibold text-gray-700">Drag & drop your CSV file here</p>
                <p class="text-sm text-gray-400 mt-1">or click to browse — accepts .csv files only</p>
              </div>
              <UButton
                class="mt-2 bg-[#0077C0] hover:bg-[#005a94] active:scale-95 transition-all duration-150"
                @click.stop="fileInput?.click()"
              >
                Browse Files
              </UButton>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <UIcon name="i-heroicons-information-circle" />
            <span>Select a form type from the header before uploading</span>
          </div>
        </div>

        <!-- PREVIEW -->
        <div v-if="currentStep === 1">
          <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <UIcon name="i-heroicons-check-circle" class="text-[#8DC63F] text-xl" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700">{{ fileName }}</p>
                <p class="text-xs text-gray-400">{{ fileSize }} · {{ rows.length }} records found · Validated ✓</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge v-if="selectedForm" color="info" variant="subtle">
                {{ formTypes.find(f => f.value === selectedForm)?.label || selectedForm }}
              </UBadge>
              <UBadge v-if="warningCount > 0" color="warning" variant="subtle">
                ⚠ {{ warningCount }} warning{{ warningCount > 1 ? 's' : '' }}
              </UBadge>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th
                      v-for="col in columns"
                      :key="col"
                      class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="(row, i) in rows.slice(0, 10)"
                    :key="i"
                    class="transition-colors duration-150"
                    :class="hasWarning(row) ? 'bg-yellow-50/40 hover:bg-yellow-50/70' : 'hover:bg-gray-50'"
                  >
                    <td
                      v-for="col in columns"
                      :key="col"
                      class="px-4 py-3 whitespace-nowrap"
                    >
                      <span v-if="row[col]" class="text-gray-700">{{ row[col] }}</span>
                      <span v-else class="text-gray-300 italic text-xs">empty</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
              <span class="text-xs text-gray-400">
                Showing {{ Math.min(10, rows.length) }} of {{ rows.length }} records
              </span>
              <div class="flex gap-3">
                <UButton
                  variant="outline"
                  color="neutral"
                  class="hover:bg-gray-100 active:scale-95 transition-all duration-150"
                  @click="reset"
                >
                  ← Back
                </UButton>
                <UButton
                  class="bg-[#0077C0] hover:bg-[#005a94] active:scale-95 transition-all duration-150"
                  disabled
                >
                  Calculate Percentiles →
                </UButton>
              </div>
            </div>
          </div>

          <div v-if="warningCount > 0" class="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-600" />
              <span class="text-sm font-semibold text-yellow-800">{{ warningCount }} Warning{{ warningCount > 1 ? 's' : '' }}</span>
            </div>
            <ul class="text-xs text-yellow-700 space-y-1 ml-6">
              <li v-for="w in warnings" :key="w">• {{ w }}</li>
            </ul>
          </div>
        </div>

      </main>

      <!-- FOOTER -->
      <footer class="border-t border-gray-200 bg-white mt-auto">
        <div class="max-w-[90rem] mx-auto px-6 py-6 flex items-center justify-between">
          <div class="text-xs text-gray-400">© 2026 Center for Children and Families · University of Texas at Dallas</div>
          <div class="text-xs text-gray-300">The Samuel Mogs</div>
        </div>
      </footer>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const selectedForm = ref('')
const currentStep = ref(0)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const fileSize = ref('')
const columns = ref<string[]>([])
const rows = ref<Record<string, string>[]>([])

const formTypes = [
  { label: 'SE Short Form 16-30 mo (Spanish-English)', value: 'sesf_16_30' },
  { label: 'SE Short Form 8-18 mo (Spanish-English)', value: 'sesf_8_18' },
  { label: 'English Short Form 8-18 mo', value: 'eng_sf_8_18' },
  { label: 'English Short Form 16-30 mo', value: 'eng_sf_16_30' },
  { label: 'English Long Form (Full MCDI)', value: 'eng_lf' },
  { label: 'Mandarin Long Form', value: 'mand_lf' },
]

const steps = ['Upload CSV', 'Preview Data', 'Calculate', 'Download Results']

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.name.endsWith('.csv')) processFile(file)
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  fileName.value = file.name
  fileSize.value = file.size < 1024 ? file.size + ' B' : (file.size / 1024).toFixed(1) + ' KB'

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    const lines = text.trim().split('\n')
    if (lines.length < 2) return

    columns.value = lines[0].split(',').map(h => h.trim())
    rows.value = lines.slice(1).map(line => {
      const values = line.split(',')
      const row: Record<string, string> = {}
      columns.value.forEach((h, i) => { row[h] = values[i]?.trim() || '' })
      return row
    }).filter(row => Object.values(row).some(v => v !== ''))

    currentStep.value = 1
  }
  reader.readAsText(file)
}

function hasWarning(row: Record<string, string>) {
  return columns.value.some(col => !row[col])
}

const warnings = computed(() => {
  const w: string[] = []
  rows.value.forEach((row, i) => {
    const id = row[columns.value[0]] || `Row ${i + 1}`
    columns.value.forEach(col => {
      if (!row[col]) w.push(`Record ${id}: Missing ${col}`)
    })
  })
  return w.slice(0, 10)
})

const warningCount = computed(() => warnings.value.length)

function reset() {
  currentStep.value = 0
  fileName.value = ''
  fileSize.value = ''
  columns.value = []
  rows.value = []
}
</script>
>>>>>>> Stashed changes
