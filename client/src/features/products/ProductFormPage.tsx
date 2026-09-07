import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '@src/components/ConfirmDialog'
import { useCreateProductMutation, useProductsQuery, useUpdateProductMutation } from './queries'

const INPUT_CLASSNAME =
  'rounded-md border border-border bg-bg px-3 py-2.5 text-heading disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: products = [] } = useProductsQuery()
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(id)
  const existingProduct = isEditMode ? products.find((p) => p.id === id) : undefined

  const [name, setName] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined)
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([])
  const [origin, setOrigin] = useState('')
  const [description, setDescription] = useState('')
  const [manufacturedAt, setManufacturedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [price1, setPrice1] = useState('')
  const [price10, setPrice10] = useState('')
  const [price50, setPrice50] = useState('')
  const [price100, setPrice100] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending

  useEffect(() => {
    if (!existingProduct) return
    setName(existingProduct.name)
    setThumbnailUrl(existingProduct.thumbnailUrl)
    setDetailImageUrls(existingProduct.detailImageUrls)
    setOrigin(existingProduct.origin)
    setDescription(existingProduct.description)
    setManufacturedAt(existingProduct.manufacturedAt)
    setExpiresAt(existingProduct.expiresAt)
    setPrice1(String(existingProduct.price1))
    setPrice10(String(existingProduct.price10))
    setPrice50(String(existingProduct.price50))
    setPrice100(String(existingProduct.price100))
    setError(null)
  }, [existingProduct?.id])

  if (isEditMode && !existingProduct) {
    return (
      <section className="flex grow flex-col items-start gap-4 px-5 py-8">
        <p className="m-0 text-heading">상품을 찾을 수 없습니다.</p>
        <Link to="/products" className="text-accent underline underline-offset-2">
          상품 목록으로 돌아가기
        </Link>
      </section>
    )
  }

  async function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setThumbnailUrl(await readFileAsDataUrl(file))
  }

  async function handleDetailImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const urls = await Promise.all(files.map(readFileAsDataUrl))
    setDetailImageUrls((prev) => [...prev, ...urls])
    event.target.value = ''
  }

  function removeDetailImage(index: number) {
    setDetailImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !origin.trim() || !description.trim() || !manufacturedAt || !expiresAt) {
      setError('필수 항목을 모두 입력해 주세요.')
      return
    }
    setError(null)
    setIsConfirmOpen(true)
  }

  function handleConfirmSave() {
    const payload = {
      name,
      thumbnailUrl,
      detailImageUrls,
      origin,
      description,
      manufacturedAt,
      expiresAt,
      price1: Number(price1) || 0,
      price10: Number(price10) || 0,
      price50: Number(price50) || 0,
      price100: Number(price100) || 0,
      visibility: existingProduct?.visibility ?? ('visible' as const),
    }

    if (existingProduct) {
      updateProductMutation.mutate(
        { id: existingProduct.id, updates: payload },
        {
          onSuccess: (updated) => {
            setIsConfirmOpen(false)
            navigate(`/products/${updated.id}`)
          },
        },
      )
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: (created) => {
          setIsConfirmOpen(false)
          navigate(`/products/${created.id}`)
        },
      })
    }
  }

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <Link
          to={existingProduct ? `/products/${existingProduct.id}` : '/products'}
          className="text-sm text-accent underline underline-offset-2"
        >
          ← {existingProduct ? '상품 상세' : '상품 목록'}
        </Link>
        <h1 className="m-0 mt-2 text-3xl font-medium tracking-[-0.5px] text-heading">
          {existingProduct ? '상품 수정' : '새 상품 등록'}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[560px] flex-col gap-5 text-left"
      >
        <div className="flex items-center gap-4">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="h-20 w-20 rounded-md object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-md bg-accent-bg text-xl text-accent">
              {name.slice(0, 1) || '?'}
            </span>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => thumbnailInputRef.current?.click()}
            className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            썸네일 변경
          </button>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </div>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>상세 이미지</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isSubmitting}
            onChange={handleDetailImagesChange}
            className={INPUT_CLASSNAME}
          />
          {detailImageUrls.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {detailImageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt="" className="h-16 w-16 rounded-md object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(index)}
                    aria-label="이미지 삭제"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border bg-bg text-xs text-heading hover:border-danger hover:text-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>상품명</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>원산지</span>
          <input
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            disabled={isSubmitting}
            className={INPUT_CLASSNAME}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[15px] text-heading">
          <span>상품 설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            disabled={isSubmitting}
            className={`${INPUT_CLASSNAME} resize-y`}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>제조일</span>
            <input
              type="date"
              value={manufacturedAt}
              onChange={(event) => setManufacturedAt(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>유통기한</span>
            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>1개 가격</span>
            <input
              type="number"
              min={0}
              value={price1}
              onChange={(event) => setPrice1(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>10개 가격</span>
            <input
              type="number"
              min={0}
              value={price10}
              onChange={(event) => setPrice10(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>50개 가격</span>
            <input
              type="number"
              min={0}
              value={price50}
              onChange={(event) => setPrice50(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] text-heading">
            <span>100개 가격</span>
            <input
              type="number"
              min={0}
              value={price100}
              onChange={(event) => setPrice100(event.target.value)}
              disabled={isSubmitting}
              className={INPUT_CLASSNAME}
            />
          </label>
        </div>

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
            onClick={() => navigate(existingProduct ? `/products/${existingProduct.id}` : '/products')}
            className="cursor-pointer rounded-md border border-border px-4 py-2.5 text-base text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            취소
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmOpen}
        title={existingProduct ? '상품 수정' : '상품 등록'}
        description={
          existingProduct ? '상품을 수정하시겠습니까?' : '상품을 등록하시겠습니까?'
        }
        confirmLabel={existingProduct ? '수정' : '등록'}
        cancelLabel="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  )
}

export default ProductFormPage
