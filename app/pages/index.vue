<template>
  <!-- STEP INDICATOR (Might delete or modify heavily later based on how we want the results page to be)-->
  <div class="py-4 header-border flex-center-center">
    <!-- loop through steps-->
    <template v-for="(step, i) in steps" :key="step">
      <!-- pill styling -->
      <div
        class="flex-center-center transition-ease gap-2 px-4 py-2 rounded-full"
        :class="currentStep === i
          ? 'bg-(--color-main-blue) text-white'
          : currentStep > i
            ? 'bg-(--color-confirmation-green)/10 text-(--color-confirmation-green)'
            : 'bg-gray-100 text-gray-400'"
      >
        <div
          class="flex-center-center transition-ease w-6 h-6 rounded-full text-xs font-bold"
          :class="currentStep === i
            ? 'bg-white/20'
            : currentStep > i
              ? 'bg-(--color-confirmation-green)/20'
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
        :class="currentStep > i ? 'bg-(--color-confirmation-green)' : 'bg-gray-200'"
      />
    </template>
  </div>

  <!-- MAIN CONTENT -->
  <div class="max-w-7xl mx-auto px-6 py-10 w-full">

    <!-- FORM TYPE SELECTOR (Change for another time is make this dependent on current step being 0 so it only shows on preview) -->
    <div 
      class="flex items-center gap-3 mb-8"
      v-if="currentStep < 2"
      >
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
        class="upload-box transition-ease border-dashed"
        :class="dragOver
          ? 'border-(--color-main-blue) bg-(--color-main-blue)/[0.02] scale-[1.005]'
          : 'border-gray-300 hover:border-(--color-main-blue) hover:shadow-md'"
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
            class="w-16 h-16 rounded-2xl flex-center-center transition-ease"
            :class="dragOver ? 'bg-(--color-main-blue)/10 scale-110' : 'bg-(--color-main-blue)/5'"
          >
            <UIcon name="i-heroicons-arrow-up-tray" class="text-(--color-main-blue) text-3xl" />
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-700">Drag & drop your CSV file here</p>
            <p class="text-sm text-gray-400 mt-1">or click to browse &mdash; accepts .csv files only</p>
          </div>
          <!--Open file. need .stop to make sure it only opens once due to our custom file input handler-->
          <UButton
            class="mt-2 bg-(--color-main-blue) hover:bg-(--color-off-main-blue) active:scale-95"
            @click.stop="fileInput?.click()"
          >
            Browse Files
          </UButton>
        </div>
      </div>
      <div class="mt-4 gap-2 flex-center-center footnote-text">
        <UIcon name="i-heroicons-information-circle" />
        <span>Select a form type above before uploading</span>
      </div>
    </div>

    <!-- PREVIEW -->
    <div v-if="currentStep === 1">
      <div class="white-background-border flex-center-JusBetween p-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-green-50 flex-center-center">
            <UIcon name="i-heroicons-check-circle" class="text-(--color-confirmation-green) text-xl" />
          </div>
          <!--file info-->
          <div>
            <p class="text-sm font-semibold text-gray-700">{{ fileName }}</p>
            <p class="footnote-text">{{ fileSize }} &middot; {{ rows.length }} records found &middot; Validated &#x2713;</p>
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

      <div class="white-background-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="table-header">
                <!-- gets cols-->
                <th
                  v-for="col in columns"
                  :key="col"
                  class="table-header-text"
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
        <div class="bottom-header flex-center-JusBetween">
          <!-- record count -->
          <span class="footnote-text">
            Showing {{ Math.min(10, rows.length) }} of {{ rows.length }} records
          </span>
          <!--reset if going back-->
          <div class="flex gap-3">
            <UButton
              class="back-button"
              @click="reset"
            >
              &larr; Back
            </UButton>
            <!-- Enabled for now not actually calculating -> CHANGE LATER!!!!!!!!-->
            <UButton
              class="forward-button"
              @click="calculateData"
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

    <!-- CALCULATING (CURRENTLY JUST FAKE LOADING SCREEN) -->
    <div v-if="currentStep === 2">
      <div class="white-background-border p-4 mb-6 flex-center-center">
        <p v-if="!dataCalcFin" class="text-xl font-semibold text-gray-700">Calculating - Please wait</p>
        <p v-if= "dataCalcFin" class="text-xl font-semibold text-gray-700">Finished Calculating</p>
      </div>

      <!-- Bottom outline with Back/Forward buttons -->
      <div class="white-background-border overflow-hidden">
        <div class="bottom-header flex items-center justify-end gap-3">
          <!-- sends user back to first page -->
          <UButton class="back-button"
                    @click="reset">
            &larr; Back
          </UButton>

          <!-- progress forward button (when data is ready to present) -->
          <UButton class="forward-button"
                    :disabled="!dataCalcFin"
                    @click="displayData">
            <p v-if="dataCalcFin" class="text-gray-700">View data &rarr;</p>
            <p v-if="!dataCalcFin" class="text-gray-700">Please Wait</p>
          </UButton>
        </div>
      </div>
    </div>
    
    <!-- SHOW CALCULATED DATA (CURRENTLY JUST LISTS DATA AGAIN NO CALC RN)-->
    <div v-if="currentStep === 3">
      <div class="white-background-border flex-center-center p-3 mb-3">
        <p class="text-gray-700 text-3xl">Results</p>
      </div>

      <div class="white-background-border overflow-hidden">
        <div class="overflow-x-auto overflow-y-auto" style="height:62vh">
          <table class="w-full text-sm">
            <thead>
              <tr class="table-header">
                <!-- first column of checkboxes-->
                <th class="table-header-text">
                  <p class="flex text-center">
                    Select <br /> all
                    <!-- CHECK BOXES NOT FUNCTIONAL YET -->
                    <input type="checkbox" checked style="margin-inline:10px" />
                  </p>
                </th>

                <!-- gets cols-->
                <th v-for="col in columns"
                    :key="col"
                    class="table-header-text">
                  {{ col }}
                </th>
              </tr>
            </thead>

            <!--gets rows -->
            <tbody class="divide-y divide-gray-100">

              <tr v-for="(row, i) in rows"
                  :key="i"
                  class="transition-colors duration-150"
                  :class="hasWarning(row) ? 'bg-yellow-50/40 hover:bg-yellow-50/70' : 'hover:bg-gray-50'">
                <td>
                  <!-- check boxes for each row (NOT FUNCTIONAL YET) -->
                  <div style="position:relative; left:35%">
                    <input type="checkbox" checked style="width: 15px; height: 15px" />
                  </div>
                </td>

                <td v-for="col in columns"
                    :key="col"
                    class="px-4 py-3 whitespace-nowrap">
                  <span v-if="row[col]" class="text-gray-700">{{ row[col] }}</span>
                  <span v-else class="text-gray-300 italic text-xs">empty</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!--bottom row-->
        <div class="white-background-border bottom-header flex-center-JusBetween">
          <UButton class="back-button"
                    @click="reset">
            &larr; Back home
          </UButton>

          <!-- download buttons for word/excel (NOT FUNCTIONAL) -->
          <div class="flex-center-center gap-2">
            <UButton class="bg-(--color-main-blue) hover:bg-(--color-main-blue)/80">
              Download Selected Word Documents
            </UButton>

            <UButton>
              Download Data Excel
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './assets/css/main.css'

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
//checker to see if data calculation is ready to display (activates continue button from page 3->4)
const dataCalcFin = ref(false)

//dropdown options
const formTypes = [
  { label: 'SE Short Form 16-30 mo (Spanish-English)', value: 'sesf_16_30' },
  { label: 'SE Short Form 8-18 mo (Spanish-English)', value: 'sesf_8_18' },
  { label: 'English Short Form 8-18 mo', value: 'eng_sf_8_18' },
  { label: 'English Short Form 16-30 mo', value: 'eng_sf_16_30' },
  { label: 'English Long Form (Full MCDI)', value: 'eng_lf' },
  { label: 'Mandarin Long Form', value: 'mand_lf' },
]

//step labels
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
    const headerLine = lines[0]
    if (!headerLine) return
    columns.value = headerLine.split(',').map(h => h.trim())
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

//calculate data (CURRENTLY USED JUST TO INCREMENT CURRENTSTEP TO GET TO NEW PAGE AND TEST LOADING SCREEN)
function calculateData() {
  currentStep.value = 2

  //simulate a 1 sec wait/buffer before data is ready to present
  setTimeout(() => {
    dataCalcFin.value = true;
  }, 1000)

}

//format calculated data for last page (CURRENTLY USED JUST TO INCREMENT CURRENTSTEP TO GET TO LAST PAGE)
function displayData() {
  currentStep.value = 3
}

//runs when rows or columns change
const warnings = computed(() => {
  //collect warning strings
  const w: string[] = []
  //loop through to determine what's missing
  rows.value.forEach((row, i) => {
    const firstCol = columns.value[0]
    const id = firstCol ? row[firstCol] : `Row ${i + 1}`
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
  dataCalcFin.value = false
}
</script>