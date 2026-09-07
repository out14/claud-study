import type { AuthUser } from '@src/features/auth/types'

interface ServerStatus {
  id: string
  name: string
  status: 'online' | 'warning' | 'offline'
  cpu: number
  memory: number
  uptime: string
}

const MOCK_SERVERS: ServerStatus[] = [
  { id: 'srv-01', name: 'api-server-01', status: 'online', cpu: 32, memory: 58, uptime: '12d 4h' },
  { id: 'srv-02', name: 'api-server-02', status: 'online', cpu: 41, memory: 63, uptime: '12d 4h' },
  { id: 'srv-03', name: 'worker-01', status: 'warning', cpu: 78, memory: 85, uptime: '3d 1h' },
  { id: 'srv-04', name: 'db-primary', status: 'online', cpu: 55, memory: 71, uptime: '41d 9h' },
  { id: 'srv-05', name: 'db-replica', status: 'offline', cpu: 0, memory: 0, uptime: '-' },
]

const STATUS_LABEL: Record<ServerStatus['status'], string> = {
  online: '정상',
  warning: '주의',
  offline: '중단',
}

const STATUS_CLASSNAME: Record<ServerStatus['status'], string> = {
  online: 'bg-accent-bg text-accent',
  warning: 'bg-danger/10 text-danger',
  offline: 'bg-border text-text',
}

interface DashboardPageProps {
  user: AuthUser
}

function DashboardPage({ user }: DashboardPageProps) {
  const onlineCount = MOCK_SERVERS.filter((s) => s.status === 'online').length

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          서버 관리 대시보드
        </h1>
        <p className="mt-1 text-sm text-text">{user.email}로 로그인됨</p>
      </header>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">전체 서버</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{MOCK_SERVERS.length}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">정상 서버</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{onlineCount}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">경고/중단</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">
            {MOCK_SERVERS.length - onlineCount}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="px-3 py-2 font-normal">서버</th>
              <th className="px-3 py-2 font-normal">상태</th>
              <th className="px-3 py-2 font-normal">CPU</th>
              <th className="px-3 py-2 font-normal">메모리</th>
              <th className="px-3 py-2 font-normal">가동 시간</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SERVERS.map((server) => (
              <tr key={server.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-heading">{server.name}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${STATUS_CLASSNAME[server.status]}`}
                  >
                    {STATUS_LABEL[server.status]}
                  </span>
                </td>
                <td className="px-3 py-3 text-heading">{server.cpu}%</td>
                <td className="px-3 py-3 text-heading">{server.memory}%</td>
                <td className="px-3 py-3 text-heading">{server.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DashboardPage
