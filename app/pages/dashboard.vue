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
            <UsersTable :users="users" @delete="deleteUser" @edit="editUser"/> 
       </div>
      </section>
    </div>
  </div>
</template>

<style src="../assets/css/main.css"></style>

<script setup>
  import { ref } from 'vue'
  import { date } from 'zod'
  import Ccfbutton from '~/components/ccfbutton.vue'
  const users = ref(null)

  const toast = useToast()

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
      alert(`These ids are invalid: " ${invalidIds.join(', ')}`)
      return
    }

    try {
      const results = await Promise.all(
        validIds.map((id) =>
          fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: `${id}@utdallas.edu`, role: 'STUDENT' }),
          })
        )
      )

      console.log('Users created: ', results)
    } catch (err) {
      console.error('Error:', err)
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

  const editUser = async (id) => {
    try {
      const user = users.value.find(u => u.id === id)
      if (!user){ 
        return
      }

      const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN"
      
      if (user.role === "ADMIN") {
        const adminCount = users.value.filter(u => u.role === "ADMIN").length

        if (adminCount <= 1) {
          toast.add({title: 'Error', description: 'Error: At least one admin must be in the database', color: 'red' })
          return
        }
      }

      const updatedUser = await $fetch(`/api/users/${id}`, {
        method: "PUT",
        body: { role: newRole }
      })

      users.value = users.value.map(u => u.id === id ? updatedUser : u)

    } catch (err) {
      toast.add({title: 'Error', description: 'Role update failed', color: 'red'})
      }
  }
</script>
