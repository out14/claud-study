import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import { useCreatePostMutation, usePostsQuery, useUpdatePostMutation } from './queries'
import type { PostCategory } from './types'

const INPUT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2.5 text-heading disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function PostFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { data: posts = [] } = usePostsQuery()
  const createPostMutation = useCreatePostMutation()
  const updatePostMutation = useUpdatePostMutation()
  const existingPost = isEditMode ? posts.find((p) => p.id === id) : undefined

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PostCategory>('news')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    if (!existingPost) return
    setTitle(existingPost.title)
    setCategory(existingPost.category)
    setAuthor(existingPost.author)
    setContent(existingPost.content)
    setError(null)
  }, [existingPost?.id])

  if (isEditMode && !existingPost) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">게시물을 찾을 수 없습니다.</p>
        <Link to="/posts" className="text-accent underline underline-offset-2">
          게시물 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('제목, 작성자, 내용을 모두 입력해 주세요.')
      return
    }
    setError(null)
    setIsConfirmOpen(true)
  }

  async function handleConfirmSave() {
    setIsConfirmOpen(false)
    setIsSubmitting(true)
    try {
      const saved = existingPost
        ? await updatePostMutation.mutateAsync({
            id: existingPost.id,
            updates: { title, category, author, content },
          })
        : await createPostMutation.mutateAsync({ title, category, author, content })
      navigate(`/posts/${saved.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <Link
          to={existingPost ? `/posts/${existingPost.id}` : '/posts'}
          className="text-sm text-accent underline underline-offset-2"
        >
          ← {existingPost ? '게시물 상세' : '게시물 목록'}
        </Link>
        <h1 className="m-0 mt-2 text-3xl font-medium tracking-[-0.5px] text-heading">
          {existingPost ? '게시물 수정' : '새 게시물 작성'}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[560px] flex-col gap-5 text-left"
      >
        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>카테고리</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as PostCategory)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          >
            <option value="news">뉴스</option>
            <option value="chat">잡담</option>
            <option value="promo">홍보</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>작성자</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>내용</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            disabled={isSubmitting}
            className={`${INPUT_CLASSNAME} resize-y`}
          />
        </label>

        {error && (
          <p role="alert" className="m-0 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2.5 text-base text-accent transition-colors duration-300 enabled:hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate(existingPost ? `/posts/${existingPost.id}` : '/posts')}
            className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            취소
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmOpen}
        title={existingPost ? '게시물 수정' : '게시물 작성'}
        description={
          existingPost
            ? '게시물을 수정하시겠습니까?'
            : '게시물을 작성하시겠습니까?'
        }
        confirmLabel={existingPost ? '수정' : '작성'}
        cancelLabel="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}

export default PostFormPage
