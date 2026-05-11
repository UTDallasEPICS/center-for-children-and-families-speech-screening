<template>
  <div v-if="PNModalShow" class="modal-overlay" @click.self="close">
    <div class="modal" style="width:75vh">
      <div class="flex-center-JusBetween">
        <p class="px-6 font-semibold"> Please input the program name </p>
        <UButton icon="i-heroicons-x-circle"
                 color="error"
                 variant="solid"
                 class="rounded-xl px-1 py-1"
                 @click="close" />
      </div>

      <textarea :value="programName"
                @input="handleInput"
                :placeholder="programName ? programName : 'Enter program name here'"
                class="modal-input"
                rows="1"/>

      <div class="modal-actions">
        <ccfbutton variant="btn-danger" @action="close"> Cancel </ccfbutton>
        <ccfbutton variant="btn-primary" @action="submit"> Submit </ccfbutton>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({ PNModalShow: Boolean, programName: String })
  const emit = defineEmits(['update:PNModalShow', 'update:programName', 'submit'])

  const close = () => {
    emit('update:PNModalShow', false)
  }

  const submit = () => {
    emit('submit', props.programName)
    close()
  }

  const autoResize = (e) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const handleInput = (e) => {
    emit('update:programName', e.target.value)
    autoResize(e)

  }
</script>