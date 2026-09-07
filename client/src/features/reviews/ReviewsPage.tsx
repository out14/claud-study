import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import Pagination from '@src/components/Pagination'
import { useProductsQuery } from '@src/features/products/queries'
import { useDeleteReviewMutation, useReviewsQuery, useUpdateReviewMutation } from './queries'
import type { Review, ReviewStatus } from './types'

const PAGE_SIZE = 5

type StatusFilter = 'all' | ReviewStatus

const STATUS_LABEL: Record<ReviewStatus, string> = {
  visible: '노출',
  hidden: '숨김',
}

const STATUS_CLASSNAME: Record<ReviewStatus, string> = {
  visible: 'bg-accent-bg text-accent',
  hidden: 'bg-border text-text',
}

const SELECT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm text-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function stars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating))
}

function ReviewsPage() {
  const { data: reviews = [] } = useReviewsQuery()
  const { data: products = [] } = useProductsQuery()
  const updateReviewMutation = useUpdateReviewMutation()
  const deleteReviewMutation = useDeleteReviewMutation()

  const [searchParams, setSearchParams] = useSearchParams()
  const [productFilter, setProductFilter] = useState<'all' | string>(
    () => searchParams.get('productId') ?? 'all',
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [reviewPendingDelete, setReviewPendingDelete] = useState<Review | null>(null)

  const visibleReviews = reviews.filter(
    (review) =>
      (productFilter === 'all' || review.productId === productFilter) &&
      (statusFilter === 'all' || review.status === statusFilter),
  )

  const totalPages = Math.max(1, Math.ceil(visibleReviews.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedReviews = visibleReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const visibleCount = reviews.filter((review) => review.status === 'visible').length
  const hiddenCount = reviews.filter((review) => review.status === 'hidden').length

  function handleToggleStatus(review: Review) {
    updateReviewMutation.mutate({
      id: review.id,
      updates: { status: review.status === 'visible' ? 'hidden' : 'visible' },
    })
  }

  function handleConfirmDelete() {
    if (!reviewPendingDelete) return
    deleteReviewMutation.mutate(reviewPendingDelete.id, {
      onSettled: () => setReviewPendingDelete(null),
    })
  }

  return (
    <section className="flex grow flex-col gap-6 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          리뷰 관리
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">전체 리뷰</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{reviews.length}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">노출중</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{visibleCount}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">숨김 처리</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{hiddenCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-left">
        <select
          value={productFilter}
          onChange={(event) => {
            const value = event.target.value
            setProductFilter(value)
            setSearchParams(value === 'all' ? {} : { productId: value })
          }}
          className={SELECT_CLASSNAME}
        >
          <option value="all">전체 상품</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className={SELECT_CLASSNAME}
        >
          <option value="all">전체 상태</option>
          <option value="visible">노출</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="px-3 py-2 font-normal">상품명</th>
              <th className="px-3 py-2 font-normal">작성자</th>
              <th className="px-3 py-2 font-normal">평점</th>
              <th className="px-3 py-2 font-normal">내용</th>
              <th className="px-3 py-2 font-normal">작성일</th>
              <th className="px-3 py-2 font-normal">상태</th>
              <th className="px-3 py-2 font-normal">작업</th>
            </tr>
          </thead>
          <tbody>
            {pagedReviews.map((review) => (
              <tr key={review.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-heading">{review.productName}</td>
                <td className="px-3 py-3 text-heading">{review.author}</td>
                <td className="px-3 py-3 text-accent" title={`${review.rating}점`}>
                  {stars(review.rating)}
                </td>
                <td className="max-w-[280px] truncate px-3 py-3 text-heading" title={review.content}>
                  {review.content}
                </td>
                <td className="px-3 py-3 text-heading">{review.createdAt}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${STATUS_CLASSNAME[review.status]}`}
                  >
                    {STATUS_LABEL[review.status]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(review)}
                      className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {review.status === 'visible' ? '숨기기' : '노출하기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewPendingDelete(review)}
                      className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs text-danger transition-colors duration-300 hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleReviews.length === 0 && (
          <p className="m-0 py-8 text-center text-sm text-text">리뷰가 없습니다.</p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={reviewPendingDelete !== null}
        title="리뷰 삭제"
        description="이 리뷰를 삭제하시겠습니까? 삭제한 리뷰는 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setReviewPendingDelete(null)}
      />
    </section>
  )
}

export default ReviewsPage
