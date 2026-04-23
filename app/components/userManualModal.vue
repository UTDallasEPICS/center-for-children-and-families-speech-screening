<template>
  <div v-if="showManual" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="flex-center-JusBetween">
        <h1> User Video Manual </h1>
        <UButton style="background-color:red" class="rounded-xl px-2.5 py-1" @click="close">x</UButton>
      </div>

      <img src="/instructionManualGif.gif" alt="Video explain uploading and navigating webpage" 
           class="py-4" "
      />

    </div>

  </div>
</template>

<script setup>
  const props = defineProps({ showManual: Boolean })
  const emit = defineEmits(['update:showManual'])

  const close = () => {
    emit('update:showManual', false)
  }
</script>