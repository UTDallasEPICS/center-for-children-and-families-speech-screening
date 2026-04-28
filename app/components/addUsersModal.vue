<template>
  <div v-if="showModal" class="modal-overlay" @click.self="close">
    <div class="modal">
      <h1>Enter the NetId of users you want to give access to</h1>

      <textarea
        :value="netIds"
        @input="handleInput"
        placeholder="Type NetID(s) here"
        class="modal-input"
        rows="1"
      >
      </textarea>
      <div class="modal-actions">
        <ccfbutton variant="btn-danger" @action="close"> Cancel </ccfbutton>
        <ccfbutton variant="btn-primary" @action="submit"> Submit </ccfbutton>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({ showModal: Boolean, netIds: String })
  const emit = defineEmits(['update:showModal', 'update:netIds', 'submit'])

  const close = () => {
    emit('update:showModal', false)
  }
  const updateNetIds = (e) => {
    emit('update:netIds', e.target.value)
  }

  const submit = () => {
    emit('submit', props.netIds)
    close()
  }

  const autoResize = (e) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const handleInput = (e) => {
    updateNetIds(e)
    autoResize(e)
  }
</script>
