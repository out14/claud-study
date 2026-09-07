import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import { useDeletePostMutation, usePostsQuery } from './queries'
import type { PostCategory } from './types'

const CATEGORY_LABEL: Record<PostCategory, string> = {
  news: '뉴스',
  chat: '잡담',
  promo: '홍보',
}

const CATEGORY_CLASSNAME: Record<PostCategory, string> = {
  news: 'bg-accent-bg text-accent',
  chat: 'bg-border text-text',
  promo: 'bg-danger/10 text-danger',
}

function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { data: posts = [] } = usePostsQuery()
  const deletePostMutation = useDeletePostMutation()
  const post = posts.find((p) => p.id === id)

  if (!post) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">게시물을 찾을 수 없습니다.</p>
        <Link to="/posts" className="text-accent underline underline-offset-2">
          게시물 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  async function handleConfirmDelete() {
    await deletePostMutation.mutateAsync(post!.id)
    navigate('/posts', { replace: true })
  }

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <Link to="/posts" className="text-sm text-accent underline underline-offset-2">
          ← 게시물 목록
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${CATEGORY_CLASSNAME[post.category]}`}
          >
            {CATEGORY_LABEL[post.category]}
          </span>
          <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
            {post.title}
          </h1>
        </div>
        <p className="mt-2 text-sm text-text">
          {post.author} · {post.createdAt}
        </p>
      </header>

      <p className="m-0 max-w-[640px] text-left whitespace-pre-wrap text-heading">
        {post.content}
      </p>

      <div className="flex items-center gap-3">
        <Link
          to={`/posts/${post.id}/edit`}
          className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2.5 text-base text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          수정
        </Link>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-danger transition-colors duration-300 hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          삭제
        </button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="게시물 삭제"
        description="이 게시물을 삭제하시겠습니까? 삭제한 게시물은 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}

export default PostDetailPage
