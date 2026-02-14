<template>
  <div>
    <!-- STEP INDICATOR (Might delete or modify heavily later based on how we want the results page to be)-->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-center">
          <!-- loop through steps-->
          <template v-for="(step, i) in steps" :key="step">
            <!-- pill styling -->
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
              <!-- check or num -->
                <template v-if="currentStep > i">&#x2713;</template>
                <template v-else>{{ i + 1 }}</template>
              </div>
              <span class="text-sm font-semibold">{{ step }}</span>
            </div>
            <!-- connector styling -->
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
    <div class="max-w-7xl mx-auto px-6 py-10 w-full">

      <!-- FORM TYPE SELECTOR (Change for another time is make this dependent on current step being 0 so it only shows on preview) -->
      <div class="flex items-center gap-3 mb-8">
        <label class="text-sm font-medium text-gray-500">Form Type:</label>
        <!-- Update form selection-->
        <USelect
          v-model="selectedForm"
          :items="formTypes"
          placeholder="Select MCDI Form..."
          class="min-w-[280px]"
        />
      </div>

      <!-- UPLOAD -->
      <div v-if="currentStep === 0">
        <!--Dropzone style event handlers -->
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
          <!-- handle selected file with custom handle and hide default -->
          <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />
          <div class="flex flex-col items-center gap-4">
            <!-- drag over styling for the rounded square in the middle -->
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200"
              :class="dragOver ? 'bg-[#0077C0]/10 scale-110' : 'bg-[#0077C0]/5'"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="text-[#0077C0] text-3xl" />
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-700">Drag & drop your CSV file here</p>
              <p class="text-sm text-gray-400 mt-1">or click to browse &mdash; accepts .csv files only</p>
            </div>
            <!--Open file. need .stop to make sure it only opens once due to our custom file input handler-->
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
          <span>Select a form type above before uploading</span>
        </div>
      </div>

      <!-- PREVIEW -->
      <div v-if="currentStep === 1">
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="text-[#8DC63F] text-xl" />
            </div>
            <!--file info-->
            <div>
              <p class="text-sm font-semibold text-gray-700">{{ fileName }}</p>
              <p class="text-xs text-gray-400">{{ fileSize }} &middot; {{ rows.length }} records found &middot; Validated &#x2713;</p>
            </div>
          </div>
          <!--show badge based on warning-->
          <div class="flex items-center gap-2">
            <UBadge v-if="selectedForm" color="info" variant="subtle">
              {{ formTypes.find(f => f.value === selectedForm)?.label || selectedForm }}
            </UBadge>
            <UBadge v-if="warningCount > 0" color="warning" variant="subtle">
              &#x26A0; {{ warningCount }} warning{{ warningCount > 1 ? 's' : '' }}
            </UBadge>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <!-- gets cols-->
                  <th
                    v-for="col in columns"
                    :key="col"
                    class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <!--gets rows -->
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
            <!-- record count -->
            <span class="text-xs text-gray-400">
              Showing {{ Math.min(10, rows.length) }} of {{ rows.length }} records
            </span>
            <!--reset if going back-->
            <div class="flex gap-3">
              <UButton
                variant="outline"
                color="neutral"
                class="hover:bg-gray-100 active:scale-95 transition-all duration-150"
                @click="reset"
              >
                &larr; Back
              </UButton>
              <!-- Disabled for now but CHANGE LATER!!!!!!!!-->
              <UButton
                class="bg-[#0077C0] hover:bg-[#005a94] active:scale-95 transition-all duration-150"
                disabled
              >
                Calculate Percentiles &rarr;
              </UButton>
            </div>
          </div>
        </div>

        <!-- if warnings exist show error panel-->
        <div v-if="warningCount > 0" class="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-600" />
            <span class="text-sm font-semibold text-yellow-800">{{ warningCount }} Warning{{ warningCount > 1 ? 's' : '' }}</span>
          </div>
          <ul class="text-xs text-yellow-700 space-y-1 ml-6">
            <li v-for="w in warnings" :key="w">&bull; {{ w }}</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">

//MCDI form
const selectedForm = ref('')
//what step we're on
const currentStep = ref(0)
//checker to see if a user is dragging a file over the dropzone
const dragOver = ref(false)
//handler for clicking dropzone or file button
const fileInput = ref<HTMLInputElement | null>(null)
//File information based on inputted csv
const fileName = ref('')
const fileSize = ref('')
const columns = ref<string[]>([])
const rows = ref<Record<string, string>[]>([])

//dropdown options
const formTypes = [
  { label: 'SE Short Form 16-30 mo (Spanish-English)', value: 'sesf_16_30' },
  { label: 'SE Short Form 8-18 mo (Spanish-English)', value: 'sesf_8_18' },
  { label: 'English Short Form 8-18 mo', value: 'eng_sf_8_18' },
  { label: 'English Short Form 16-30 mo', value: 'eng_sf_16_30' },
  { label: 'English Long Form (Full MCDI)', value: 'eng_lf' },
  { label: 'Mandarin Long Form', value: 'mand_lf' },
]

//step lablels
const steps = ['Upload CSV', 'Preview Data', 'Calculate', 'Download Results']

//for dropping file
function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  //error handling needed for different files
  if (file && file.name.endsWith('.csv')) processFile(file)
}

//for clicking file
function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

//Processes file
function processFile(file: File) {
  fileName.value = file.name
  //maybe add error handling for filesize? Accidentally putting large files breaks application
  fileSize.value = file.size < 1024 ? file.size + ' B' : (file.size / 1024).toFixed(1) + ' KB'

  //file reader logic
  const reader = new FileReader()
  //listener for when we've read the data
  reader.onload = (e) => {
    //grab info and trim
    const text = e.target?.result as string
    const lines = text.trim().split('\n')
    //no headers!
    if (lines.length < 2) return
    //get and split column and row info for each
    columns.value = lines[0].split(',').map(h => h.trim())
    rows.value = lines.slice(1).map(line => {
      const values = line.split(',')
      //object for keeping track of all rows
      const row: Record<string, string> = {}
      columns.value.forEach((h, i) => { row[h] = values[i]?.trim() || '' })
      return row
    }).filter(row => Object.values(row).some(v => v !== '')) //filter out rows with absolutely nothing

    //update wizard (delete if not keeping)
    currentStep.value = 1
  }
  reader.readAsText(file)
}

//decide if row should be warned about in displayed dataset 
function hasWarning(row: Record<string, string>) {
  return columns.value.some(col => !row[col])
}

//runs when rows or columsn change
const warnings = computed(() => {
  //collect warning strings
  const w: string[] = []
  //loop through to determine what's missing
  rows.value.forEach((row, i) => {
    const id = row[columns.value[0]] || `Row ${i + 1}`
    columns.value.forEach(col => {
      if (!row[col]) w.push(`Record ${id}: Missing ${col}`)
    })
  })
  //only return 10
  return w.slice(0, 10)
})

//Call to warnings.value.length more nicely :)
const warningCount = computed(() => warnings.value.length)

function reset() {
  currentStep.value = 0
  fileName.value = ''
  fileSize.value = ''
  columns.value = []
  rows.value = []
}
</script>
