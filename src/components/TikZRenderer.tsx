'use client';

import React, { useMemo } from 'react';

interface TikZRendererProps {
  tikzCode: string;
  className?: string;
}

interface Coordinate {
  x: number;
  y: number;
}

interface ParsedData {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  scale: number;
  coordinates: Map<string, Coordinate>;
  points: Array<{ coord: Coordinate; color: string; label: string; labelPos: string }>;
  lines: Array<{ points: Coordinate[]; style: string; color: string; isCycle: boolean }>;
  filledAreas: Array<{ points: Coordinate[]; color: string; opacity: number }>;
}

export const TikZRenderer: React.FC<TikZRendererProps> = ({ tikzCode, className = '' }) => {
  const parsedData = useMemo(() => {
    if (!tikzCode) return null;

    const data: ParsedData = {
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      scale: 1,
      coordinates: new Map(),
      points: [],
      lines: [],
      filledAreas: [],
    };

    // Scale 파싱
    const scaleMatch = tikzCode.match(/scale=([\d.]+)/);
    if (scaleMatch) data.scale = parseFloat(scaleMatch[1]);

    // 축 범위 파싱
    const xAxisMatch = tikzCode.match(/\\draw\[->.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[right\]/);
    const yAxisMatch = tikzCode.match(/\\draw\[->.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[(?:above|top)\]/);

    if (xAxisMatch) {
      data.xMin = parseFloat(xAxisMatch[1]);
      data.xMax = parseFloat(xAxisMatch[3]);
    }
    if (yAxisMatch) {
      data.yMin = parseFloat(yAxisMatch[2]);
      data.yMax = parseFloat(yAxisMatch[4]);
    }

    // Coordinate 정의 파싱: \coordinate (A) at (x,y);
    const coordMatches = tikzCode.matchAll(/\\coordinate\s*\((\w+)\)\s*at\s*\(([-\d.]+),([-\d.]+)\)/g);
    for (const match of coordMatches) {
      const [, name, x, y] = match;
      data.coordinates.set(name, { x: parseFloat(x), y: parseFloat(y) });
    }

    // Helper: 좌표 이름이나 숫자를 Coordinate로 변환
    const resolveCoord = (coordStr: string): Coordinate | null => {
      coordStr = coordStr.trim();

      // (x,y) 형식
      const directMatch = coordStr.match(/\(([-\d.]+),([-\d.]+)\)/);
      if (directMatch) {
        return { x: parseFloat(directMatch[1]), y: parseFloat(directMatch[2]) };
      }

      // 좌표 이름 (A, B, C 등)
      const nameMatch = coordStr.match(/\((\w+)\)/);
      if (nameMatch) {
        return data.coordinates.get(nameMatch[1]) || null;
      }

      // 이름만 (괄호 없이)
      if (/^\w+$/.test(coordStr)) {
        return data.coordinates.get(coordStr) || null;
      }

      return null;
    };

    // Filled areas 파싱: \filldraw[color!opacity] (A) -- (B) -- (C) -- cycle;
    const filledMatches = tikzCode.matchAll(/\\filldraw\[([\w!]+)\]\s*(.*?);/g);
    for (const match of filledMatches) {
      const [, colorSpec, pathStr] = match;

      // circle인 경우 skip (점으로 처리)
      if (pathStr.includes('circle')) continue;

      // 색상과 투명도 파싱
      let color = 'blue';
      let opacity = 0.3;

      if (colorSpec.includes('!')) {
        const parts = colorSpec.split('!');
        color = parts[0];
        opacity = parseInt(parts[1]) / 100;
      }

      // 경로에서 좌표 추출
      const coordParts = pathStr.split('--').map(s => s.trim());
      const points: Coordinate[] = [];

      for (const part of coordParts) {
        if (part === 'cycle') break;
        const coord = resolveCoord(part);
        if (coord) points.push(coord);
      }

      if (points.length >= 3) {
        data.filledAreas.push({ points, color, opacity });
      }
    }

    // Lines 파싱: \draw[style] (A) -- (B) -- (C) -- cycle;
    const lineMatches = tikzCode.matchAll(/\\draw\[([^\]]+)\]\s*(.*?);/g);
    for (const match of lineMatches) {
      const [, styleStr, pathStr] = match;

      // 축은 skip
      if (styleStr.includes('->')) continue;

      const style = styleStr.includes('dashed') ? 'dashed' : 'solid';
      let color = 'black';

      if (styleStr.includes('thick')) color = 'black';
      if (styleStr.includes('blue')) color = 'blue';
      if (styleStr.includes('red')) color = 'red';
      if (styleStr.includes('gray')) color = 'gray';

      // 경로에서 좌표 추출
      const coordParts = pathStr.split('--').map(s => s.trim());
      const points: Coordinate[] = [];
      let isCycle = false;

      for (const part of coordParts) {
        if (part === 'cycle' || part.includes('cycle')) {
          isCycle = true;
          break;
        }
        const coord = resolveCoord(part);
        if (coord) points.push(coord);
      }

      if (points.length >= 2) {
        data.lines.push({ points, style, color, isCycle });
      }
    }

    // Points 파싱: \filldraw (A) circle (2pt) node[above] {A};
    const pointMatches = tikzCode.matchAll(/\\filldraw(?:\[(\w+)\])?\s*\(([^)]+)\)\s*circle.*?(?:node\[([^\]]+)\]\s*\{([^}]+)\})?/g);
    for (const match of pointMatches) {
      const [, colorSpec, coordStr, labelPos, label] = match;

      const coord = resolveCoord(`(${coordStr})`);
      if (!coord) continue;

      let color = 'black';
      if (colorSpec === 'red') color = 'red';
      if (colorSpec === 'blue') color = 'blue';

      data.points.push({
        coord,
        color,
        label: label || '',
        labelPos: labelPos || 'above',
      });
    }

    return data;
  }, [tikzCode]);

  if (!tikzCode || !parsedData) return null;

  const { xMin, xMax, yMin, yMax, coordinates, points, lines, filledAreas } = parsedData;

  // SVG 좌표계 설정
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 50;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // 좌표 변환 함수
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
  const toSvgY = (y: number) => svgHeight - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

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

          {/* Filled areas (색칠된 영역) */}
          {filledAreas.map((area, idx) => {
            const pathData = area.points.map((p, i) =>
              `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`
            ).join(' ') + ' Z';

            const colorMap: Record<string, string> = {
              blue: '#3b82f6',
              red: '#ef4444',
              green: '#22c55e',
              yellow: '#eab308',
              gray: '#6b7280',
            };

            return (
              <path
                key={`fill-${idx}`}
                d={pathData}
                fill={colorMap[area.color] || area.color}
                opacity={area.opacity}
              />
            );
          })}

          {/* Lines (선, 도형) */}
          {lines.map((line, idx) => {
            const pathData = line.points.map((p, i) =>
              `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`
            ).join(' ') + (line.isCycle ? ' Z' : '');

            const colorMap: Record<string, string> = {
              black: '#000000',
              blue: '#3b82f6',
              red: '#ef4444',
              gray: '#9ca3af',
            };

            return (
              <path
                key={`line-${idx}`}
                d={pathData}
                stroke={colorMap[line.color] || line.color}
                strokeWidth={line.style === 'dashed' ? 1.5 : 2}
                strokeDasharray={line.style === 'dashed' ? '4 4' : undefined}
                fill="none"
              />
            );
          })}

          {/* Points (점) */}
          {points.map((point, idx) => {
            const svgX = toSvgX(point.coord.x);
            const svgY = toSvgY(point.coord.y);

            let labelX = svgX;
            let labelY = svgY - 12;

            if (point.labelPos.includes('below')) labelY = svgY + 18;
            if (point.labelPos.includes('right')) labelX = svgX + 12;
            if (point.labelPos.includes('left')) labelX = svgX - 12;

            const colorMap: Record<string, string> = {
              black: '#000000',
              red: '#ef4444',
              blue: '#3b82f6',
            };

            return (
              <g key={`point-${idx}`}>
                <circle cx={svgX} cy={svgY} r="3" fill={colorMap[point.color] || point.color} />
                {point.label && (
                  <text x={labelX} y={labelY} fontSize="14" fill="#374151" textAnchor="middle">
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
