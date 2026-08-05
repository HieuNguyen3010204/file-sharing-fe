<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header for the History page -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Upload history</h1>
        <p class="text-sm text-gray-500">List of files you have uploaded on this device</p>
      </div>
      <!-- Clear all history button -->
      <button v-if="historyList.length > 0"
              @click="clearAllHistory"
              class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200">
        🗑️ Delete all history
      </button>
    </div>

    <!-- State 1: No upload history yet -->
    <div v-if="historyList.length === 0"
         class="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-4 shadow-sm">
      <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto text-3xl">
        🗂️
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-700">No upload history yet.</h3>
        <p class="text-sm text-gray-400">The files you upload will appear here..</p>
      </div>
      <router-link to="/"
                   class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        Download the first file now.
      </router-link>
    </div>

    <!-- State 2: History List Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">
                File Name
               </th>
              <th class="px-6 py-4">
                Share Code
              </th>
              <th class="px-6 py-4">
                Size
              </th>
              <th class="px-6 py-4">
                Upload Date
              </th>
              <th class="px-6 py-4 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in historyList" :key="item.code" class="hover:bg-gray-50/80 transition-colors">

              <!-- File Name -->
              <td class="px-6 py-4 font-medium text-gray-800 flex items-center space-x-2">
                <span class="text-base">📄</span>
                <span class="truncate max-w-[180px]" :title="item.name">{{ item.name }}</span>
              </td>

              <!-- Share Code -->
              <td class="px-6 py-4">
                <span class="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-xs uppercase">
                  {{ item.code }}
                </span>
              </td>


              <!-- Dimensions -->
              <td class="px-6 py-4">{{ item.size }}</td>


              <!-- Upload Date -->
              <td class="px-6 py-4 text-gray-500 text-xs">{{ item.createdAt }}</td>


              <!-- Action Buttons (Copy link & Delete) -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="copyLink(item.code)"
                          class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium transition-colors">
                    {{ copiedCode === item.code ? 'Copied!' : 'Copy Link' }}
                  </button>
                  <button @click="deleteItem(item.code)"
                          class="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Remove from history">
                    ❌
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from'axios'

const historyList = ref([])
const copiedCode = ref('')


// Load history from localStorage when the page opens
const loadHistory = () => {
  const saved = localStorage.getItem('upload_history')
  if (saved) {
    historyList.value = JSON.parse(saved)
  } else {
    historyList.value = []
  }
}

onMounted(() => {
  loadHistory()
})


// Copy the file's share link from the table
const copyLink = (code) => {
  const url = `${window.location.origin}/f/${code}`
  navigator.clipboard.writeText(url)
  copiedCode.value = code
  setTimeout(() => {
    copiedCode.value = ''
  }, 2000)
}

// Delete a line from the history
const deleteItem = async (code) => {
    if (confirm('Are you sure you want to delete this file from the history and the server?')) {
    try {
      // 1. Delete from Backend FIRST
      // Using the v2 URL from your template
      await axios.delete(`https://filesharing-backend-v2.onrender.com/api/v1/files/${code}`);
      
      // 2. Delete from LocalStorage ONLY if backend succeeds
      historyList.value = historyList.value.filter(item => item.code !== code);
      localStorage.setItem('upload_history', JSON.stringify(historyList.value));
      localStorage.removeItem(`file_${code}`);
      
    } catch (error) {
        console.error("Delete error:", error);
        alert('Error: Unable to delete the file on the server. The file may have already been deleted, or the server is experiencing an error.');
    }
  }
}


// Clear entire history
const clearAllHistory = () => {
  if (confirm('Are you sure you want to clear your entire upload history?')) {
    historyList.value.forEach(item => {
      localStorage.removeItem(`file_${item.code}`)
    })
    localStorage.removeItem('upload_history')
    historyList.value = []
  }
}</script>
