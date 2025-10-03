'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface RatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  items: string[];
  ratios: Record<string, number>;
  setRatios: (ratios: Record<string, number>) => void;
  onSave: () => void;
  error: string;
}

export function RatioModal({
  isOpen,
  onClose,
  title,
  description,
  items,
  ratios,
  setRatios,
  onSave,
  error,
}: RatioModalProps) {
  if (!isOpen) return null;

  const totalRatio = items.reduce((sum, item) => sum + (ratios[item] || 0), 0);

  const handleRatioChange = (item: string, value: string) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) {
        setRatios({ ...ratios, [item]: 0 });
        return;
    }

    const otherTotal = items
      .filter(i => i !== item)
      .reduce((sum, i) => sum + (ratios[i] || 0), 0);

    const maxAllowed = 100 - otherTotal;
    const clampedValue = Math.max(0, Math.min(newValue, maxAllowed));

    setRatios({ ...ratios, [item]: clampedValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[520px] max-w-[90vw] rounded-xl bg-white shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-xl font-semibold">{title}</div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{description}</p>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={10}
                  value={ratios[item] ?? 0}
                  onChange={e => handleRatioChange(item, e.target.value)}
                  className="w-24 p-2 border rounded-md text-right"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className={`text-sm ${totalRatio === 100 ? 'text-green-600' : 'text-red-600'}`}>
            합계: {totalRatio}%
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSave} disabled={totalRatio !== 100}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
