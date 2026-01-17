'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleMode = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <button
      onClick={toggleMode}
      className='inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/15 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md'
      aria-label='Toggle theme'
    >
      {isDark ? (
        <Sun className='w-5 h-5 text-white-400 transition-transform duration-300 rotate-0 scale-100' />
      ) : (
        <Moon className='w-5 h-5 text-white-700 transition-transform duration-300 rotate-0 scale-100' />
      )}
    </button>
  )
}
