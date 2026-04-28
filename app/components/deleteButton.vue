<template>
  <UButton class="btn-danger" @click="handleClick">
    <slot>Delete</slot>
  </UButton>
</template>

<script setup>
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['confirm'])

  function handleClick() {
    const confirmed = confirm('Are you sure you want to delete this user?')
    if (confirmed) {
      emit('confirm', props.id)
    }
  }
</script>
