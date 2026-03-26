
<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">Dashboard</div>

      <nav class="nav">
        <NuxtLink to="/" class="nav-button">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5-12l2 2m-2-2v12m-2 0h-4m-4 0H5"
              />
            </svg>
          </span>
          <span>Home</span>
        </NuxtLink>

        <NuxtLink to="/dashboard" class="nav-button">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 20h5v-2a4 4 0 00-5-4m-5 6h5m-5 0H7m5 0v-2a4 4 0 00-5-4m10-6a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </span>
          <span>Users</span>
        </NuxtLink>
      </nav>
    </aside>
    <div class="users-page">
      <!-- Page Header -->
      <header class="page-header">
        <h1>Manage Users</h1> 

        <!--<p>{{ new Date(now).toLocaleTimeString() }}</p>-->
      </header>

      <section class="content">
        

        <!-- Users List Card -->
        <div class="userlist">
          
          <div class = "flex items-center justify-between">
            <h2 class="userlist-title">Current Users</h2>
            <button  @click ="showModal = true" class="btn-primary">Add Users</button>
            <addUsersModal 
              v-model:showModal = "showModal"
              v-model:netIds="netIds"
              @submit = "handleSubmit"
            />

          </div>

          <table class="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>netID</th>
                <th>Role</th>
                <th>Expiration Date</th>
                <th style="width: 100px">Actions</th>
              </tr>
            </thead>
            <!--Delete once we have users/accounts-->
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>{{ checkTimeLeft(user) }} days</td>
                <td>
                  <button class="btn-danger" @click="deleteUser(user.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>

  <!--Modal setup-->
</template>

<style src="../assets/css/main.css"></style>

<script setup>
  import { ref } from 'vue'
  import { date } from 'zod'
  const users = ref(null)

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

  const handleSubmit = (ids) => {
    console.log(ids)
  }


  //Checks how many days are left until the user expires.
  const checkTimeLeft = (user) => {
    const creationDate = new Date(user.createdAt)
    const expiresDate = new Date(creationDate)
    expiresDate.setMonth(expiresDate.getMonth() + 6)
    const timeLeft = expiresDate.getTime() - Date.now()
    const daysTimeLeft = timeLeft / (1000 * 60 * 60 * 24)
    return Math.floor(daysTimeLeft)
  }

  async function deleteUser(id) {
    try {
      const { data } = await useFetch(`/api/users/${id}`, {
        method: 'DELETE',
        immediate: true,
        watch: false,
        onFetchError({ error }) {
          throw error
        },
      })

      users.value = users.value.filter((user) => user.id !== id)
      console.log('Delete successful:', data.value)
    } catch (err) {
      console.error('Delete failed:' + err.message)
      alert('Delete failed')
    }
  }
</script>

