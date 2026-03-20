import { ref, watchEffect } from 'vue'

// Persist across app
const isDark = ref(
  typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark'
    : false
)

watchEffect(() => {
  if (typeof document === 'undefined') return
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})

export function useDarkMode() {
  return {
    isDark,
    toggle: () => { isDark.value = !isDark.value }
  }
}
