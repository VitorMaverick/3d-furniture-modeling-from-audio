'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PASSWORD = 'ifmadesign3d'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== PASSWORD) {
      setError('Senha incorreta.')
      return
    }

    localStorage.setItem('auth', 'true')
    router.push('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-card-foreground">Login</h1>
          <p className="text-sm text-muted-foreground">Digite a senha para continuar.</p>
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
            aria-invalid={Boolean(error)}
            autoComplete="current-password"
            autoFocus
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <Button type="submit">Entrar</Button>
      </form>
    </main>
  )
}
