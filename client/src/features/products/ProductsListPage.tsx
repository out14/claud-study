import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '@src/components/Pagination'
import { useProductsQuery } from './queries'
import type { Product } from './types'

const PAGE_SIZE = 5

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

function ProductsListPage() {
  const { data: products = [] } = useProductsQuery()
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <section className="flex grow flex-col gap-6 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          상품 관리
        </h1>
        <Link
          to="/products/new"
          className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2 text-sm text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          새 상품
        </Link>
      </header>

      <div className="rounded-md border border-border p-4 text-left sm:w-fit">
        <p className="m-0 text-sm text-text">전체 상품</p>
        <p className="m-0 mt-2 text-2xl font-medium text-heading">{products.length}</p>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="w-16 px-3 py-2 font-normal">썸네일</th>
              <th className="px-3 py-2 font-normal">상품명</th>
              <th className="px-3 py-2 font-normal">노출 여부</th>
              <th className="px-3 py-2 font-normal">원산지</th>
              <th className="px-3 py-2 font-normal">1개 가격</th>
              <th className="px-3 py-2 font-normal">제조일</th>
              <th className="px-3 py-2 font-normal">유통기한</th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-bg text-xs text-accent">
                      {product.name.slice(0, 1)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-accent underline decoration-accent-border underline-offset-2 hover:decoration-accent"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${VISIBILITY_CLASSNAME[product.visibility]}`}
                  >
                    {VISIBILITY_LABEL[product.visibility]}
                  </span>
                </td>
                <td className="px-3 py-3 text-heading">{product.origin}</td>
                <td className="px-3 py-3 text-heading">{formatPrice(product.price1)}</td>
                <td className="px-3 py-3 text-heading">{product.manufacturedAt}</td>
                <td className="px-3 py-3 text-heading">{product.expiresAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="m-0 py-8 text-center text-sm text-text">등록된 상품이 없습니다.</p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  )
}

export default ProductsListPage
