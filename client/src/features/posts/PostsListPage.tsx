import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import Pagination from '@src/components/Pagination'
import { useDeletePostMutation, usePostsQuery } from './queries'
import type { Post, PostCategory } from './types'

type CategoryFilter = 'all' | PostCategory
type SortOrder = 'latest' | 'oldest'
type SearchScope = 'title' | 'content' | 'titleContent' | 'author'

const PAGE_SIZE = 5

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'news', label: '뉴스' },
  { value: 'chat', label: '잡담' },
  { value: 'promo', label: '홍보' },
]

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

const SEARCH_SCOPE_OPTIONS: { value: SearchScope; label: string }[] = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'titleContent', label: '제목 + 내용' },
  { value: 'author', label: '작성자' },
]

const SELECT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm text-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function matchesSearch(post: Post, scope: SearchScope, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase()
  if (!needle) return true

  switch (scope) {
    case 'title':
      return post.title.toLowerCase().includes(needle)
    case 'content':
      return post.content.toLowerCase().includes(needle)
    case 'titleContent':
      return (
        post.title.toLowerCase().includes(needle) ||
        post.content.toLowerCase().includes(needle)
      )
    case 'author':
      return post.author.toLowerCase().includes(needle)
  }
}

function PostsListPage() {
  const { data: posts = [] } = usePostsQuery()
  const deletePostMutation = useDeletePostMutation()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [searchScope, setSearchScope] = useState<SearchScope>('titleContent')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter(
      (post) =>
        (categoryFilter === 'all' || post.category === categoryFilter) &&
        matchesSearch(post, searchScope, keyword),
    )
    return filtered.sort((a, b) =>
      sortOrder === 'latest'
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    )
  }, [posts, categoryFilter, sortOrder, searchScope, keyword])

  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / PAGE_SIZE))
  const pagedPosts = visiblePosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, sortOrder, searchScope, keyword])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [categoryFilter, searchScope, keyword])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const countByCategory = (category: CategoryFilter) =>
    category === 'all' ? posts.length : posts.filter((p) => p.category === category).length

  const allOnPageSelected =
    pagedPosts.length > 0 && pagedPosts.every((post) => selectedIds.has(post.id))

  function toggleSelectAllOnPage(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      pagedPosts.forEach((post) => (checked ? next.add(post.id) : next.delete(post.id)))
      return next
    })
  }

  function toggleSelectOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleConfirmBulkDelete() {
    setIsDeleting(true)
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deletePostMutation.mutateAsync(id)))
      setSelectedIds(new Set())
    } finally {
      setIsDeleting(false)
      setIsBulkDeleteConfirmOpen(false)
    }
  }

  return (
    <section className="flex grow flex-col gap-6 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          게시물 관리
        </h1>
        <Link
          to="/posts/new"
          className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2 text-sm text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          새 게시물
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
        {CATEGORY_TABS.map((tab) => (
          <div key={tab.value} className="rounded-md border border-border p-4">
            <p className="m-0 text-sm text-text">{tab.label}</p>
            <p className="m-0 mt-2 text-2xl font-medium text-heading">
              {countByCategory(tab.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-left">
        <div className="flex flex-wrap items-center gap-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategoryFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-300 ${
                categoryFilter === tab.value
                  ? 'bg-accent-bg text-accent'
                  : 'text-text hover:text-heading'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          className={SELECT_CLASSNAME}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-left">
        <select
          value={searchScope}
          onChange={(event) => setSearchScope(event.target.value as SearchScope)}
          className={SELECT_CLASSNAME}
        >
          {SEARCH_SCOPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="검색어를 입력하세요"
          className="min-w-[220px] flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-heading focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        />
      </div>

      <div className="flex items-center gap-3 text-left">
        <button
          type="button"
          disabled={selectedIds.size === 0}
          onClick={() => setIsBulkDeleteConfirmOpen(true)}
          className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-danger transition-colors duration-300 hover:border-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          선택 삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
        </button>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="w-8 px-3 py-2 font-normal">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(event) => toggleSelectAllOnPage(event.target.checked)}
                  aria-label="현재 페이지 전체 선택"
                  className="h-4 w-4 accent-accent"
                />
              </th>
              <th className="px-3 py-2 font-normal">카테고리</th>
              <th className="px-3 py-2 font-normal">제목</th>
              <th className="px-3 py-2 font-normal">작성자</th>
              <th className="px-3 py-2 font-normal">작성일</th>
            </tr>
          </thead>
          <tbody>
            {pagedPosts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(post.id)}
                    onChange={(event) => toggleSelectOne(post.id, event.target.checked)}
                    aria-label={`${post.title} 선택`}
                    className="h-4 w-4 accent-accent"
                  />
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${CATEGORY_CLASSNAME[post.category]}`}
                  >
                    {CATEGORY_LABEL[post.category]}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-accent underline decoration-accent-border underline-offset-2 hover:decoration-accent"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-heading">{post.author}</td>
                <td className="px-3 py-3 text-heading">{post.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {visiblePosts.length === 0 && (
          <p className="m-0 py-8 text-center text-sm text-text">검색 결과가 없습니다.</p>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        title="게시물 삭제"
        description={`선택한 게시물 ${selectedIds.size}개를 삭제하시겠습니까? 삭제한 게시물은 복구할 수 없습니다.`}
        confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
        cancelLabel="취소"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
      />
    </section>
  )
}

export default PostsListPage
