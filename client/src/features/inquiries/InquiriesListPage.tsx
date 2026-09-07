import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagination from '@src/components/Pagination'
import { useProductsQuery } from '@src/features/products/queries'
import { useInquiriesQuery } from './queries'

const PAGE_SIZE = 5

type AnsweredFilter = 'all' | 'answered' | 'unanswered'

const SELECT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm text-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function InquiriesListPage() {
  const { data: inquiries = [] } = useInquiriesQuery()
  const { data: products = [] } = useProductsQuery()

  const [searchParams, setSearchParams] = useSearchParams()
  const [productFilter, setProductFilter] = useState<'all' | string>(
    () => searchParams.get('productId') ?? 'all',
  )
  const [answeredFilter, setAnsweredFilter] = useState<AnsweredFilter>('all')
  const [page, setPage] = useState(1)

  const visibleInquiries = inquiries.filter(
    (inquiry) =>
      (productFilter === 'all' || inquiry.productId === productFilter) &&
      (answeredFilter === 'all' ||
        (answeredFilter === 'answered' ? inquiry.answerContent !== null : inquiry.answerContent === null)),
  )

  const totalPages = Math.max(1, Math.ceil(visibleInquiries.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedInquiries = visibleInquiries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const unansweredCount = inquiries.filter((inquiry) => inquiry.answerContent === null).length

  return (
    <section className="flex grow flex-col gap-6 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          상품문의 관리
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">전체 문의</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{inquiries.length}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">답변 대기</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{unansweredCount}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">답변 완료</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">
            {inquiries.length - unansweredCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-left">
        <select
          value={productFilter}
          onChange={(event) => {
            const value = event.target.value
            setProductFilter(value)
            setPage(1)
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
          value={answeredFilter}
          onChange={(event) => {
            setAnsweredFilter(event.target.value as AnsweredFilter)
            setPage(1)
          }}
          className={SELECT_CLASSNAME}
        >
          <option value="all">전체 상태</option>
          <option value="answered">답변 완료</option>
          <option value="unanswered">답변 대기</option>
        </select>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="px-3 py-2 font-normal">상품명</th>
              <th className="px-3 py-2 font-normal">문의 고객</th>
              <th className="px-3 py-2 font-normal">문의 작성일</th>
              <th className="px-3 py-2 font-normal">답변 여부</th>
            </tr>
          </thead>
          <tbody>
            {pagedInquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-heading">{inquiry.productName}</td>
                <td className="px-3 py-3">
                  <Link
                    to={`/inquiries/${inquiry.id}`}
                    className="text-accent underline decoration-accent-border underline-offset-2 hover:decoration-accent"
                  >
                    {inquiry.author}
                  </Link>
                  {inquiry.isSecret && (
                    <span className="ml-1.5 rounded-full bg-border px-2 py-0.5 text-xs text-text">
                      비밀글
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-heading">{inquiry.createdAt}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      inquiry.answerContent !== null
                        ? 'bg-accent-bg text-accent'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {inquiry.answerContent !== null ? '답변 완료' : '답변 대기'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleInquiries.length === 0 && (
          <p className="m-0 py-8 text-center text-sm text-text">문의가 없습니다.</p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  )
}

export default InquiriesListPage
