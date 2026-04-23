<template>
  <div class="layout">
    <Sidebar />
    <div class="users-page">
      <!-- Page Header -->
      <header class="page-header">
        <h1>Manage Users</h1>
      </header>

      <section class="content">
        <!-- Users List Card -->
        <div class="userlist">
          <div class="flex items-center justify-between">
            <h2 class="userlist-title">Current Users</h2>
            <ccfbutton variant="btn-primary" @action="showModal = true"> Add Users </ccfbutton>
            <addUsersModal
              v-model:showModal="showModal"
              v-model:netIds="netIds"
              @submit="handleSubmit"
            />
          </div>
          <UsersTable :users="users" @delete="deleteUser" />
        </div>
      </section>
    </div>
  </div>
</template>

<style src="../assets/css/main.css"></style>

<script setup>
  import { ref } from 'vue'
  import { date } from 'zod'
  const users = ref(null)

  await useFetch('/api/users/autodelete', {
    method: 'POST',
    onFetchError({ error }) {
      console.error('Autodelete failed:', error)
    },
  })

  try {
    const { data } = await useFetch('/api/users', {
      method: 'GET',

      onFetchError({ error }) {
        throw error
      },
    })
    users.value = data.value
  } catch (err) {
    console.error('Failed to fetch users', err)
    alert('Failed to fetch users' + err.message)
  }

  const showModal = ref(false)
  const netIds = ref('')

  const handleSubmit = async (ids) => {
    const { validIds, invalidIds } = validateNetIdInput(ids)

    if (invalidIds.length) {
      alert(`These ids are invalid: ${invalidIds.join(', ')}`)
      return
    }

    try {
      const results = await Promise.all(
        validIds.map(async (id) => {
          id = id.toLowerCase()
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `${id}@utdallas.edu`, role: 'STUDENT' }),
          })

          if (res.ok) return { status: 'success', data: await res.json() }
          if (res.status === 409) return { status: 'exists', id: id }
          return { status: 'failed', id: id }
        })
      )

      const successfulUsers = results.filter((r) => r.status === 'success').map((r) => r.data)
      users.value.push(...successfulUsers)

      const duplicates = results.filter((r) => r.status === 'exists').map((r) => r.id)

      if (duplicates.length) {
        alert(`These ids already exist: ${duplicates.join(', ')}`)
      }
    } catch (err) {
      console.error('Unexpected Error:', err)
    }
  }
  const validateNetIdInput = (ids) => {
    const splitIds = ids.trim().split(/[\s,]+/)
    const validIds = []
    const invalidIds = []

    const netIdRegex = /^[a-zA-Z]{3}\d{6}$/

    splitIds.forEach((id) => {
      if (netIdRegex.test(id)) {
        validIds.push(id)
      } else {
        invalidIds.push(id)
      }
    })
    return { validIds, invalidIds }
  }
  async function deleteUser(id) {
    try {
      await $fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      console.log('Delete successful')
      users.value = users.value.filter((user) => user.id !== id)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Delete failed')
    }
  }
</script>
