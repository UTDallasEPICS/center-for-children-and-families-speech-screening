<template>
  <div class="w-full bg-red-300">Test</div>

  <button @click="buttonClicked()" class="m-2 bg-amber-300 p-2 hover:bg-amber-400">Button</button>
</template>

<script setup lang="ts">
  function buttonClicked() {
    alert('Test')
  }
</script>
