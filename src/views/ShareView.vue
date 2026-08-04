<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center space-y-6">
      <!-- Icon File -->
      <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
        📄
      </div>

      <!-- Title & Share Code -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-gray-800">File được chia sẻ</h2>
        <p class="text-sm text-gray-500">
          Mã chia sẻ:
          <span class="font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {{ fileCode }}
          </span>
        </p>
      </div>

      <!-- CASE 1: FAILURE (File does not exist / Expired / Download limit exceeded) -->
      <div v-if="isNotFound"
           class="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-4 shadow-sm">
        <div class="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <div class="space-y-1">
          <h3 class="text-lg font-bold text-red-700">Không thể tải file!</h3>
          <p class="text-sm text-red-600">
            File không tồn tại, link đã hết hạn hoặc vượt quá số lần tải cho phép.
          </p>
        </div>
      </div>

      <!-- CASE 2: SUCCESS (Display file info + Download button) -->
      <div v-else-if="fileInfo" class="space-y-6">
        <!-- File information details block -->
        <div class="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-3 border border-gray-100">
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

        <!-- File download button (with spinner effect) -->
        <button @click="handleDownload"
                :disabled="isDownloading"
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

      <!-- TRƯỜNG HỢP 3: ĐANG TẢI DỮ LIỆU TỪ SERVER -->
      <div v-else class="text-center py-8 text-gray-400">
        <p>⏳ Đang kiểm tra thông tin file...</p>
      </div>

      <!-- Link quay về trang chủ -->
      <div class="pt-4 border-t border-gray-100">
        <router-link to="/" class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
          ← Quay lại trang chủ tải file khác
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';

  const route = useRoute();
  // Updated to the live URL on Render
  const API_BASE_URL = 'https://filesharing-backend-v2.onrender.com/api/v1/files'

  const fileCode = ref('');
  const fileInfo = ref(null);
  const isDownloading = ref(false);
  const isNotFound = ref(false);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  onMounted(async () => {
    fileCode.value = route.params.code || '';

    try {
      const response = await axios.get(`${API_BASE_URL}/${fileCode.value}`);
      if (response.data && response.data.success) {
        const data = response.data.data;
        fileInfo.value = {
          name: data.originalFileName,
          size: formatFileSize(data.sizeBytes)
        };
        isNotFound.value = false;
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin file:", error);
      isNotFound.value = true;
    }
  });

  const handleDownload = () => {
    if (isNotFound.value) return;

    isDownloading.value = true;

    window.location.href = `${API_BASE_URL}/download/${fileCode.value}`;

    setTimeout(() => {
      isDownloading.value = false;
    }, 1500);
  };
</script>
