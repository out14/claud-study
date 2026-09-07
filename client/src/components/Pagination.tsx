interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const BUTTON_CLASSNAME =
  'min-w-8 cursor-pointer rounded-md border border-border px-2.5 py-1.5 text-sm text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border'

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="페이지 네비게이션" className="flex items-center justify-center gap-1.5 pt-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={BUTTON_CLASSNAME}
      >
        이전
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
          className={`${BUTTON_CLASSNAME} ${
            page === currentPage ? 'border-transparent bg-accent-bg text-accent' : ''
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={BUTTON_CLASSNAME}
      >
        다음
      </button>
    </nav>
  )
}

export default Pagination
