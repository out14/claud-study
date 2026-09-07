import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import { useAnswerInquiryMutation, useDeleteInquiryMutation, useInquiriesQuery } from './queries'

const TEXTAREA_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2.5 text-heading disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

type PendingAction = 'submit' | 'retract' | 'delete' | null

function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: inquiries = [] } = useInquiriesQuery()
  const answerMutation = useAnswerInquiryMutation()
  const deleteMutation = useDeleteInquiryMutation()

  const inquiry = inquiries.find((i) => i.id === id)

  const [answerDraft, setAnswerDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  useEffect(() => {
    if (!inquiry) return
    setAnswerDraft(inquiry.answerContent ?? '')
    setError(null)
  }, [inquiry?.id])

  if (!inquiry) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">문의를 찾을 수 없습니다.</p>
        <Link to="/inquiries" className="text-accent underline underline-offset-2">
          상품문의 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  const isAnswered = inquiry.answerContent !== null
  const isSubmitting = answerMutation.isPending
  const isDeleting = deleteMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!answerDraft.trim()) {
      setError('답변 내용을 입력해 주세요.')
      return
    }
    setError(null)
    setPendingAction('submit')
  }

  function handleConfirm() {
    if (!inquiry) return
    if (pendingAction === 'submit') {
      answerMutation.mutate(
        { id: inquiry.id, answerContent: answerDraft.trim() },
        { onSettled: () => setPendingAction(null) },
      )
    } else if (pendingAction === 'retract') {
      answerMutation.mutate(
        { id: inquiry.id, answerContent: null },
        {
          onSuccess: () => setAnswerDraft(''),
          onSettled: () => setPendingAction(null),
        },
      )
    } else if (pendingAction === 'delete') {
      deleteMutation.mutate(inquiry.id, {
        onSuccess: () => navigate('/inquiries', { replace: true }),
        onSettled: () => setPendingAction(null),
      })
    }
  }

  const dialogConfig = {
    submit: {
      title: isAnswered ? '답변 수정' : '답변 등록',
      description: isAnswered ? '답변을 수정하시겠습니까?' : '답변을 등록하시겠습니까?',
      confirmLabel: isAnswered ? '수정' : '등록',
    },
    retract: {
      title: '답변 취소',
      description: '등록된 답변을 삭제하시겠습니까? 문의는 답변 대기 상태로 돌아갑니다.',
      confirmLabel: '답변 삭제',
    },
    delete: {
      title: '문의 삭제',
      description: '이 문의를 삭제하시겠습니까? 삭제한 문의는 복구할 수 없습니다.',
      confirmLabel: '삭제',
    },
  } as const

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <Link to="/inquiries" className="text-sm text-accent underline underline-offset-2">
          ← 상품문의 목록
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
            {inquiry.author}님의 문의
          </h1>
          {inquiry.isSecret && (
            <span className="rounded-full bg-border px-2.5 py-1 text-xs text-text">비밀글</span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              isAnswered ? 'bg-accent-bg text-accent' : 'bg-danger/10 text-danger'
            }`}
          >
            {isAnswered ? '답변 완료' : '답변 대기'}
          </span>
        </div>
        <p className="mt-2 text-sm text-text">
          문의 작성일 {inquiry.createdAt}
          {isAnswered && ` · 답변 작성일 ${inquiry.answeredAt}`}
        </p>
      </header>

      <div className="text-left">
        <p className="m-0 mb-2 text-sm text-text">문의한 상품</p>
        <Link
          to={`/products/${inquiry.productId}`}
          className="flex w-fit items-center gap-3 rounded-md border border-border p-3 hover:border-accent-border"
        >
          {inquiry.productThumbnailUrl ? (
            <img
              src={inquiry.productThumbnailUrl}
              alt=""
              className="h-14 w-14 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent-bg text-lg text-accent">
              {inquiry.productName.slice(0, 1)}
            </span>
          )}
          <span className="text-accent underline underline-offset-2">{inquiry.productName}</span>
        </Link>
      </div>

      <div className="text-left">
        <p className="m-0 mb-2 text-sm text-text">문의 내용</p>
        <p className="m-0 max-w-[640px] whitespace-pre-wrap text-heading">{inquiry.content}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-[560px] flex-col gap-3 text-left">
        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>{isAnswered ? '답변 수정' : '답변하기'}</span>
          <textarea
            value={answerDraft}
            onChange={(event) => setAnswerDraft(event.target.value)}
            rows={5}
            disabled={isSubmitting || isDeleting}
            placeholder="답변 내용을 입력해 주세요."
            className={`${TEXTAREA_CLASSNAME} resize-y`}
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
            disabled={isSubmitting || isDeleting}
            className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2.5 text-base text-accent transition-colors duration-300 enabled:hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAnswered ? '답변 수정' : '답변 등록'}
          </button>
          {isAnswered && (
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={() => setPendingAction('retract')}
              className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              답변 취소
            </button>
          )}
        </div>
      </form>

      <div>
        <button
          type="button"
          disabled={isSubmitting || isDeleting}
          onClick={() => setPendingAction('delete')}
          className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-danger transition-colors duration-300 hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          문의 삭제
        </button>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction ? dialogConfig[pendingAction].title : ''}
        description={pendingAction ? dialogConfig[pendingAction].description : ''}
        confirmLabel={pendingAction ? dialogConfig[pendingAction].confirmLabel : '확인'}
        cancelLabel="취소"
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </section>
  )
}

export default InquiryDetailPage
