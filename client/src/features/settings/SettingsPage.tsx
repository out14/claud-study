import { useState } from 'react'
import type { AuthUser } from '@src/features/auth/types'

interface SettingsPageProps {
  user: AuthUser
}

function SettingsPage({ user }: SettingsPageProps) {
  const [darkModeFollowsSystem, setDarkModeFollowsSystem] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">설정</h1>
        <p className="mt-1 text-sm text-text">{user.email} 계정의 환경설정</p>
      </header>

      <div className="flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="m-0 text-heading">시스템 테마 사용</p>
            <p className="m-0 mt-1 text-sm text-text">시스템 설정에 따라 라이트/다크 모드를 자동으로 전환합니다.</p>
          </div>
          <input
            type="checkbox"
            checked={darkModeFollowsSystem}
            onChange={(event) => setDarkModeFollowsSystem(event.target.checked)}
            className="h-5 w-5 accent-accent"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="m-0 text-heading">이메일 알림</p>
            <p className="m-0 mt-1 text-sm text-text">서버 상태 변경 시 이메일로 알림을 받습니다.</p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(event) => setEmailNotifications(event.target.checked)}
            className="h-5 w-5 accent-accent"
          />
        </div>
      </div>
    </section>
  )
}

export default SettingsPage
