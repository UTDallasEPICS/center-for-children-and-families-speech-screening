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
          <ccfbutton
            variant="btn-danger"
            :needsConfirmation="true"
            confirmationMessage="Are you sure you want to delete this user?"
            @action="deleteUser(user.id)"
          >
            Delete
          </ccfbutton>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue'

  const props = defineProps({
    users: {
      type: Array,
      required: true,
    },
  })

  const emit = defineEmits(['delete'])

  // Helper: Format Date
  function formatExpire(date) {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US').format(new Date(date))
  }

  // Helper: Calculate Days
  function daysLeft(date) {
    if (!date) return 0
    const diff = new Date(date).getTime() - Date.now()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  // The Delete Function
  async function deleteUser(id) {
    try {
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      emit('delete', id)

      console.log('Delete successful')
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed')
    }
  }
</script>
