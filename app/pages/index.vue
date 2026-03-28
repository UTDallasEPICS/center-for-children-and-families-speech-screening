<template>
  <div>
    <!-- STEP INDICATOR (Might delete or modify heavily later based on how we want the results page to be)-->
    <div class="header-border flex-center-center py-4">
      <!-- loop through steps-->
      <template v-for="(step, i) in steps" :key="step">
        <!-- pill styling -->
        <div
          class="flex-center-center transition-ease gap-2 rounded-full px-4 py-2"
          :class="
            currentStep === i
              ? 'bg-main-blue text-white'
              : currentStep > i
                ? 'bg-confirmation-green/10 text-confirmation-green'
                : 'bg-gray-100 text-gray-400'
          "
        >
          <div
            class="flex-center-center transition-ease h-6 w-6 rounded-full text-xs font-bold"
            :class="
              currentStep === i
                ? 'bg-white/20'
                : currentStep > i
                  ? 'bg-confirmation-green/20'
                  : 'bg-gray-200'
            "
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
          class="h-0.5 w-12 transition-colors duration-200"
          :class="currentStep > i ? 'bg-confirmation-green' : 'bg-gray-200'"
        />
      </template>
    </div>

    <!-- MAIN CONTENT -->
    <div class="mx-auto w-full max-w-7xl px-6 py-10">
      <!-- FORM TYPE SELECTOR (Change for another time is make this dependent on current step being 0 so it only shows on preview) -->
      <div class="mb-8 flex items-center gap-3" v-if="currentStep < 2">
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
          class="cursor-pointer rounded-2xl border-2 border-dashed bg-white p-16 text-center transition-all duration-200"
          :class="
            dragOver
              ? 'scale-[1.005] border-[#0077C0] bg-[#0077C0]/[0.02]'
              : 'border-gray-300 hover:border-[#0077C0] hover:shadow-md'
          "
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          @click="fileInput?.click()"
        >
          <!-- handle selected file with custom handle and hide default -->
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="flex flex-col items-center gap-4">
            <!-- drag over styling for the rounded square in the middle -->
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200"
              :class="dragOver ? 'scale-110 bg-[#0077C0]/10' : 'bg-[#0077C0]/5'"
            >
              <UIcon name="i-heroicons-arrow-up-tray" class="text-3xl text-[#0077C0]" />
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-700">Drag & drop your CSV file here</p>
              <p class="mt-1 text-sm text-gray-400">
                or click to browse &mdash; accepts .csv files only
              </p>
            </div>
            <!--Open file. need .stop to make sure it only opens once due to our custom file input handler-->
            <UButton
              class="mt-2 bg-[#0077C0] transition-all duration-150 hover:bg-[#005a94] active:scale-95"
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
        <div class="white-background-border flex-center-JusBetween mb-6 p-4">
          <div class="flex items-center gap-3">
            <div class="flex-center-center h-10 w-10 rounded-lg bg-green-50">
              <UIcon name="i-heroicons-check-circle" class="text-confirmation-green text-xl" />
            </div>
            <!--file info-->
            <div>
              <p class="text-sm font-semibold text-gray-700">{{ fileName }}</p>
              <p class="footnote-text">
                {{ fileSize }} &middot; {{ rows.length }} records found &middot; Validated &#x2713;
              </p>
            </div>
          </div>
          <!--show badge based on warning-->
          <div class="flex items-center gap-2">
            <UBadge v-if="selectedForm" color="info" variant="subtle">
              {{ formTypes.find((f) => f.value === selectedForm)?.label || selectedForm }}
            </UBadge>
            <UBadge v-if="warningCount > 0" color="warning" variant="subtle">
              &#x26A0; {{ warningCount }} warning{{ warningCount > 1 ? 's' : '' }}
            </UBadge>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <!-- gets cols-->
                  <th
                    v-for="col in columns"
                    :key="col"
                    class="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase"
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
                  :class="
                    hasWarning(row) ? 'bg-yellow-50/40 hover:bg-yellow-50/70' : 'hover:bg-gray-50'
                  "
                >
                  <td v-for="col in columns" :key="col" class="px-4 py-3 whitespace-nowrap">
                    <span v-if="row[col]" class="text-gray-700">{{ row[col] }}</span>
                    <span v-else class="text-xs text-gray-300 italic">empty</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3"
          >
            <!-- record count -->
            <span class="text-xs text-gray-400">
              Showing {{ Math.min(10, rows.length) }} of {{ rows.length }} records
            </span>
            <!--reset if going back-->
            <div class="flex gap-3">
              <UButton
                variant="outline"
                color="neutral"
                class="transition-all duration-150 hover:bg-gray-100 active:scale-95"
                @click="reset"
              >
                &larr; Back
              </UButton>
              <!-- Enabled for now not actually calculating -> CHANGE LATER!!!!!!!!-->
              <UButton
                class="bg-[#40e191] transition-all duration-150 hover:bg-[#33b474] active:scale-95"
                @click="calculateData"
              >
                Calculate Percentiles &rarr;
              </UButton>
            </div>
          </div>
        </div>

        <!-- if warnings exist show error panel-->
        <div
          v-if="warningCount > 0"
          class="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
        >
          <div class="mb-2 flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-600" />
            <span class="text-sm font-semibold text-yellow-800"
              >{{ warningCount }} Warning{{ warningCount > 1 ? 's' : '' }}</span
            >
          </div>
          <ul class="ml-6 space-y-1 text-xs text-yellow-700">
            <li v-for="w in warnings" :key="w">&bull; {{ w }}</li>
          </ul>
        </div>
      </div>

      <!-- CALCULATING (CURRENTLY JUST FAKE LOADING SCREEN) -->
      <div v-if="currentStep === 2">
        <div
          class="mb-6 flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4"
        >
          <p v-if="!dataCalcFin" class="text-xl font-semibold text-gray-700">
            Calculating - Please wait
          </p>
          <p v-if="dataCalcFin" class="text-xl font-semibold text-gray-700">Finished Calculating</p>
        </div>

        <!-- Bottom outline with Back/Forward buttons -->
        <div class="white-background-border overflow-hidden">
          <div class="bottom-header flex items-center justify-end gap-3">
            <!-- sends user back to first page -->
            <UButton class="back-button" @click="reset"> &larr; Back </UButton>

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
        <div class="mb-3 justify-center rounded-xl border border-gray-200 bg-white p-3 text-center">
          <p class="text-3xl text-gray-700">Results</p>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div class="overflow-x-auto overflow-y-auto" style="height: 62vh">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <!-- first column of checkboxes-->
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase"
                  >
                    <p class="flex text-center">
                      Select <br />
                      all
                      <!-- CHECK BOXES NOT FUNCTIONAL YET -->
                      <input type="checkbox" checked style="margin-inline: 10px" />
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
                <tr
                  v-for="(row, i) in rows"
                  :key="i"
                  class="transition-colors duration-150"
                  :class="
                    hasWarning(row) ? 'bg-yellow-50/40 hover:bg-yellow-50/70' : 'hover:bg-gray-50'
                  "
                >
                  <td>
                    <!-- check boxes for each row (NOT FUNCTIONAL YET) -->
                    <div style="position: relative; left: 35%">
                      <input type="checkbox" checked style="width: 15px; height: 15px" />
                    </div>
                  </td>
                  <td v-for="col in columns" :key="col" class="px-4 py-3 whitespace-nowrap">
                    <span v-if="row[col]" class="text-gray-700">{{ row[col] }}</span>
                    <span v-else class="text-xs text-gray-300 italic">empty</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!--bottom row-->
          <div class="white-background-border bottom-header flex-center-JusBetween">
            <UButton class="back-button" @click="reset"> &larr; Back home </UButton>
            <!-- download buttons for word/excel -->
            <div class="mx-auto flex items-center gap-20">
              <UButton class="bg-[#3591d1] hover:bg-[#68addd]" @click="generateReports">
                Download Selected Word Documents
              </UButton>
              <UButton @click="generateExcel"> Download Data Excel </UButton>
            </div>
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
  //stores processed data returned from the calculate endpoint
  const outputRows = ref<any[]>([])
  //tracks which rows are selected via checkboxes for word doc download
  const selectedRows = ref<Set<number>>(new Set())
  //dropdown options
  const formTypes = [
    { label: 'English Short Form 8-18 mo', value: 'engSF_8_18' },
    { label: 'English Short Form 16-30 mo', value: 'engSF_16_30' },
    { label: 'SE Short Form 8-18 mo (Spanish-English)', value: 'SE_8_18' },
    { label: 'SE Short Form 16-30 mo (Spanish-English)', value: 'SE_16_30' },
    { label: 'ME 8-18 mo (Mandarin-English)', value: 'ME_8_18' },
    { label: 'ME 16-30 mo (Mandarin-English)', value: 'ME_16_30' },
    { label: 'English + Other Language 8-18 mo', value: 'engOther_8_18' },
    { label: 'English + Other Language 16-30 mo', value: 'engOther_16_30' },
  ]

  //step labels
  const steps = ['Upload CSV', 'Preview Data', 'Calculate', 'Download Results']

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
          engSF_8_18: 'engSF8-18',
          engSF_16_30: 'engSF16-30',
          SE_8_18: 'SE8-18',
          SE_16_30: 'SE16-30',
          ME_8_18: 'ME8-18',
          ME_16_30: 'ME16-30',
          engOther_8_18: 'engOther8-18',
          engOther_16_30: 'engOther16-30',
        }
        //grab the sheet matching the selected form type, fall back to first sheet if not found
        const sheetName = sheetMap[selectedForm.value] ?? workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName as string]
        if (!sheet) {
          console.error(`Sheet "${sheetName}" not found in workbook`)
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
    if (lines.length < 2) return
    //get and split column and row info for each
    const headerLine = lines[0]
    if (!headerLine) return
    columns.value = headerLine.split(',').map((h) => h.trim())
    //skip row 2 if xlsx (the "for percentile calculation" label row in the Excel input template)
    const dataLines = skipSecondRow ? lines.slice(2) : lines.slice(1)
    rows.value = dataLines
      .map((line) => {
        const values = line.split(',')
        //object for keeping track of all rows
        const row: Record<string, string> = {}
        columns.value.forEach((h, i) => {
          row[h] = values[i]?.trim() || ''
        })
        return row
      })
      .filter((row) => Object.values(row).some((v) => v !== '')) //filter out rows with absolutely nothing

    //update wizard
    currentStep.value = 1
  }

  //decide if row should be warned about in displayed dataset
  function hasWarning(row: Record<string, string>) {
    return columns.value.some((col) => !row[col])
  }

  //calls the calculate endpoint, stores processed data in outputRows
  async function calculateData() {
    currentStep.value = 2

    try {
      const response = (await $fetch('/api/mcdi/calculate', {
        method: 'POST',
        body: {
          formType: selectedForm.value,
          rows: rows.value,
          columns: columns.value,
        },
      })) as any //get rid of once we establish proper types
      outputRows.value = response.outputRows || []
      //select all rows by default so all checkboxes start checked
      selectedRows.value = new Set(outputRows.value.map((_: any, i: number) => i))
    } catch (err) {
      console.error('Calculate failed:', err)
    }

    dataCalcFin.value = true
  }

  //format calculated data for last page
  function displayData() {
    currentStep.value = 3
  }

  //sends selected rows to backend to generate .docx reports as a zip
  async function generateReports() {
    try {
      const response = (await $fetch('/api/mcdi/generate-reports', {
        method: 'POST',
        body: {
          formType: selectedForm.value,
          selectedIndices: [...selectedRows.value],
          outputRows: outputRows.value,
        },
      })) as any
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
    }
  }

  //sends processed data to backend to generate a .xlsx file
  async function generateExcel() {
    try {
      const response = (await $fetch('/api/mcdi/generate-excel', {
        method: 'POST',
        body: {
          formType: selectedForm.value,
          outputRows: outputRows.value,
        },
      })) as any
      //convert base64 back to a blob and trigger browser download
      const bytes = atob(response.base64)
      const byteArray = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) byteArray[i] = bytes.charCodeAt(i)
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Generate excel failed:', err)
    }
  }

  //runs when rows or columns change
  const warnings = computed(() => {
    //collect warning strings
    const w: string[] = []
    //loop through to determine what's missing
    rows.value.forEach((row, i) => {
      const firstCol = columns.value[0]
      const id = firstCol ? row[firstCol] : `Row ${i + 1}`
      columns.value.forEach((col) => {
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
    outputRows.value = []
    selectedRows.value = new Set()
  }
</script>
