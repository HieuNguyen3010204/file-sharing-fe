<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-6">
      <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
        📄
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-gray-800">File được chia sẻ</h2>
        <p class="text-sm text-gray-500">
          Mã chia sẻ:
          <span class="font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {{ fileCode }}
          </span>
        </p>
      </div>

      <!-- Khối thông tin file thật -->
      <div v-if="fileInfo" class="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-3 border border-gray-100">
        <div class="flex justify-between items-center pb-2 border-b border-gray-200">
          <span class="text-gray-500 font-medium">Tên file:</span>
          <span class="font-semibold text-gray-800 truncate max-w-[220px]" :title="fileInfo.name">
            {{ fileInfo.name }}
          </span>
        </div>

        <div class="flex justify-between items-center pb-2 border-b border-gray-200">
          <span class="text-gray-500 font-medium">Kích thước:</span>
          <span class="font-semibold text-gray-800">{{ fileInfo.size }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500 font-medium">Trạng thái:</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Sẵn sàng tải
          </span>
        </div>
      </div>

      <!-- Không tìm thấy file -->
      <div v-else class="bg-red-50 p-4 rounded-lg text-red-600 text-sm">
        ⚠️ Không tìm thấy thông tin file này hoặc file chưa được tạo!
      </div>

      <button @click="handleDownload"
              :disabled="isDownloading || !fileInfo"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2">
        <span v-if="!isDownloading">⬇️ Tải file xuống ngay</span>
        <span v-else class="flex items-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang chuẩn bị file...</span>
        </span>
      </button>
    </div>

    <div class="text-center">
      <router-link to="/" class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
        ← Quay lại trang chủ tải file khác
      </router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const fileCode = ref('')
  const fileInfo = ref(null)
  const isDownloading = ref(false)

  onMounted(() => {
    fileCode.value = route.params.code || ''

    // Đọc dữ liệu file từ localStorage
    const savedData = localStorage.getItem(`file_${fileCode.value}`)
    if (savedData) {
      fileInfo.value = JSON.parse(savedData)
    }
  })

  const handleDownload = () => {
    if (!fileInfo.value) return
    isDownloading.value = true

    setTimeout(() => {
      isDownloading.value = false
      alert(`🎉 Tải thành công file: ${fileInfo.value.name}`)
    }, 1200)
  }
</script>
