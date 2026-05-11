<template>
  <div class="table-scroll-component">
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
          <td>
            <div v-if="user.role == 'STUDENT'">{{ formatExpire(user.expiresAt) }}</div>
            <div v-else>N/A</div>
          </td>
          <td>
            <div v-if="user.role == 'STUDENT'">{{ daysLeft(user.expiresAt) }} days</div>
            <div v-else>N/A</div>
          </td>
          <td>
            <div
              class="flex items-center gap-2"
              v-if="user.role !== 'SUPER_ADMIN' && session?.data?.user?.role === 'SUPER_ADMIN'"
            >
              <Ccfbutton
                variant="btn-primary"
                @action="editUser(user.id)"
                :needsConfirmation="true"
                confirmationMessage="Are you sure you want to change this users role?"
              >
                {{ user.role === 'ADMIN' ? 'Demote' : 'Promote' }}</Ccfbutton
              >
              <ccfbutton
                variant="btn-danger"
                :needsConfirmation="true"
                confirmationMessage="Are you sure you want to delete this user?"
                @action="deleteUser(user.id)"
                >Delete</ccfbutton
              >
            </div>
            <div
              class="flex items-center gap-2"
              v-if="
                session?.data?.user?.role === 'ADMIN' &&
                user.role !== 'SUPER_ADMIN' &&
                user.role != 'ADMIN'
              "
            >
              <ccfbutton
                variant="btn-danger"
                :needsConfirmation="true"
                confirmationMessage="Are you sure you want to delete this user?"
                @action="deleteUser(user.id)"
                >Delete</ccfbutton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue'

  const session = ref(null)

  onMounted(async () => {
    session.value = await authClient.getSession()
  })

  const props = defineProps({
    users: {
      type: Array,
      required: true,
    },
  })

  const emit = defineEmits(['delete', 'edit'])

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
    const toast = useToast()
    try {
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      emit('delete', id)

      toast.add({
        title: 'Delete Successful',
        description: 'User was successfully deleted',
        color: 'blue',
      })
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed')
    }
  }

  //Edit User Function
  async function editUser(id) {
    emit('edit', id)
  }
</script>
<style scoped>
  .table-scroll-component {
    max-height: 70vh;
    overflow-y: auto;
  }
  .users-table {
    width: 100%;
    border-collapse: separate; /* Changed from collapse to fix border issues */
    border-spacing: 0;
  }
  .users-table th {
    position: sticky;
    top: 0; /* Pins it to the top of .table-scroll-component */
    background-color: white; /* Matches your screenshot background */
    z-index: 10; /* Keeps it above the data rows */
    text-align: left;
    font-weight: 600;
    padding: 0.8rem;
    border-bottom: 2px solid #333; /* Slightly thicker for the header look */
  }

  .users-table td {
    padding: 0.8rem;
    border-bottom: 1px solid #333;
  }
</style>
