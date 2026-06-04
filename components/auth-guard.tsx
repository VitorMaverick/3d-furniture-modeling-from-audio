'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const authorize = () => setIsAuthorized(true)

    if (pathname === '/login') {
      queueMicrotask(authorize)
      return
    }

    if (localStorage.getItem('auth') !== 'true') {
      router.replace('/login')
      return
    }

    queueMicrotask(authorize)
  }, [pathname, router])

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
