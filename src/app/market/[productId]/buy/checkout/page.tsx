'use client';

import { useParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { productId } = useParams();
  const router = useRouter();

  return (
    <main style={{ padding: 24 }}>
      <h1>결제 페이지</h1>
      <p>상품 ID: {productId}</p>
      <hr />
      <button
        onClick={() => router.push('/market')}
        style={{
          marginTop: '20px',
          padding: '10px 16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#0070f3',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        다른 상품 구경하기
      </button>
    </main>
  );
}
