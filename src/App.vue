<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- Thanh Menu Trên Cùng (Navbar) -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="text-xl font-bold text-blue-600">
          📁 DropShare
        </div>
        <nav class="flex gap-4 font-medium">
          <RouterLink to="/" class="hover:text-blue-600 transition">
            Home
          </RouterLink>
          <RouterLink to="/history" class="hover:text-blue-600 transition">
            History
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- Nơi chứa nội dung động của các View (HomeView, HistoryView, ShareView) -->
    <main class="py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>
