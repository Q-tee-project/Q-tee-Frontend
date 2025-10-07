'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { FiCreditCard, FiArrowLeft, FiPlus, FiDollarSign } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPoints, chargePoints, getPointTransactions, UserPointResponse, PointTransactionResponse } from '@/services/marketApi';

interface ChargeOption {
  amount: number;
  label: string;
}

const CHARGE_OPTIONS: ChargeOption[] = [
  { amount: 10000, label: '10,000P' },
  { amount: 30000, label: '30,000P' },
  { amount: 50000, label: '50,000P' },
  { amount: 100000, label: '100,000P' },
];

export default function PointsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [userPoints, setUserPoints] = useState<UserPointResponse | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [charging, setCharging] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  // 포인트 정보 로드
  const loadPointsInfo = async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    try {
      const [pointsData, transactionsData] = await Promise.all([
        getUserPoints(),
        getPointTransactions({ skip: 0, limit: 10 })
      ]);
      setUserPoints(pointsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('포인트 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 포인트 충전
  const handleCharge = async (amount: number) => {
    if (!userProfile?.id) return;

    setCharging(true);
    try {
      await chargePoints({ amount });
      alert(`${amount.toLocaleString()}P가 충전되었습니다.`);
      // 충전 후 정보 새로고침
      await loadPointsInfo();
      setSelectedAmount(null);
      setCustomAmount('');
    } catch (error: any) {
      console.error('포인트 충전 실패:', error);
      alert(error.message || '포인트 충전에 실패했습니다.');
    } finally {
      setCharging(false);
    }
  };

  // 커스텀 충전
  const handleCustomCharge = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount < 1000) {
      alert('최소 충전 금액은 1,000P입니다.');
      return;
    }
    if (amount > 1000000) {
      alert('최대 충전 금액은 1,000,000P입니다.');
      return;
    }
    handleCharge(amount);
  };

  useEffect(() => {
    loadPointsInfo();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
        <PageHeader
          icon={<FiCreditCard />}
          title="포인트 관리"
          variant="market"
          description="포인트를 충전하고 사용 내역을 확인하세요"
        />
        <Card className="flex-1 flex flex-col shadow-sm">
          <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <PageHeader
        icon={<FiCreditCard />}
        title="포인트 관리"
        variant="market"
        description="포인트를 충전하고 사용 내역을 확인하세요"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측: 포인트 잔액 및 충전 */}
        <div className="space-y-6">
          {/* 현재 잔액 */}
          <Card className="shadow-md">
            <CardHeader className="flex items-center justify-between py-3 px-6 border-b border-gray-100">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition"
                aria-label="뒤로가기"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <CardTitle className="text-base font-semibold">현재 보유 포인트</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#0072CE] mb-2">
                  {userPoints?.available_points.toLocaleString() || '0'}P
                </div>
                <div className="text-sm text-gray-500">
                  적립 포인트: {userPoints?.earned_points?.toLocaleString() || '0'}P
                </div>
                <div className="text-sm text-gray-500">
                  사용 포인트: {userPoints?.used_points?.toLocaleString() || '0'}P
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 포인트 충전 */}
          <Card className="shadow-md">
            <CardHeader className="py-3 px-6 border-b border-gray-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FiPlus className="w-4 h-4" />
                포인트 충전
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* 충전 옵션 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {CHARGE_OPTIONS.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => setSelectedAmount(option.amount)}
                    disabled={charging}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      selectedAmount === option.amount
                        ? 'border-[#0072CE] bg-[#F0F7FF] text-[#0072CE]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${charging ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div>{option.label}</div>
                  </button>
                ))}
              </div>

              {/* 커스텀 충전 */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="직접 입력 (최소 1,000P)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent"
                    disabled={charging}
                    min="1000"
                    max="1000000"
                  />
                  <button
                    onClick={handleCustomCharge}
                    disabled={charging || !customAmount}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    충전
                  </button>
                </div>

                {/* 선택된 금액 충전 버튼 */}
                {selectedAmount && (
                  <button
                    onClick={() => handleCharge(selectedAmount)}
                    disabled={charging}
                    className="w-full py-3 bg-[#0072CE] text-white rounded-lg hover:brightness-110 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {charging ? '충전 중...' : `${selectedAmount.toLocaleString()}P 충전하기`}
                  </button>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• 충전된 포인트는 즉시 사용 가능합니다.</p>
                <p>• 포인트는 상품 구매에만 사용할 수 있습니다.</p>
                <p>• 최소 충전 금액: 1,000P, 최대 충전 금액: 1,000,000P</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측: 사용 내역 */}
        <Card className="shadow-md">
          <CardHeader className="py-3 px-6 border-b border-gray-100">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FiDollarSign className="w-4 h-4" />
              포인트 사용 내역
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                포인트 사용 내역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {transaction.transaction_type === 'charge' ? '포인트 충전' :
                         transaction.transaction_type === 'purchase' ? '상품 구매' :
                         transaction.transaction_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                      </div>
                      <div className="text-sm text-gray-500">
                        잔액: {transaction.balance_after.toLocaleString()}P
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}