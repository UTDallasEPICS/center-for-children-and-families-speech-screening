<template>
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
</template>
