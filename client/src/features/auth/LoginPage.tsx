import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLoginMutation } from './queries'
import type { LoginResult } from './types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INPUT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2.5 text-heading disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

interface LoginPageProps {
  onSuccess?: (result: LoginResult) => void
}

function LoginPage({ onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const loginMutation = useLoginMutation()

  const isSubmitting = loginMutation.isPending
  const submitError = loginMutation.isError
    ? loginMutation.error instanceof Error
      ? loginMutation.error.message
      : '로그인에 실패했습니다.'
    : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !password) {
      setFieldError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setFieldError('올바른 이메일 형식이 아닙니다.')
      return
    }
    setFieldError(null)

    try {
      const result = await loginMutation.mutateAsync({ email, password })
      onSuccess?.(result)
    } catch {
      // 에러 메시지는 loginMutation.error로 표시됩니다.
    }
  }

  return (
    <section className="flex grow flex-col place-content-center place-items-center px-5 py-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-[360px] flex-col gap-4 text-left"
      >
        <h1 className="mt-0 mb-2 text-center text-[56px] font-medium tracking-[-1.68px] text-heading max-lg:text-4xl">
          로그인
        </h1>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>이메일</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>비밀번호</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        {(fieldError || submitError) && (
          <p role="alert" className="m-0 text-sm text-danger">
            {fieldError ?? submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2.5 text-base text-accent transition-colors duration-300 enabled:hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
