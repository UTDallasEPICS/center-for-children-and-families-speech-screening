<template>
  <div v-if="showManual" class="modal-overlay" @click.self="close">
    <div class="modal" style="width:100vh">
      <div class="flex-center-JusBetween">
        <p class="px-6 font-semibold"> User Video Manual </p>
        <UButton style="background-color:red" class="rounded-xl px-2.5 py-1" @click="close">
          <icon icon="i-heroicon-x-circle" />
        </UButton>
      </div>

      <img src="/instructionManualGif.gif" alt="Video explain uploading and navigating webpage" 
           class="py-4 min-h-96"/>
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