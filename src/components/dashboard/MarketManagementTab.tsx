import React from 'react';
import { MarketStats, MarketProduct } from '@/services/marketApi';
import MarketStatsCard from './MarketStatsCard';
import MarketSalesChartCard from './MarketSalesChartCard';
import MarketProductListCard from './MarketProductListCard';
import RefreshButton from './RefreshButton';

interface MarketManagementTabProps {
  marketStats: MarketStats | null;
  isLoadingMarketStats: boolean;
  marketProducts: MarketProduct[];
  selectedProducts: number[];
  isLoadingProducts: boolean;
  lastSyncTime: Date | null;
  onRefresh: () => void;
  onProductSelect: (productId: number) => void;
  getRecentProducts: () => MarketProduct[];
}

const MarketManagementTab: React.FC<MarketManagementTabProps> = ({
  marketStats,
  isLoadingMarketStats,
  marketProducts,
  selectedProducts,
  isLoadingProducts,
  lastSyncTime,
  onRefresh,
  onProductSelect,
  getRecentProducts
}) => {
  const handleRefresh = () => {
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Market Refresh Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">마켓 관리</h2>
        <div className="flex items-center gap-3">
          <RefreshButton
            onClick={handleRefresh}
            disabled={isLoadingMarketStats || isLoadingProducts}
            isLoading={isLoadingMarketStats || isLoadingProducts}
            lastSyncTime={lastSyncTime}
            variant="blue"
            tooltipTitle="새로고침"
          />
        </div>
      </div>

      <MarketStatsCard marketStats={marketStats} isLoadingStats={isLoadingMarketStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MarketSalesChartCard
          selectedProducts={selectedProducts}
          marketProducts={marketProducts}
          getRecentProducts={getRecentProducts}
        />
        <MarketProductListCard
          marketProducts={marketProducts}
          selectedProducts={selectedProducts}
          handleProductSelect={onProductSelect}
          isLoadingProducts={isLoadingProducts}
        />
      </div>
    </div>
  );
};

export default MarketManagementTab;
