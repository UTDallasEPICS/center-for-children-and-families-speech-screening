<template>
  <UButton :class="variant" @click="handleClick">
    <slot>Submit</slot>
  </UButton>
</template>

<script setup>
  const props = defineProps({
    id: {
      type: String,
      required: false,
    },
    variant: {
      type: String,
      default: 'btn-primary',
    },
    needsConfirmation: {
      type: Boolean,
      default: false,
    },
    confirmationMessage: {
      type: String,
      default: 'Are you sure?',
    },
  })

  const emit = defineEmits(['action'])

  function handleClick() {
    if (props.needsConfirmation) {
      const confirmed = confirm(props.confirmationMessage)
      if (!confirmed) return
    }
    emit('action')
  }
</script>
