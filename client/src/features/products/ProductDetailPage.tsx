import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import { useReviewsQuery } from '@src/features/reviews/queries'
import { useInquiriesQuery } from '@src/features/inquiries/queries'
import { useDeleteProductMutation, useProductsQuery, useUpdateProductMutation } from './queries'
import type { Product } from './types'

const VISIBILITY_LABEL: Record<Product['visibility'], string> = {
  visible: '노출',
  hidden: '비노출',
}

const VISIBILITY_CLASSNAME: Record<Product['visibility'], string> = {
  visible: 'bg-accent-bg text-accent',
  hidden: 'bg-border text-text',
}

function formatPrice(value: number): string {
  return `${value.toLocaleString()}원`
}

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: products = [] } = useProductsQuery()
  const { data: reviews = [] } = useReviewsQuery()
  const { data: inquiries = [] } = useInquiriesQuery()
  const deleteProductMutation = useDeleteProductMutation()
  const updateProductMutation = useUpdateProductMutation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const product = products.find((p) => p.id === id)
  const productReviews = reviews.filter((review) => review.productId === id)
  const productInquiries = inquiries.filter((inquiry) => inquiry.productId === id)
  const unansweredInquiryCount = productInquiries.filter(
    (inquiry) => inquiry.answerContent === null,
  ).length
  const averageRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
      : null

  if (!product) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">상품을 찾을 수 없습니다.</p>
        <Link to="/products" className="text-accent underline underline-offset-2">
          상품 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  function handleConfirmDelete() {
    deleteProductMutation.mutate(product!.id, {
      onSuccess: () => navigate('/products', { replace: true }),
    })
  }

  function handleToggleVisibility() {
    updateProductMutation.mutate({
      id: product!.id,
      updates: { visibility: product!.visibility === 'visible' ? 'hidden' : 'visible' },
    })
  }

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <Link to="/products" className="text-sm text-accent underline underline-offset-2">
          ← 상품 목록
        </Link>
        <h1 className="m-0 mt-2 text-3xl font-medium tracking-[-0.5px] text-heading">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-text">원산지 {product.origin}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${VISIBILITY_CLASSNAME[product.visibility]}`}
          >
            {VISIBILITY_LABEL[product.visibility]}
          </span>
          <button
            type="button"
            disabled={updateProductMutation.isPending}
            onClick={handleToggleVisibility}
            className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {product.visibility === 'visible' ? '비노출로 전환' : '노출로 전환'}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-6 text-left">
        <div className="flex flex-col gap-3">
          <p className="m-0 text-sm text-text">썸네일</p>
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt=""
              className="h-32 w-32 rounded-md border border-border object-cover"
            />
          ) : (
            <span className="flex h-32 w-32 items-center justify-center rounded-md border border-border bg-accent-bg text-2xl text-accent">
              {product.name.slice(0, 1)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="m-0 text-sm text-text">상세 이미지</p>
          {product.detailImageUrls.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {product.detailImageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt=""
                  className="h-32 w-32 rounded-md border border-border object-cover"
                />
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-text">등록된 상세 이미지가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="text-left">
        <p className="m-0 mb-2 text-sm text-text">상품 설명</p>
        <p className="m-0 max-w-[640px] whitespace-pre-wrap text-heading">{product.description}</p>
      </div>

      <div className="text-left">
        <p className="m-0 mb-2 text-sm text-text">수량별 가격</p>
        <div className="overflow-x-auto">
          <table className="w-full max-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-text">
                <th className="px-3 py-2 text-left font-normal">1개</th>
                <th className="px-3 py-2 text-left font-normal">10개</th>
                <th className="px-3 py-2 text-left font-normal">50개</th>
                <th className="px-3 py-2 text-left font-normal">100개</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-3 text-heading">{formatPrice(product.price1)}</td>
                <td className="px-3 py-3 text-heading">{formatPrice(product.price10)}</td>
                <td className="px-3 py-3 text-heading">{formatPrice(product.price50)}</td>
                <td className="px-3 py-3 text-heading">{formatPrice(product.price100)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 sm:max-w-[480px]">
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">제조일</p>
          <p className="m-0 mt-2 text-heading">{product.manufacturedAt}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">유통기한</p>
          <p className="m-0 mt-2 text-heading">{product.expiresAt}</p>
        </div>
      </div>

      <div className="text-left">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm text-text">리뷰</p>
          <Link
            to={`/reviews?productId=${product.id}`}
            className="text-sm text-accent underline underline-offset-2"
          >
            리뷰 관리에서 보기
          </Link>
        </div>
        {productReviews.length > 0 ? (
          <p className="m-0 text-heading">
            평균 {averageRating!.toFixed(1)}점 ({productReviews.length}건)
          </p>
        ) : (
          <p className="m-0 text-sm text-text">등록된 리뷰가 없습니다.</p>
        )}
      </div>

      <div className="text-left">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm text-text">상품문의</p>
          <Link
            to={`/inquiries?productId=${product.id}`}
            className="text-sm text-accent underline underline-offset-2"
          >
            상품문의 관리에서 보기
          </Link>
        </div>
        {productInquiries.length > 0 ? (
          <p className="m-0 text-heading">
            문의 {productInquiries.length}건
            {unansweredInquiryCount > 0 && ` (답변 대기 ${unansweredInquiryCount}건)`}
          </p>
        ) : (
          <p className="m-0 text-sm text-text">등록된 문의가 없습니다.</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={`/products/${product.id}/edit`}
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
        title="상품 삭제"
        description="이 상품을 삭제하시겠습니까? 연결된 리뷰도 함께 삭제되며 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}

export default ProductDetailPage
