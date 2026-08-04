import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../views/HomeView.vue'
import axios from 'axios'

// 1. Mock Axios để không gửi request thật qua mạng khi chạy test
vi.mock('axios')

// 2. Kiểm thử hàm tiện ích (Utility Function Test)
describe('Utility Function: formatFileSize', () => {
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  it('phải chuyển đổi đúng 0 Bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('phải chuyển đổi đúng KB', () => {
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('phải chuyển đổi đúng MB', () => {
    expect(formatFileSize(5242880)).toBe('5 MB')
  })
})

// 3. Kiểm thử Tương tác nâng cao & Luồng dữ liệu (Advanced Interactivity & Network Tests)
describe('HomeView.vue - Advanced Interactivity & Network Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.alert để tránh hiện popup thật khi test
    vi.spyOn(window, 'alert').mockImplementation(() => { })
  })

  // 🧪 TEST CASE 1: Render cơ bản
  it('phải hiển thị đúng tiêu đề Trang chủ khi mở lên', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('Share files quickly')
  })

  // 🧪 TEST CASE 2: Kiểm thử chặn File vượt quá 10MB
  it('phải cảnh báo lỗi nếu file tải lên vượt quá 10MB', async () => {
    const wrapper = mount(HomeView)

    // Giả lập 1 file dung lượng 11MB
    const largeFile = new File(['a'.repeat(1024)], 'large-file.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

    wrapper.vm.selectedFile = largeFile

    // Giả lập lỗi API khi upload file quá lớn
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Upload thất bại. File có thể vượt quá 10MB!' } }
    })

    await wrapper.vm.startUpload()

    expect(window.alert).toHaveBeenCalledWith('Upload thất bại. File có thể vượt quá 10MB!')
  })

  // 🧪 TEST CASE 3: Mock Axios upload thành công
  it('phải upload thành công và hiển thị link chia sẻ khi file hợp lệ', async () => {
    const wrapper = mount(HomeView)

    const validFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' })
    wrapper.vm.selectedFile = validFile

    const mockResponseBody = {
      data: {
        success: true,
        data: {
          code: 'ABC123X',
          originalFileName: 'test.txt',
          sizeBytes: 1024
        }
      }
    }
    axios.post.mockResolvedValueOnce(mockResponseBody)

    await wrapper.vm.startUpload()

    expect(wrapper.vm.uploadSuccess).toBe(true)
    expect(wrapper.vm.shareUrl).toContain('/f/ABC123X')
  })

  // 🧪 TEST CASE 4: Kiểm thử sự kiện Copy Link
  it('phải đổi trạng thái nút sang "Copied!" khi bấm nút copy', async () => {
    // FIX: Use Object.defineProperty to override the read-only navigator.clipboard getter safely
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    })

    const wrapper = mount(HomeView)
    wrapper.vm.uploadSuccess = true
    wrapper.vm.shareUrl = 'http://localhost/f/ABC123X'
    await wrapper.vm.$nextTick()

    await wrapper.vm.copyShareUrl()

    expect(wrapper.vm.copied).toBe(true)
  })
})
