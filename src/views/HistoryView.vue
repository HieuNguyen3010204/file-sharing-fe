<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header của trang Lịch sử -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Lịch sử tải lên</h1>
        <p class="text-sm text-gray-500">Danh sách các file bạn đã tải lên trên thiết bị này</p>
      </div>

      <!-- Nút Xóa tất cả lịch sử -->
      <button v-if="historyList.length > 0"
              @click="clearAllHistory"
              class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200">
        🗑️ Xóa tất cả lịch sử
      </button>
    </div>

    <!-- Trạng thái 1: Chưa có lịch sử upload nào -->
    <div v-if="historyList.length === 0"
         class="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-4 shadow-sm">
      <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto text-3xl">
        🗂️
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-700">Chưa có lịch sử tải lên</h3>
        <p class="text-sm text-gray-400">Các file bạn upload sẽ xuất hiện tại đây.</p>
      </div>
      <router-link to="/"
                   class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
        Tải file đầu tiên ngay
      </router-link>
    </div>

    <!-- Trạng thái 2: Bảng danh sách Lịch sử -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Tên File</th>
              <th class="px-6 py-4">Mã Chia Sẻ</th>
              <th class="px-6 py-4">Kích Thước</th>
              <th class="px-6 py-4">Ngày Upload</th>
              <th class="px-6 py-4 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in historyList" :key="item.code" class="hover:bg-gray-50/80 transition-colors">
              <!-- Tên File -->
              <td class="px-6 py-4 font-medium text-gray-800 flex items-center space-x-2">
                <span class="text-base">📄</span>
                <span class="truncate max-w-[180px]" :title="item.name">{{ item.name }}</span>
              </td>

              <!-- Mã Chia Sẻ -->
              <td class="px-6 py-4">
                <span class="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-xs uppercase">
                  {{ item.code }}
                </span>
              </td>

              <!-- Kích Thước -->
              <td class="px-6 py-4">{{ item.size }}</td>

              <!-- Ngày Upload -->
              <td class="px-6 py-4 text-gray-500 text-xs">{{ item.createdAt }}</td>

              <!-- Nút Hành Động (Copy link & Xóa) -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="copyLink(item.code)"
                          class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium transition-colors">
                    {{ copiedCode === item.code ? 'Đã Copy!' : 'Copy Link' }}
                  </button>
                  <button @click="deleteItem(item.code)"
                          class="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Xóa khỏi lịch sử">
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

<script setup>import { ref, onMounted } from 'vue'

const historyList = ref([])
const copiedCode = ref('')

// Load lịch sử từ localStorage khi mở trang
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

// Copy link chia sẻ của file trong bảng
const copyLink = (code) => {
  const url = `${window.location.origin}/f/${code}`
  navigator.clipboard.writeText(url)
  copiedCode.value = code
  setTimeout(() => {
    copiedCode.value = ''
  }, 2000)
}

// Xóa 1 dòng khỏi lịch sử
const deleteItem = (code) => {
  if (confirm('Bạn có chắc muốn xóa file này khỏi lịch sử?')) {
    historyList.value = historyList.value.filter(item => item.code !== code)
    localStorage.setItem('upload_history', JSON.stringify(historyList.value))
    localStorage.removeItem(`file_${code}`)
  }
}

// Xóa sạch toàn bộ lịch sử
const clearAllHistory = () => {
  if (confirm('Bạn có chắc muốn xóa sạch toàn bộ lịch sử tải lên?')) {
    historyList.value.forEach(item => {
      localStorage.removeItem(`file_${item.code}`)
    })
    localStorage.removeItem('upload_history')
    historyList.value = []
  }
}</script>
