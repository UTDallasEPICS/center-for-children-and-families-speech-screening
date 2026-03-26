<template>
  <button @click="check()" class="bg-yellow-500 p-2">TESTING</button>
</template>

<script setup>
  const userId = 'user_01'

  function check() {
    const test = $fetch(`/api/users/${userId}`, {
      method: 'GET',
    })
    //useFetch for on page load, $fetch for user actions

    console.log(test)
  }
</script>
