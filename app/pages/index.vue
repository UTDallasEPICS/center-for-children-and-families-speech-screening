<template>
  <div>
    <!-- STEP INDICATOR (Might delete or modify heavily later based on how we want the results page to be)-->
    <div class="py-4 header-border flex-center-center">
      <!-- loop through steps-->
      <template v-for="(step, i) in steps" :key="step">
        <!-- pill styling -->
        <div
          class="flex-center-center transition-ease gap-2 px-4 py-2 rounded-full"
          :class="currentStep === i
            ? 'bg-main-blue text-white'
            : currentStep > i
              ? 'bg-confirmation-green/10 text-confirmation-green'
              : 'bg-gray-100 text-gray-400'"
        >
          <div
            class="flex-center-center transition-ease w-6 h-6 rounded-full text-xs font-bold"
            :class="currentStep === i
              ? 'bg-white/20'
              : currentStep > i
                ? 'bg-confirmation-green/20'
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
          :class="currentStep > i ? 'bg-confirmation-green' : 'bg-gray-200'"
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
          <input ref="fileInput" type="file" accept=".csv,.xlsx" class="hidden" @change="handleFileSelect" />
          <div class="flex flex-col items-center gap-4">
            <!-- drag over styling for the rounded square in the middle -->
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200"
              :class="dragOver ? 'bg-[#0077C0]/10 scale-110' : 'bg-[#0077C0]/5'"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="text-[#0077C0] text-3xl" />
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-700">Drag & drop your CSV or Excel file here</p>
              <p class="text-sm text-gray-400 mt-1">or click to browse &mdash; accepts .csv and .xlsx files</p>
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
        <div class="white-background-border flex-center-JusBetween p-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex-center-center">
              <UIcon name="i-heroicons-check-circle" class="text-confirmation-green text-xl" />
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
            <UBadge v-if="validationResult === true" color="success" variant="subtle">
              &#x2713; Valid Structure
            </UBadge>
            <UBadge v-else color="error" variant="subtle">
              &#x26A0; Form Mismatch
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
                  class="transition-colors duration-150 hover:bg-gray-50"
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
              <!-- Enabled for now not actually calculating -> CHANGE LATER!!!!!!!!-->
              <UButton
                class="bg-[#40e191] hover:bg-[#33b474] active:scale-95 transition-all duration-150"
                :disabled="validationResult !== true"
                @click ="calculateData"
              >
                Calculate Percentiles &rarr;
              </UButton>
            </div>
          </div>
        </div>

        <!-- if validation errors exist show error panel-->
        <div v-if="validationResult !== true" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-red-600 text-lg" />
            <span class="text-sm font-semibold text-red-800">Form Mismatch</span>
          </div>
          <p class="text-sm text-red-700 ml-7">
            The uploaded file does not comply with the selected form type. It appears to have the <strong>{{ (validationResult as string[]).join(' and ') }}</strong> for this form.
          </p>
        </div>
      </div>

      <!-- CALCULATING (CURRENTLY JUST FAKE LOADING SCREEN) -->
      <div v-if="currentStep === 2">
        <div class="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center mb-6">
          <div v-if="!dataCalcFin" class="flex items-center">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin text-main-blue text-2xl mr-3" />
            <p class="text-xl font-semibold text-gray-700">Calculating - Please wait</p>
          </div>
          <div v-if="dataCalcFin" class="flex items-center">
            <UIcon name="i-heroicons-check-circle" class="text-confirmation-green text-2xl mr-3" />
            <p class="text-xl font-semibold text-gray-700">Finished Calculating</p>
          </div>
        </div>

        <!-- Bottom outline with Back/Forward buttons -->
        <div class="white-background-border overflow-hidden">
          <div class="bottom-header flex items-center justify-end gap-3">
            <!-- sends user back to first page -->
            <UButton class="back-button" @click="reset">
              &larr; Back
            </UButton>

            <!-- progress forward button (when data is ready to present) -->
            <UButton class="forward-button" :disabled="!dataCalcFin" @click="displayData">
              <p v-if="dataCalcFin" class="text-gray-700">View data &rarr;</p>
              <p v-if="!dataCalcFin" class="text-gray-700">Please Wait</p>
            </UButton>
          </div>
        </div>
      </div>

      <!-- SHOW CALCULATED DATA (CURRENTLY JUST LISTS DATA AGAIN NO CALC RN)-->
      <div v-if="currentStep === 3">
        <div class="bg-white border border-gray-200 rounded-xl text-center justify-center p-3 mb-3">
          <p class="text-gray-700 text-3xl">Results</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto overflow-y-auto" style="height:62vh">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <!-- first column of checkboxes-->
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <p class="flex text-center">
                      Select <br /> all
                      <!-- CHECK BOXES NOT FUNCTIONAL YET -->
                      <input type="checkbox" checked style="margin-inline:10px" />
                    </p>
                  </th>
                  <!-- gets cols-->
                  <th v-for="col in columns" :key="col" class="table-header-text">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <!--gets rows -->
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(row, i) in rows" :key="i"
                    class="transition-colors duration-150 hover:bg-gray-50">
                  <td>
                    <!-- check boxes for each row (NOT FUNCTIONAL YET) -->
                    <div style="position:relative; left:35%">
                      <input type="checkbox" checked style="width: 15px; height: 15px" />
                    </div>
                  </td>
                  <td v-for="col in columns" :key="col" class="px-4 py-3 whitespace-nowrap">
                    <span v-if="row[col]" class="text-gray-700">{{ row[col] }}</span>
                    <span v-else class="text-gray-300 italic text-xs">empty</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!--bottom row-->
          <div class="white-background-border bottom-header flex-center-JusBetween">
            <UButton class="back-button" @click="reset">
              &larr; Back home
            </UButton>
            <!-- download buttons for word/excel -->
            <div class="flex items-center gap-20 mx-auto">
              <UButton class="bg-[#3591d1] hover:bg-[#68addd]" :loading="isDownloadingReports" @click="generateReports">
                Download Selected Word Documents
              </UButton>
              <UButton :loading="isDownloadingExcel" @click="generateExcel">
                Download Data Excel
              </UButton>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { validateFormData } from '~/utils/form-validation'
import './assets/css/main.css'

const toast = useToast()

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
//stores processed data returned from the calculate endpoint
const outputRows = ref<any[]>([])
//tracks which rows are selected via checkboxes for word doc download
const selectedRows = ref<Set<number>>(new Set())
//tracks loading state for downloads
const isDownloadingReports = ref(false)
const isDownloadingExcel = ref(false)
//dropdown options
const formTypes = [
  { label: 'English Only 8-18 mo', value: 'engSF_8_18' },
  { label: 'English Only 19-30 mo', value: 'engSF_16_30' },
  { label: 'Spanish-English 8-18 mo', value: 'SE_8_18' },
  { label: 'Spanish-English 19-30 mo', value: 'SE_16_30' },
  { label: 'Mandarin-English 8-18 mo', value: 'ME_8_18' },
  { label: 'Mandarin-English 19-30 mo', value: 'ME_16_30' },
  { label: 'DNE 8-18 mo', value: 'engOther_8_18' },
  { label: 'DNE 19-30 mo', value: 'engOther_16_30' },
]

//step labels
const steps = ['Upload File', 'Preview Data', 'Calculate', 'Download Results']

//for dropping file
function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  //error handling needed for different files
  if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) processFile(file)
}

//for clicking file
function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

//Processes file — converts xlsx to csv if needed, then parses for preview
function processFile(file: File) {
  if (!selectedForm.value) {
    toast.add({
      title: 'No form type selected',
      description: 'Please select a form type before uploading your CSV/Excel file.',
      color: 'error'
    })
    return
  }

  fileName.value = file.name
  //maybe add error handling for filesize? Accidentally putting large files breaks application
  fileSize.value = file.size < 1024 ? file.size + ' B' : (file.size / 1024).toFixed(1) + ' KB'

  const reader = new FileReader()

  if (file.name.endsWith('.xlsx')) {
    //read xlsx as binary, convert to csv using SheetJS, then run through normal csv parsing
    reader.onload = async (e) => {
      const { read, utils } = await import('xlsx')
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = read(data, { type: 'array' })
      //map form type to the correct sheet name in the input Excel template
      const sheetMap: Record<string, string> = {
        engSF_8_18:    'engSF8-18',
        engSF_16_30:   'engSF19-30',
        SE_8_18:       'SE8-18',
        SE_16_30:      'SE19-30',
        ME_8_18:       'ME8-18',
        ME_16_30:      'ME19-30',
        engOther_8_18: 'engOther8-18',
        engOther_16_30:'engOther19-30',
      }
      //grab the sheet matching the selected form type, fall back to first sheet if not found
      let sheetName = sheetMap[selectedForm.value]
      let sheet = sheetName ? workbook.Sheets[sheetName] : undefined
      
      if (!sheet && workbook.SheetNames.length > 0) {
        sheetName = workbook.SheetNames[0]
        sheet = workbook.Sheets[sheetName]
      }

      if (!sheet) {
        console.error(`No sheets found in workbook`)
        toast.add({ title: 'Invalid File', description: 'No sheets found in the Excel workbook.', color: 'error' })
        return
      }
      //convert to csv string — SheetJS handles date formatting etc
      const csv = utils.sheet_to_csv(sheet as NonNullable<typeof sheet>)
      parseCSVText(csv, true)
    }
    reader.readAsArrayBuffer(file)
  } else {
    //file reader logic for csv
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSVText(text, false)
    }
    reader.readAsText(file)
  }
}

//shared csv parsing logic used for both native csv and xlsx-converted-to-csv
//skipSecondRow: true for xlsx input templates which have a label row after headers
function parseCSVText(text: string, skipSecondRow: boolean) {
  //grab info and trim
  const lines = text.trim().split('\n')
  //no headers!
  if (lines.length < 2) {
    toast.add({ title: 'Empty File', description: 'The uploaded file does not contain enough data.', color: 'error' })
    return
  }
  //get and split column and row info for each
  const headerLine = lines[0]
  if (!headerLine) return
  columns.value = headerLine.split(',').map(h => h.trim())
  //skip row 2 if xlsx (the "for percentile calculation" label row in the Excel input template)
  const dataLines = skipSecondRow ? lines.slice(2) : lines.slice(1)
  const parsedRows = dataLines.map(line => {
    const values = line.split(',')
    //object for keeping track of all rows
    const row: Record<string, string> = {}
    columns.value.forEach((h, i) => { row[h] = values[i]?.trim() || '' })
    return row
  }).filter(row => Object.values(row).some(v => v !== '')) //filter out rows with absolutely nothing

  rows.value = parsedRows
  //update wizard
  currentStep.value = 1
}

// compute validation dynamically so changing the dropdown re-evaluates
const validationResult = computed(() => {
  if (!selectedForm.value || rows.value.length === 0) return true
  return validateFormData(selectedForm.value, rows.value)
})



//calls the calculate endpoint, stores processed data in outputRows
async function calculateData() {
  currentStep.value = 2

  try {
    const response = await $fetch('/api/mcdi/calculate', {
      method: 'POST',
      body: {
        formType: selectedForm.value,
        rows: rows.value,
        columns: columns.value,
      },
    }) as any //get rid of once we establish proper types
    outputRows.value = response.outputRows || []
    //select all rows by default so all checkboxes start checked
    selectedRows.value = new Set(outputRows.value.map((_: any, i: number) => i))
  } catch (err) {
    console.error('Calculate failed:', err)
  }

  dataCalcFin.value = true

  // Automatically jump to the download results after a short delay
  setTimeout(() => {
    if (currentStep.value === 2) {
      displayData()
    }
  }, 600)
}

//format calculated data for last page
function displayData() {
  currentStep.value = 3
}

//sends selected rows to backend to generate .docx reports as a zip
async function generateReports() {
  isDownloadingReports.value = true
  try {
    const response = await $fetch('/api/mcdi/generate-reports', {
      method: 'POST',
      body: {
        formType: selectedForm.value,
        selectedIndices: [...selectedRows.value],
        outputRows: outputRows.value,
      },
    }) as any
    //convert base64 back to a blob and trigger browser download
    const bytes = atob(response.base64)
    const byteArray = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) byteArray[i] = bytes.charCodeAt(i)
    const blob = new Blob([byteArray], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = response.fileName
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Generate reports failed:', err)
  } finally {
    isDownloadingReports.value = false
  }
}

//sends processed data to backend to generate a .xlsx file
async function generateExcel() {
  isDownloadingExcel.value = true
  try {
    const response = await $fetch('/api/mcdi/generate-excel', {
      method: 'POST',
      body: {
        formType: selectedForm.value,
        outputRows: outputRows.value,
      },
    }) as any
    //convert base64 back to a blob and trigger browser download
    const bytes = atob(response.base64)
    const byteArray = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) byteArray[i] = bytes.charCodeAt(i)
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = response.fileName
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Generate excel failed:', err)
  } finally {
    isDownloadingExcel.value = false
  }
}



function reset() {
  currentStep.value = 0
  fileName.value = ''
  fileSize.value = ''
  columns.value = []
  rows.value = []
  dataCalcFin.value = false
  outputRows.value = []
  selectedRows.value = new Set()
}
</script>