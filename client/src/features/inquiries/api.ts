import { apiClient, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_INQUIRIES } from './mockInquiries'
import type { Inquiry } from './types'

let mockInquiries = INITIAL_INQUIRIES.map((inquiry) => ({ ...inquiry }))

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getInquiriesMock(): Promise<Inquiry[]> {
  await mockDelay()
  return mockInquiries.map((inquiry) => ({ ...inquiry }))
}

async function updateInquiryMock(
  id: string,
  updates: { answerContent: string | null },
): Promise<Inquiry> {
  await mockDelay()
  mockInquiries = mockInquiries.map((inquiry) =>
    inquiry.id === id
      ? {
          ...inquiry,
          answerContent: updates.answerContent,
          answeredAt: updates.answerContent ? today() : null,
        }
      : inquiry,
  )

  const updated = mockInquiries.find((inquiry) => inquiry.id === id)
  if (!updated) throw new Error('문의를 찾을 수 없습니다.')
  return updated
}

async function deleteInquiryMock(id: string): Promise<void> {
  await mockDelay()
  mockInquiries = mockInquiries.filter((inquiry) => inquiry.id !== id)
}

async function getInquiriesRequest(): Promise<Inquiry[]> {
  const { data } = await apiClient.get<Inquiry[]>('/inquiries')
  return data
}

async function updateInquiryRequest(
  id: string,
  updates: { answerContent: string | null },
): Promise<Inquiry> {
  const { data } = await apiClient.patch<Inquiry>(`/inquiries/${id}`, updates)
  return data
}

async function deleteInquiryRequest(id: string): Promise<void> {
  await apiClient.delete(`/inquiries/${id}`)
}

export function getInquiries(): Promise<Inquiry[]> {
  return USE_MOCK_API ? getInquiriesMock() : getInquiriesRequest()
}

export function updateInquiry(
  id: string,
  updates: { answerContent: string | null },
): Promise<Inquiry> {
  return USE_MOCK_API ? updateInquiryMock(id, updates) : updateInquiryRequest(id, updates)
}

export function deleteInquiry(id: string): Promise<void> {
  return USE_MOCK_API ? deleteInquiryMock(id) : deleteInquiryRequest(id)
}
