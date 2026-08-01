<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Title -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-gray-800">Share files quickly</h1>
      <p class="text-gray-500">Upload a file and get a shareable link instantly..</p>
    </div>

    <!-- File Drag-and-Drop Area -->
    <div @dragover.prevent="isDragging = true"
         @dragleave.prevent="isDragging = false"
         @drop.prevent="handleDrop"
         @click="triggerFileInput"
         :class="[
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-gray-50'
      ]">
      <input type="file"
             ref="fileInput"
             class="hidden"
             @change="handleFileSelect" />

      <div v-if="!selectedFile" class="space-y-3">
        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          📁
        </div>
        <div>
          <p class="text-lg font-medium text-gray-700">Drag & Drop files here</p>
          <p class="text-sm text-gray-400 mt-1">hoặc <span class="text-blue-600 font-semibold underline">Click to select a file</span> from the computer</p>
        </div>
      </div>

      <!-- Display information about the selected file -->
      <div v-else class="space-y-2 text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">📄</span>
            <div>
              <p class="font-medium text-gray-800 truncate max-w-md">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button v-if="!isUploading && !uploadSuccess"
                  @click.stop="removeFile"
                  class="text-gray-400 hover:text-red-500 font-bold p-1">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Progress Bar (%) -->
    <div v-if="isUploading" class="space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div class="flex justify-between text-sm font-medium text-gray-700">
        <span>Uploading file...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div class="bg-blue-600 h-3 rounded-full transition-all duration-150"
             :style="{ width: uploadProgress + '%' }"></div>
      </div>
    </div>

    <!-- Start Upload Button -->
    <button v-if="selectedFile && !isUploading && !uploadSuccess"
            @click="startUpload"
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors">
      Upload the file now
    </button>

    <!-- Result after upload -->
    <div v-if="uploadSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
      <div class="flex items-center space-x-2 text-green-700 font-medium">
        <span>✅</span>
        <span>File uploaded successfully.!</span>
      </div>

      <!-- Hàng chứa Input link + Nút Copy -->
      <div class="flex items-center space-x-2">
        <input type="text"
               readonly
               :value="shareUrl"
               class="w-full p-2 text-sm bg-white border border-gray-300 rounded focus:outline-none" />
        <button @click="copyShareUrl"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded whitespace-nowrap">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <button @click="resetAll"
              class="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded transition-colors border border-gray-300">
        🔄 Tải lên file khác
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import axios from 'axios'

  const API_BASE_URL = 'http://192.168.1.15:5000/api/v1/files'

  const fileInput = ref(null)
  const selectedFile = ref(null)
  const isDragging = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadSuccess = ref(false)
  const shareUrl = ref('')
  const copied = ref(false)

  // Trigger the hidden file input when the container is clicked
  const triggerFileInput = () => {
    if (!selectedFile.value && fileInput.value) {
      fileInput.value.click()
    }
  }

  // Handle file selection via dialog
  const handleFileSelect = (event) => {
    const files = event.target.files
    if (files.length > 0) {
      selectedFile.value = files[0]
      resetUploadState()
    }
  }

  // Handle file drop
  const handleDrop = (event) => {
    isDragging.value = false
    const files = event.dataTransfer.files
    if (files.length > 0) {
      selectedFile.value = files[0]
      resetUploadState()
    }
  }

  // Deselect file
  const removeFile = () => {
    selectedFile.value = null
    resetUploadState()
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  // Reset upload states
  const resetUploadState = () => {
    isUploading.value = false
    uploadProgress.value = 0
    uploadSuccess.value = false
    copied.value = false
  }

  // Format file size (Bytes -> KB, MB)
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Gọi API Upload thật qua Axios
  const startUpload = async () => {
    if (!selectedFile.value) return

    isUploading.value = true
    uploadProgress.value = 0

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            uploadProgress.value = percentCompleted
          }
        }
      })

      if (response.data && response.data.success) {
        isUploading.value = false
        uploadSuccess.value = true

        const fileData = response.data.data
        shareUrl.value = `${window.location.origin}/f/${fileData.code}`

        // Lưu lịch sử upload
        const historyRecord = {
          code: fileData.code,
          name: fileData.originalFileName,
          size: formatFileSize(fileData.sizeBytes),
          createdAt: new Date().toLocaleDateString('vi-VN')
        }

        const history = JSON.parse(localStorage.getItem('upload_history') || '[]')
        history.unshift(historyRecord)
        localStorage.setItem('upload_history', JSON.stringify(history))
      }
    } catch (error) {
      isUploading.value = false
      const errorMsg = error.response?.data?.message || 'Upload thất bại. File có thể vượt quá 10MB!'
      alert(errorMsg)
    }
  }

  // Copy link
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  // Reset toàn bộ về trạng thái ban đầu
  const resetAll = () => {
    selectedFile.value = null
    resetUploadState()
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
</script>
