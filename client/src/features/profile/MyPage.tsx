import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import type { AuthUser } from '@src/features/auth/types'
import { useUpdateUserMutation, useUsersQuery } from '@src/features/users/queries'
import type { AppUser } from '@src/features/users/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INPUT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2.5 text-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

const ROLE_LABEL: Record<AppUser['role'], string> = {
  admin: '관리자',
  member: '멤버',
}

const STATUS_LABEL: Record<AppUser['status'], string> = {
  active: '활성',
  inactive: '비활성',
}

const STATUS_CLASSNAME: Record<AppUser['status'], string> = {
  active: 'bg-accent-bg text-accent',
  inactive: 'bg-border text-text',
}

interface MyPageProps {
  user: AuthUser
}

function MyPage({ user }: MyPageProps) {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: users } = useUsersQuery()
  const updateUserMutation = useUpdateUserMutation()
  const appUser = users?.find((u) => u.email === user.email)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    if (!appUser) return
    setName(appUser.name)
    setEmail(appUser.email)
    setAvatarUrl(appUser.avatarUrl)
    setEmailError(null)
    setSavedAt(null)
  }, [appUser?.id])

  if (!appUser) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">프로필 정보를 불러오는 중입니다.</p>
      </section>
    )
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.')
      return
    }
    setEmailError(null)
    setIsConfirmOpen(true)
  }

  function handleConfirmSave() {
    if (!appUser) return
    updateUserMutation.mutate({ id: appUser.id, updates: { name, email, avatarUrl } })
    setSavedAt(Date.now())
    setIsConfirmOpen(false)
  }

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">마이페이지</h1>
        <p className="mt-1 text-sm text-text">가입일 {appUser.joinedAt}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[480px] flex-col gap-5 text-left"
      >
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-bg text-xl text-accent">
              {name.slice(0, 1)}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>이름</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={INPUT_CLASSNAME}
          />
          {emailError && (
            <span role="alert" className="text-sm text-danger">
              {emailError}
            </span>
          )}
        </label>

        <div className="flex items-center gap-2 text-[15px] text-heading">
          <span className="text-text">역할</span>
          <span>{ROLE_LABEL[appUser.role]}</span>
          <span
            className={`ml-2 rounded-full px-2.5 py-1 text-xs ${STATUS_CLASSNAME[appUser.status]}`}
          >
            {STATUS_LABEL[appUser.status]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2.5 text-base text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            취소
          </button>
          {savedAt && <span className="text-sm text-text">저장되었습니다.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmOpen}
        title="프로필 정보 변경"
        description="프로필 정보를 변경하시겠습니까?"
        confirmLabel="변경"
        cancelLabel="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}

export default MyPage
