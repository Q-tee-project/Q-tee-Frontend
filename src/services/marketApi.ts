import axios from 'axios';
import { tokenStorage } from './authService';

const MARKET_API_BASE_URL = process.env.NEXT_PUBLIC_MARKET_API_URL || 'http://localhost:8005';

const marketApi = axios.create({
  baseURL: MARKET_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (인증 토큰 추가)
marketApi.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
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
  tags: string[];
  problem_count: number;
  school_level: string;
  grade: number;
  satisfaction_rate: number;
  view_count: number;
  purchase_count: number;
  total_revenue: number;
  created_at: string;
}

export interface MarketProductDetail extends MarketProduct {
  description?: string;
  seller_id: number;
  worksheet_title: string;
  semester?: string;
  unit_info?: string;
  original_service: string;
  original_worksheet_id: number;
  total_reviews: number;
  updated_at?: string;
}

export interface MarketPurchase {
  id: number;
  product_id: number;
  product_title: string;
  seller_name: string;
  buyer_id: number;
  buyer_name: string;
  purchase_price: number;
  payment_method: string;
  payment_status: string;
  purchased_at: string;
}

export interface MarketProductCreate {
  title: string;
  description?: string;
  original_service: "korean" | "math" | "english";
  original_worksheet_id: number;
}

export interface MarketProductUpdate {
  title?: string;
  description?: string;
}

export interface MarketPurchaseCreate {
  product_id: number;
}

export interface UserPointResponse {
  user_id: number;
  available_points: number;
  earned_points: number;
  used_points: number;
}

export interface PointChargeRequest {
  amount: number;
}

export interface PointTransactionResponse {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: 'charge' | 'purchase' | 'refund';
  balance_after: number;
  created_at: string;
  description?: string;
}

// Worksheet 관련 인터페이스
// 각 서비스별 워크시트 타입
export interface KoreanWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  korean_type: string;
  problem_count: number;
  created_at: string;
  status?: string;
}

export interface MathWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  problem_count: number;
  created_at: string;
  status?: string;
}

export interface EnglishWorksheet {
  worksheet_id: number;
  worksheet_name: string;
  school_level: string;
  grade: string; // 영어는 문자열
  total_questions: number;
  created_at: string;
  problem_type?: string;
}

// 통합 타입
export type Worksheet = KoreanWorksheet | MathWorksheet | EnglishWorksheet;

// 정규화된 워크시트 (프론트엔드에서 사용)
export interface NormalizedWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  problem_count: number;
  created_at: string;
  service: 'korean' | 'math' | 'english';
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
  search_field?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<MarketProduct[]> => {
  const response = await marketApi.get('/market/products', params ? { params } : {});
  return response.data;
};

// 상품 상세 조회
export const getProduct = async (productId: number): Promise<MarketProductDetail> => {
  const response = await marketApi.get(`/market/products/${productId}`);
  return response.data;
};

// 상품 등록
export const createProduct = async (
  productData: MarketProductCreate,
): Promise<MarketProductDetail> => {
  try {
    const response = await marketApi.post('/market/products', productData);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail || error?.message || '알 수 없는 오류';
    throw new Error(`상품 등록 실패 (${status}): ${detail}`);
  }
};

// 내 상품 목록 조회
export const getMyProducts = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<MarketProduct[]> => {
  const response = await marketApi.get('/market/my-products', params ? { params } : {});
  return response.data;
};

// 상품 수정
export const updateProduct = async (
  productId: number,
  updateData: MarketProductUpdate,
): Promise<MarketProductDetail> => {
  const response = await marketApi.patch(`/market/products/${productId}`, updateData);
  return response.data;
};

// 상품 삭제
export const deleteProduct = async (productId: number): Promise<void> => {
  await marketApi.delete(`/market/products/${productId}`);
};

// 상품 구매 (포인트)
export const purchaseProduct = async (
  purchaseData: MarketPurchaseCreate,
): Promise<MarketPurchase> => {
  const response = await marketApi.post('/market/purchase', purchaseData);
  return response.data;
};

// 포인트 잔액 조회
export const getUserPoints = async (): Promise<UserPointResponse> => {
  const response = await marketApi.get('/market/points/balance');
  return response.data;
};

// 포인트 충전
export const chargePoints = async (chargeData: PointChargeRequest): Promise<void> => {
  await marketApi.post('/market/points/charge', chargeData);
};

// 포인트 거래 내역
export const getPointTransactions = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<PointTransactionResponse[]> => {
  const response = await marketApi.get('/market/points/transactions', params ? { params } : {});
  return response.data;
};

// 인기상품 조회 (판매량 기준)
export const getPopularProducts = async (limit: number = 10): Promise<MarketProduct[]> => {
  const response = await marketApi.get('/market/products', {
    params: {
      sort_by: 'purchase_count',
      sort_order: 'desc',
      limit
    }
  });
  return response.data;
};

// 내 구매 목록
export const getMyPurchases = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<MarketPurchase[]> => {
  const response = await marketApi.get('/market/my-purchases', params ? { params } : {});
  return response.data;
};

// 구매한 상품의 문제 데이터 조회
export const getPurchasedProductData = async (productId: number): Promise<any> => {
  const response = await marketApi.get(`/market/products/${productId}/worksheet-data`);
  return response.data;
};

// 마켓 통계 조회
export interface MarketStats {
  total_products: number;
  total_sales: number;
  average_rating: number;
  total_revenue: number;
}

export const getMarketStats = async (): Promise<MarketStats> => {
  try {
    const response = await marketApi.get('/market/stats');
    return response.data;
  } catch (error) {
    try {
      const products = await getProducts();
      return {
        total_products: products.length,
        total_sales: products.reduce((sum, product) => sum + product.purchase_count, 0),
        average_rating: products.length > 0
          ? products.reduce((sum, product) => sum + product.satisfaction_rate, 0) / products.length
          : 0,
        total_revenue: products.reduce((sum, product) => sum + product.total_revenue, 0),
      };
    } catch (fallbackError) {
      return {
        total_products: 0,
        total_sales: 0,
        average_rating: 0,
        total_revenue: 0,
      };
    }
  }
};

// Worksheet 관련 API - 상품 등록 시 사용
const KOREAN_API_BASE_URL = process.env.NEXT_PUBLIC_KOREAN_API_URL || 'http://localhost:8004';
const MATH_API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';
const ENGLISH_API_BASE_URL = process.env.NEXT_PUBLIC_ENGLISH_API_URL || 'http://localhost:8002';

// 정규화 함수
function normalizeWorksheet(worksheet: Worksheet, service: 'korean' | 'math' | 'english'): NormalizedWorksheet {
  switch (service) {
    case 'korean':
    case 'math':
      const kmWorksheet = worksheet as KoreanWorksheet | MathWorksheet;
      return {
        id: kmWorksheet.id,
        title: kmWorksheet.title,
        school_level: kmWorksheet.school_level,
        grade: kmWorksheet.grade,
        problem_count: kmWorksheet.problem_count,
        created_at: kmWorksheet.created_at,
        service
      };

    case 'english':
      const enWorksheet = worksheet as EnglishWorksheet;
      return {
        id: enWorksheet.worksheet_id,
        title: enWorksheet.worksheet_name,
        school_level: enWorksheet.school_level,
        grade: parseInt(enWorksheet.grade) || 1,
        problem_count: enWorksheet.total_questions,
        created_at: enWorksheet.created_at,
        service
      };
  }
}

// 사용자 worksheet 목록 조회 (상품 등록용)
export const getUserWorksheets = async (service: 'korean' | 'math' | 'english', userId?: number): Promise<NormalizedWorksheet[]> => {
  const token = tokenStorage.getToken();
  const headers = { Authorization: `Bearer ${token}` };

  let response;
  let rawWorksheets: Worksheet[];

  switch (service) {
    case 'korean':
      response = await axios.get(`${KOREAN_API_BASE_URL}/api/korean-generation/worksheets`, { headers });
      rawWorksheets = response.data.worksheets || response.data || [];
      break;

    case 'math':
      response = await axios.get(`${MATH_API_BASE_URL}/api/worksheets`, { headers });
      rawWorksheets = response.data.worksheets || response.data || [];
      break;

    case 'english':
      if (!userId) {
        throw new Error('English service requires user_id parameter');
      }
      response = await axios.get(`${ENGLISH_API_BASE_URL}/api/english/worksheets`, {
        headers,
        params: { user_id: userId }
      });
      rawWorksheets = response.data || [];
      break;

    default:
      throw new Error(`Unknown service: ${service}`);
  }

  return rawWorksheets.map(worksheet => normalizeWorksheet(worksheet, service));
};

// Worksheet 상세 정보 조회 (상품 등록 시 검증용)
export const getWorksheetDetail = async (
  service: 'korean' | 'math' | 'english',
  worksheetId: number
): Promise<{ worksheet: any; problems: Problem[] }> => {
  let baseUrl;
  let endpoint;

  switch (service) {
    case 'korean':
      baseUrl = KOREAN_API_BASE_URL;
      endpoint = `/market/worksheets/${worksheetId}/problems`;
      break;
    case 'math':
      baseUrl = MATH_API_BASE_URL;
      endpoint = `/api/market-integration/market/worksheets/${worksheetId}/problems`;
      break;
    case 'english':
      baseUrl = ENGLISH_API_BASE_URL;
      endpoint = `/market/worksheets/${worksheetId}/problems`;
      break;
  }

  const token = tokenStorage.getToken();
  const response = await axios.get(`${baseUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
