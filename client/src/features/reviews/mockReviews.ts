import type { Review } from './types'

export const INITIAL_REVIEWS: Review[] = [
  { id: 'rev-01', productId: 'prod-01', productName: '순창 재래식 된장', author: '이서연', rating: 5, content: '집에서 만든 것처럼 구수하고 맛있어요.', status: 'visible', createdAt: '2026-08-01' },
  { id: 'rev-02', productId: 'prod-01', productName: '순창 재래식 된장', author: '박도윤', rating: 4, content: '짜지 않고 딱 좋아요. 재구매 의사 있습니다.', status: 'visible', createdAt: '2026-08-05' },
  { id: 'rev-03', productId: 'prod-01', productName: '순창 재래식 된장', author: '최지우', rating: 2, content: '기대보다 향이 약했어요.', status: 'hidden', createdAt: '2026-08-10' },
  { id: 'rev-04', productId: 'prod-02', productName: '남해 멸치액젓', author: '정하은', rating: 5, content: '액젓 향이 깊고 좋습니다.', status: 'visible', createdAt: '2026-07-20' },
  { id: 'rev-05', productId: 'prod-03', productName: '유기농 현미', author: '김민준', rating: 5, content: '밥맛이 확실히 다르네요.', status: 'visible', createdAt: '2026-09-01' },
  { id: 'rev-06', productId: 'prod-03', productName: '유기농 현미', author: '이서연', rating: 3, content: '배송이 조금 늦었어요.', status: 'visible', createdAt: '2026-09-03' },
  { id: 'rev-07', productId: 'prod-04', productName: '제주 감귤칩', author: '박도윤', rating: 4, content: '아이 간식으로 딱이에요.', status: 'visible', createdAt: '2026-07-25' },
]
