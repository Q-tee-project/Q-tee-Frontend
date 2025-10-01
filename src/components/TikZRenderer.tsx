'use client';

import React from 'react';

interface TikZRendererProps {
  tikzCode: string;
  className?: string;
}

export const TikZRenderer: React.FC<TikZRendererProps> = ({ tikzCode, className = '' }) => {
  if (!tikzCode) return null;

  // TikZ 코드에서 기본 정보 추출
  const parseBasicInfo = () => {
    // scale 추출
    const scaleMatch = tikzCode.match(/scale=([\d.]+)/);
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

    // 축 범위 추출
    const xAxisMatch = tikzCode.match(/\\draw\[.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[right\]/);
    const yAxisMatch = tikzCode.match(/\\draw\[.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[above\]/);

    const xMin = xAxisMatch ? parseFloat(xAxisMatch[1]) : -5;
    const xMax = xAxisMatch ? parseFloat(xAxisMatch[3]) : 5;
    const yMin = yAxisMatch ? parseFloat(yAxisMatch[2]) : -5;
    const yMax = yAxisMatch ? parseFloat(yAxisMatch[4]) : 5;

    return { scale, xMin, xMax, yMin, yMax };
  };

  const { scale, xMin, xMax, yMin, yMax } = parseBasicInfo();

  // SVG 좌표계 설정
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 40;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // 좌표 변환 함수
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
  const toSvgY = (y: number) => svgHeight - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

  // 눈금 간격
  const xStep = 1;
  const yStep = 1;

  return (
    <div className={`tikz-renderer my-4 ${className}`}>
      <div className="border-2 border-blue-200 rounded-lg p-6 bg-white flex justify-center">
        <svg width={svgWidth} height={svgHeight} className="bg-white">
          {/* 그리드 라인 */}
          <g stroke="#e5e7eb" strokeWidth="0.5">
            {Array.from({ length: Math.floor((xMax - xMin) / xStep) + 1 }, (_, i) => {
              const x = xMin + i * xStep;
              return x !== 0 ? (
                <line key={`grid-v-${i}`} x1={toSvgX(x)} y1={padding} x2={toSvgX(x)} y2={svgHeight - padding} />
              ) : null;
            })}
            {Array.from({ length: Math.floor((yMax - yMin) / yStep) + 1 }, (_, i) => {
              const y = yMin + i * yStep;
              return y !== 0 ? (
                <line key={`grid-h-${i}`} x1={padding} y1={toSvgY(y)} x2={svgWidth - padding} y2={toSvgY(y)} />
              ) : null;
            })}
          </g>

          {/* X축 */}
          <line
            x1={toSvgX(xMin)}
            y1={toSvgY(0)}
            x2={toSvgX(xMax)}
            y2={toSvgY(0)}
            stroke="#374151"
            strokeWidth="2"
            markerEnd="url(#arrowX)"
          />

          {/* Y축 */}
          <line
            x1={toSvgX(0)}
            y1={toSvgY(yMin)}
            x2={toSvgX(0)}
            y2={toSvgY(yMax)}
            stroke="#374151"
            strokeWidth="2"
            markerEnd="url(#arrowY)"
          />

          {/* 화살표 정의 */}
          <defs>
            <marker id="arrowX" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
            </marker>
            <marker id="arrowY" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
            </marker>
          </defs>

          {/* X축 눈금 */}
          {Array.from({ length: Math.floor((xMax - xMin) / xStep) + 1 }, (_, i) => {
            const x = xMin + i * xStep;
            if (x === 0) return null;
            return (
              <g key={`tick-x-${i}`}>
                <line x1={toSvgX(x)} y1={toSvgY(0) - 5} x2={toSvgX(x)} y2={toSvgY(0) + 5} stroke="#374151" strokeWidth="1" />
                <text x={toSvgX(x)} y={toSvgY(0) + 20} textAnchor="middle" fontSize="12" fill="#374151">
                  {x}
                </text>
              </g>
            );
          })}

          {/* Y축 눈금 */}
          {Array.from({ length: Math.floor((yMax - yMin) / yStep) + 1 }, (_, i) => {
            const y = yMin + i * yStep;
            if (y === 0) return null;
            return (
              <g key={`tick-y-${i}`}>
                <line x1={toSvgX(0) - 5} y1={toSvgY(y)} x2={toSvgX(0) + 5} y2={toSvgY(y)} stroke="#374151" strokeWidth="1" />
                <text x={toSvgX(0) - 15} y={toSvgY(y) + 5} textAnchor="end" fontSize="12" fill="#374151">
                  {y}
                </text>
              </g>
            );
          })}

          {/* 원점 O */}
          <text x={toSvgX(0) - 10} y={toSvgY(0) + 20} textAnchor="end" fontSize="14" fill="#374151">
            O
          </text>

          {/* 축 라벨 */}
          <text x={toSvgX(xMax) + 10} y={toSvgY(0) + 5} fontSize="16" fill="#374151">
            x
          </text>
          <text x={toSvgX(0) - 5} y={toSvgY(yMax) - 10} fontSize="16" fill="#374151">
            y
          </text>

          {/* 점과 선 그리기 (TikZ 코드 파싱) */}
          {(() => {
            const elements: JSX.Element[] = [];

            // 점 파싱 (filldraw)
            const pointMatches = tikzCode.matchAll(/\\filldraw\[(\w+)\]\s*\(([-\d.]+),([-\d.]+)\)\s*circle.*?node\[.*?\]\s*\{([^}]+)\}/g);
            let pointIndex = 0;
            for (const match of pointMatches) {
              const [, color, x, y, label] = match;
              const svgX = toSvgX(parseFloat(x));
              const svgY = toSvgY(parseFloat(y));

              elements.push(
                <g key={`point-${pointIndex++}`}>
                  <circle cx={svgX} cy={svgY} r="4" fill={color} />
                  <text x={svgX + 10} y={svgY - 10} fontSize="14" fill="#374151">{label}</text>
                </g>
              );
            }

            // 선 파싱 (dashed line)
            const lineMatches = tikzCode.matchAll(/\\draw\[dashed[^\]]*\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)/g);
            let lineIndex = 0;
            for (const match of lineMatches) {
              const [, x1, y1, x2, y2] = match;
              elements.push(
                <line
                  key={`line-${lineIndex++}`}
                  x1={toSvgX(parseFloat(x1))}
                  y1={toSvgY(parseFloat(y1))}
                  x2={toSvgX(parseFloat(x2))}
                  y2={toSvgY(parseFloat(y2))}
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              );
            }

            return elements;
          })()}
        </svg>
      </div>
    </div>
  );
};
