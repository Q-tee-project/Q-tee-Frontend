import axios from 'axios';

const MARKET_API_BASE_URL = process.env.NEXT_PUBLIC_MARKET_API_URL || 'http://localhost:8005';

const marketApi = axios.create({
  baseURL: MARKET_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (인증 토큰 추가)
marketApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MarketProduct {
  id: number;
  title: string;
  price: number;
  seller_name: string;
  subject_type: string;
  tags?: string[];
  main_image?: string;
  view_count: number;
  purchase_count: number;
  created_at: string;
}

export interface MarketProductDetail extends MarketProduct {
  description?: string;
  seller_id: number;
  original_service: string;
  original_worksheet_id: number;
  status: string;
  images?: string[];
  updated_at?: string;
}

export interface MarketPurchase {
  id: number;
  product_id: number;
  buyer_id: number;
  buyer_name: string;
  purchase_price: number;
  payment_method?: string;
  payment_status: string;
  purchased_at: string;
}

export interface MarketProductCreate {
  title: string;
  description?: string;
  price: number;
  subject_type: string;
  tags?: string[];
  original_service: string;
  original_worksheet_id: number;
}

export interface MarketProductUpdate {
  title?: string;
  description?: string;
  price?: number;
  tags?: string[];
  status?: string;
}

export interface MarketPurchaseCreate {
  product_id: number;
  payment_method?: string;
}

// Worksheet 관련 인터페이스
export interface Worksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  korean_type?: string;
  problem_count: number;
  created_at: string;
}

export interface Problem {
  id: number;
  sequence_order: number;
  korean_type?: string;
  problem_type: string;
  difficulty: string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
}

// 상품 목록 조회
export const getProducts = async (params?: {
  skip?: number;
  limit?: number;
  subject?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<MarketProduct[]> => {
  const response = await marketApi.get('/market/products', { params });
  return response.data;
};

// 상품 상세 조회
export const getProduct = async (productId: number): Promise<MarketProductDetail> => {
  const response = await marketApi.get(`/market/products/${productId}`);
  return response.data;
};

// 상품 등록
export const createProduct = async (productData: MarketProductCreate): Promise<MarketProductDetail> => {
  const response = await marketApi.post('/market/products', productData);
  return response.data;
};

// 내 상품 목록 조회
export const getMyProducts = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<MarketProduct[]> => {
  const response = await marketApi.get('/market/my-products', { params });
  return response.data;
};

// 상품 수정
export const updateProduct = async (productId: number, updateData: MarketProductUpdate): Promise<MarketProductDetail> => {
  const response = await marketApi.patch(`/market/products/${productId}`, updateData);
  return response.data;
};

// 상품 삭제
export const deleteProduct = async (productId: number): Promise<void> => {
  await marketApi.delete(`/market/products/${productId}`);
};

// 상품 구매
export const purchaseProduct = async (purchaseData: MarketPurchaseCreate): Promise<MarketPurchase> => {
  const response = await marketApi.post('/market/purchases', purchaseData);
  return response.data;
};

// 내 구매 목록
export const getMyPurchases = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<MarketPurchase[]> => {
  const response = await marketApi.get('/market/my-purchases', { params });
  return response.data;
};

// 구매한 문제지 다운로드
export const downloadPurchasedWorksheet = async (productId: number): Promise<any> => {
  const response = await marketApi.get(`/market/products/${productId}/download`);
  return response.data;
};

// Worksheet 관련 API
const KOREAN_API_BASE_URL = process.env.NEXT_PUBLIC_KOREAN_API_URL || 'http://localhost:8004';
const MATH_API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';

// 사용자 worksheet 목록 조회 (Korean Service)
export const getKoreanWorksheets = async (userId: number): Promise<Worksheet[]> => {
  const response = await axios.get(`${KOREAN_API_BASE_URL}/market/worksheets`, {
    params: { user_id: userId },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};

// 사용자 worksheet 목록 조회 (Math Service)
export const getMathWorksheets = async (userId: number): Promise<Worksheet[]> => {
  const response = await axios.get(`${MATH_API_BASE_URL}/market/worksheets`, {
    params: { user_id: userId },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};

// Worksheet의 문제들 조회 (Korean Service)
export const getKoreanWorksheetProblems = async (worksheetId: number): Promise<{ worksheet: any; problems: Problem[] }> => {
  const response = await axios.get(`${KOREAN_API_BASE_URL}/market/worksheets/${worksheetId}/problems`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};

// Worksheet의 문제들 조회 (Math Service)
export const getMathWorksheetProblems = async (worksheetId: number): Promise<{ worksheet: any; problems: Problem[] }> => {
  const response = await axios.get(`${MATH_API_BASE_URL}/market/worksheets/${worksheetId}/problems`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};