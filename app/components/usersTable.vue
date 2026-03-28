<template>
  <table class="users-table">
    <thead>
      <tr>
        <th>Email</th>
        <th>Role</th>
        <th>Expiration Date</th>
        <th>Time Remaining</th>
        <th style="width: 100px">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.email }}</td>
        <td>{{ user.role }}</td>
        <td>{{ formatExpire(user.expiresAt) }}</td>
        <td>{{ daysLeft(user.expiresAt) }} days</td>
        <td>
          <DeleteButton :id="user.id" @confirm="$emit('delete', user.id)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  import DeleteButton from '~/components/deleteButton.vue'

  const props = defineProps({
    users: {
      type: Array,
      required: true,
    },
  })

  defineEmits(['delete'])

  function formatExpire(date) {
    return new Intl.DateTimeFormat('en-US').format(new Date(date))
  }

  function daysLeft(date) {
    const diff = new Date(date).getTime() - Date.now()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
</script>
