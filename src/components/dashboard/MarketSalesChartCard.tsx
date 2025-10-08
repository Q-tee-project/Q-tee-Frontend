'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Info, Calendar as CalendarIcon } from 'lucide-react';

interface MarketProduct {
  id: number;
  title: string;
  subject_type: string;
  satisfaction_rate: number;
  price: number;
  purchase_count: number;
  created_at: string;
}

interface MarketSalesChartCardProps {
  selectedProducts: number[];
  marketProducts: MarketProduct[];
  getRecentProducts: () => MarketProduct[];
}

const MarketSalesChartCard = ({
  selectedProducts,
  marketProducts,
  getRecentProducts,
}: MarketSalesChartCardProps) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');

  const chartData = React.useMemo(() => {
    const baseData = [
      { name: '1월' },
      { name: '2월' },
      { name: '3월' },
      { name: '4월' },
      { name: '5월' },
      { name: '6월' },
      { name: '7월' },
      { name: '8월' },
      { name: '9월' },
      { name: '10월' },
      { name: '11월' },
      { name: '12월' },
    ];

    const getFilteredData = () => {
      switch (selectedPeriod) {
        case '6months':
          return baseData.slice(-6);
        case '3months':
          return baseData.slice(-3);
        default:
          return baseData;
      }
    };

    const filteredData = getFilteredData();

    return filteredData.map((month, index) => {
      const monthData: any = { ...month };

      const productsToShow =
        selectedProducts.length > 0
          ? selectedProducts
              .map((id) => marketProducts.find((p) => p.id === id))
              .filter(Boolean) as MarketProduct[]
          : getRecentProducts();

      productsToShow.forEach((product) => {
        if (product) {
          const baseRevenue = product.price * product.purchase_count / 10;
          const revenueVariation = Math.sin(index + product.id) * baseRevenue * 0.2;
          const baseSales = product.purchase_count / 10;
          const salesVariation = Math.sin(index + product.id) * baseSales * 0.2;

          monthData[product.title] = Math.round(baseRevenue + revenueVariation);
          monthData[`${product.title}_sales`] = Math.round(baseSales + salesVariation);
        }
      });

      return monthData;
    });
  }, [selectedProducts, marketProducts, getRecentProducts, selectedPeriod]);

  const productsInChart = React.useMemo(() => {
    return selectedProducts.length > 0
      ? selectedProducts
          .map((id) => marketProducts.find((p) => p.id === id))
          .filter(Boolean) as MarketProduct[]
      : getRecentProducts();
  }, [selectedProducts, marketProducts, getRecentProducts]);

  return (
    <Card className="bg-card text-card-foreground gap-6 rounded-xl border py-6 flex-1 flex flex-col shadow-sm lg:col-span-2 min-h-[620px]">
      <CardHeader className="py-2 px-6 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-base font-medium">마켓 판매 분석</h2>
          <div className="relative ml-2 inline-block">
            <div className="group w-4 h-4">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-white/90 backdrop-blur-md border border-white/30 text-gray-800 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                최대 2개의 상품을 선택하여
                <br />
                월별 수익을 비교할 수 있습니다
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white/30"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex items-center gap-4">
          <Select defaultValue="all" onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 기간</SelectItem>
              <SelectItem value="6months">최근 6개월</SelectItem>
              <SelectItem value="3months">최근 3개월</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[28rem] bg-white rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-300/50 rounded-xl shadow-xl min-w-[200px]">
                        <div className="text-center mb-3 pb-2 border-b border-gray-200">
                          <p className="text-base font-semibold text-gray-800">{label}</p>
                        </div>
                        <div className="space-y-3">
                          {payload.map((entry: any, index: number) => {
                            const productName = entry.name;
                            const revenue = entry.value;
                            const salesKey = `${productName}_sales`;
                            const sales = entry.payload[salesKey];

                            return (
                              <div key={index} className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  ></div>
                                  <p className="text-sm font-semibold text-gray-800">{productName}</p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600 font-medium">수입</span>
                                    <span className="text-sm font-bold text-green-600">{revenue?.toLocaleString()}P</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600 font-medium">판매량</span>
                                    <span className="text-sm font-semibold text-blue-600">{sales}개</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                content={({ payload }) => {
                  if (!payload) return null;
                  return (
                    <ul style={{ listStyle: 'none', padding: '0', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      {payload.map((entry, index) => (
                        <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '5px' }}></div>
                          <span style={{ color: entry.color }}>{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
              {productsInChart.map((product, index) => {
                const colors = ['#9674CF', '#18BBCB'];
                return product ? (
                  <Line
                    key={product.id}
                    type="monotone"
                    dataKey={product.title}
                    stroke={colors[index]}
                    activeDot={{ r: 8 }}
                    strokeWidth={1}
                  />
                ) : null;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSalesChartCard;
