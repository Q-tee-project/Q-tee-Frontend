'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Trash2, Pen } from 'lucide-react';

interface HandwritingCanvasProps {
  width?: number;
  height?: number;
  onStrokeChange?: (hasStrokes: boolean) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onImageCapture?: (imageBlob: Blob) => void;
  enableOCR?: boolean;
  problemType?: string;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  width = 600,
  height = 200,
  onStrokeChange,
  className = '',
  value,
  onChange,
  onImageCapture,
  enableOCR = false,
  problemType = 'multiple_choice',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [strokes, setStrokes] = useState<string[]>([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value && value.trim() !== '') {
      // value가 있으면 이미지를 로드
      if (value !== canvas.toDataURL()) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.onerror = () => {
          // 이미지 로드 실패 시 캔버스 클리어
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    } else {
      // value가 없으면 캔버스 클리어
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStrokes([]);
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const newStroke = canvas.toDataURL();
        setStrokes((prev) => [...prev, newStroke]);
        onChange?.(newStroke);
        onStrokeChange?.(true);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    onChange?.('');
    onStrokeChange?.(false);
  };

  const captureForOCR = async () => {
    if (!canvasRef.current || !enableOCR) return;

    setIsProcessingOCR(true);

    try {
      const canvas = canvasRef.current;

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob && onImageCapture) {
          onImageCapture(blob);
        }
      }, 'image/png');

    } catch (error) {
      console.error('OCR 처리 중 오류:', error);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      {/* 도구 모음 */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <Button
          size="sm"
          variant={currentTool === 'pen' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('pen')}
          className="flex items-center gap-1"
        >
          <Pen className="w-4 h-4" />펜
        </Button>
        <Button
          size="sm"
          variant={currentTool === 'eraser' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('eraser')}
          className="flex items-center gap-1"
        >
          <Eraser className="w-4 h-4" />
          지우개
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearCanvas}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          전체 지우기
        </Button>
        <div className="flex-1" />

      </div>

      {/* 캔버스 */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded cursor-crosshair bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
