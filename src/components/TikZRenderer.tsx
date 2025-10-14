'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface TikZRendererProps {
  tikzCode: string;
  className?: string;
}

interface Coordinate {
  x: number;
  y: number;
}

interface FunctionPlot {
  expression: string;
  domain: { min: number; max: number };
  color: string;
  style: string;
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
  functionPlots: Array<FunctionPlot>;
  labels: Array<{ coord: Coordinate; text: string; color: string }>;
}

export const TikZRenderer: React.FC<TikZRendererProps> = ({ tikzCode, className = '' }) => {
  // LaTeX 수식을 일반 텍스트로 변환하는 헬퍼 함수
  const cleanLatexLabel = (label: string): string => {
    if (!label) return '';

    let cleaned = label;

    // $ 기호 제거
    cleaned = cleaned.replace(/\$/g, '');

    // 이중 백슬래시를 단일 백슬래시로 (\\frac -> \frac, \\mathrm -> \mathrm)
    cleaned = cleaned.replace(/\\\\/g, '\\');

    // 분수 변환: \frac{a}{b} -> a/b (여러 번 적용하여 중첩된 분수도 처리)
    for (let i = 0; i < 3; i++) {
      cleaned = cleaned.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
    }

    // LaTeX 명령어 제거 - 중첩 가능하므로 여러 번 적용
    for (let i = 0; i < 3; i++) {
      cleaned = cleaned.replace(/\\mathrm\{([^{}]+)\}/g, '$1'); // \mathrm{B} -> B
      cleaned = cleaned.replace(/\\mathbf\{([^{}]+)\}/g, '$1'); // \mathbf{B} -> B
      cleaned = cleaned.replace(/\\text\{([^{}]+)\}/g, '$1'); // \text{abc} -> abc
    }

    cleaned = cleaned.replace(/\\small/g, ''); // \small 제거
    cleaned = cleaned.replace(/\\large/g, ''); // \large 제거
    cleaned = cleaned.replace(/\\displaystyle/g, ''); // \displaystyle 제거
    cleaned = cleaned.replace(/\\textstyle/g, ''); // \textstyle 제거

    // 남은 백슬래시 명령어들 제거 (\O, \Alpha, \x, \y 등)
    cleaned = cleaned.replace(/\\[a-zA-Z]+/g, '');

    // 중괄호 제거
    cleaned = cleaned.replace(/[{}]/g, '');

    // 불필요한 괄호 정리: (16)/(x) -> 16/x
    cleaned = cleaned.replace(/\((\d+)\)\//g, '$1/');
    cleaned = cleaned.replace(/\/\(([a-z])\)/g, '/$1');

    // 연속된 공백을 하나로
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
  };

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
      functionPlots: [],
      labels: [],
    };

    // 변수 정의 파싱 (\def\a{20})
    const variables = new Map<string, number>();
    const defMatches = tikzCode.matchAll(/\\def\\(\w+)\{([-\d.]+)\}/g);
    for (const match of defMatches) {
      const [, varName, value] = match;
      variables.set(varName, parseFloat(value));
    }

    // 변수를 값으로 치환하는 함수
    const replaceVariables = (expr: string): string => {
      let result = expr;
      for (const [varName, value] of variables) {
        // \a/2, \a/3 같은 패턴을 값으로 치환
        const regex = new RegExp(`\\\\${varName}`, 'g');
        result = result.replace(regex, value.toString());
      }
      return result;
    };

    // Scale 파싱
    const scaleMatch = tikzCode.match(/scale=([\d.]+)/);
    if (scaleMatch) data.scale = parseFloat(scaleMatch[1]);

    // 축 범위 파싱
    const xAxisMatch = tikzCode.match(
      /\\draw\[->.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[(?:right|below)\]/,
    );
    const yAxisMatch = tikzCode.match(
      /\\draw\[->.*?\]\s*\(([-\d.]+),([-\d.]+)\)\s*--\s*\(([-\d.]+),([-\d.]+)\)\s*node\[(?:above|top|left)\]/,
    );

    if (xAxisMatch) {
      data.xMin = Math.floor(parseFloat(xAxisMatch[1]));
      data.xMax = Math.ceil(parseFloat(xAxisMatch[3]));
    }
    if (yAxisMatch) {
      data.yMin = Math.floor(parseFloat(yAxisMatch[2]));
      data.yMax = Math.ceil(parseFloat(yAxisMatch[4]));
    }

    // Coordinate 정의 파싱: \coordinate (A) at (x,y); 또는 \coordinate (A) at (\a/2, 3);
    const coordMatches = tikzCode.matchAll(
      /\\coordinate\s*\((\w+)\)\s*at\s*\(([^)]+)\)/g,
    );
    for (const match of coordMatches) {
      const [, name, coordExpr] = match;
      // 변수 치환
      const replacedExpr = replaceVariables(coordExpr);
      const parts = replacedExpr.split(',').map(s => s.trim());
      if (parts.length === 2) {
        try {
          const x = eval(parts[0]);
          const y = eval(parts[1]);
          data.coordinates.set(name, { x, y });
        } catch (e) {
          console.warn('Failed to parse coordinate:', coordExpr);
        }
      }
    }

    // Helper: 좌표 이름이나 숫자를 Coordinate로 변환
    const resolveCoord = (coordStr: string): Coordinate | null => {
      coordStr = coordStr.trim();

      // 변수 치환
      coordStr = replaceVariables(coordStr);

      // (x,y) 형식 - 공백 허용, 수식 지원
      const directMatch = coordStr.match(/\(([^,]+),([^)]+)\)/);
      if (directMatch) {
        try {
          const x = eval(directMatch[1].trim());
          const y = eval(directMatch[2].trim());
          return { x, y };
        } catch (e) {
          console.warn('Failed to evaluate coordinate:', coordStr);
          return null;
        }
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

    // Rectangle 명령어 파싱: \draw[fill=red!20] (0,0) rectangle (2, 10);
    const rectangleMatches = tikzCode.matchAll(/\\draw\[([^\]]+)\]\s*\(([^)]+)\)\s*rectangle\s*\(([^)]+)\)/g);
    for (const match of rectangleMatches) {
      const [, styleStr, coord1Str, coord2Str] = match;

      const coord1 = resolveCoord(`(${coord1Str})`);
      const coord2 = resolveCoord(`(${coord2Str})`);

      if (coord1 && coord2) {
        // fill 옵션 추출
        const fillMatch = styleStr.match(/fill=(\w+!?\d*)/);
        if (fillMatch) {
          const colorSpec = fillMatch[1];
          let color = colorSpec.includes('!') ? colorSpec.split('!')[0] : colorSpec;
          let opacity = colorSpec.includes('!') ? parseInt(colorSpec.split('!')[1]) / 100 : 0.7;

          // 직사각형의 네 점 생성
          const points: Coordinate[] = [
            coord1,
            { x: coord2.x, y: coord1.y },
            coord2,
            { x: coord1.x, y: coord2.y }
          ];

          data.filledAreas.push({ points, color, opacity });
        }
      }
    }

    // Filled areas 파싱: \filldraw[color!opacity] (A) -- (B) -- (C) -- cycle;
    const filledMatches = tikzCode.matchAll(/\\filldraw\[([\w!]+)\]\s*(.*?);/g);
    for (const match of filledMatches) {
      const [, colorSpec, pathStr] = match;

      // circle인 경우 skip (점으로 처리)
      if (pathStr.includes('circle')) continue;

      // 색상과 투명도 - TikZ 그대로 사용
      let color = colorSpec.includes('!') ? colorSpec.split('!')[0] : colorSpec;
      let opacity = colorSpec.includes('!') ? parseInt(colorSpec.split('!')[1]) / 100 : 0.3;

      // 경로에서 좌표 추출
      const coordParts = pathStr.split('--').map((s) => s.trim());
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

      // plot, grid, foreach, rectangle는 skip
      if (pathStr.includes('plot') || pathStr.includes('grid') || pathStr.includes('foreach') || pathStr.includes('rectangle'))
        continue;

      const style = styleStr.includes('dashed') ? 'dashed' : 'solid';

      // 색상 추출 - TikZ 그대로 사용
      let color = 'black';
      const colorMatch = styleStr.match(
        /\b(blue|red|green|gray|orange|purple|brown|pink|cyan|magenta|yellow)\b/,
      );
      if (colorMatch) color = colorMatch[1];

      // node가 있는 경우 제거 (라벨은 별도 처리)
      let cleanPathStr = pathStr.replace(/node\[([^\]]+)\]\s*\{[^}]+\}/g, '').trim();

      // 경로에서 좌표 추출
      const coordParts = cleanPathStr.split('--').map((s) => s.trim());
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

    // Points 파싱: \filldraw[blue] (3,4) circle (2.5pt) node[above right] {A};
    const pointMatches = tikzCode.matchAll(
      /\\filldraw(?:\[(\w+)\])?\s*\(([^)]+)\)\s*circle\s*\([^)]+\)(?:\s*node\[([^\]]+)\]\s*\{([^}]+)\})?/g,
    );
    for (const match of pointMatches) {
      const [, colorSpec, coordStr, labelPos, label] = match;

      const coord = resolveCoord(`(${coordStr})`);
      if (!coord) continue;

      // 색상 - TikZ 그대로 사용
      const color = colorSpec || 'black';

      data.points.push({
        coord,
        color,
        label: label || '',
        labelPos: labelPos || 'above',
      });
    }

    // Function plots 파싱: \draw[domain=1.2:5, smooth, variable=\x, blue, thick] plot ({\x}, {-6/\x}) node[right] {$y=\frac{k}{x}$};
    // 또는: \draw[thick, blue, domain=0:2.5] plot (\x, {3*\x});
    const functionMatches = tikzCode.matchAll(
      /\\draw\[([^\]]+)\]\s*plot\s*\((?:\{)?\\x(?:\})?,\s*\{([^}]+)\}\)(?:\s*node\[([^\]]+)\]\s*\{([^}]+)\})?/g,
    );
    for (const match of functionMatches) {
      const [, styleStr, yExpr, nodePosStr, nodeText] = match;

      // 도메인 파싱
      const domainMatch = styleStr.match(/domain=([\d.]+):([\d.]+)/);
      const domain = domainMatch
        ? { min: parseFloat(domainMatch[1]), max: parseFloat(domainMatch[2]) }
        : { min: data.xMin, max: data.xMax };

      // 스타일 파싱
      const style = styleStr.includes('dashed') ? 'dashed' : 'solid';

      // 색상 추출 - TikZ 그대로 사용
      let color = 'black';
      const colorMatch = styleStr.match(
        /\b(blue|red|green|gray|orange|purple|brown|pink|cyan|magenta|yellow)\b/,
      );
      if (colorMatch) color = colorMatch[1];

      // 변수 치환 및 표현식 정리
      let processedExpr = replaceVariables(yExpr);
      processedExpr = processedExpr.replace(/\\x/g, 'x');

      data.functionPlots.push({
        expression: processedExpr,
        domain,
        color,
        style,
      });

      // node 라벨이 있으면 labels에 추가
      if (nodeText) {
        // 라벨 위치는 함수 끝점 근처로 설정
        const labelX = nodePosStr && nodePosStr.includes('right') ? domain.max :
                      nodePosStr && nodePosStr.includes('left') ? domain.min :
                      (domain.min + domain.max) / 2;

        // y 값 계산
        let labelY = 0;
        try {
          const evalExpr = processedExpr.replace(/x/g, `(${labelX})`);
          labelY = eval(evalExpr);
        } catch (e) {
          labelY = 0;
        }

        data.labels.push({
          coord: { x: labelX, y: labelY },
          text: cleanLatexLabel(nodeText),
          color: color,
        });
      }
    }

    // Labels 파싱: \node[blue] at (4, -2.5) {$y=\frac{a}{x}$};
    // 중괄호 매칭을 개선하여 \frac{}{} 같은 중첩된 중괄호도 처리
    const nodeRegex = /\\node\[([^\]]*)\]\s*at\s*\(([^)]+)\)\s*\{/g;
    let nodeMatch;
    while ((nodeMatch = nodeRegex.exec(tikzCode)) !== null) {
      const [fullMatch, colorSpec, coordStr] = nodeMatch;
      const startIndex = nodeMatch.index + fullMatch.length;

      // 중괄호 카운팅으로 라벨 텍스트 추출
      let braceCount = 1;
      let endIndex = startIndex;
      while (braceCount > 0 && endIndex < tikzCode.length) {
        if (tikzCode[endIndex] === '{') braceCount++;
        else if (tikzCode[endIndex] === '}') braceCount--;
        endIndex++;
      }

      const text = tikzCode.substring(startIndex, endIndex - 1);

      const coord = resolveCoord(`(${coordStr})`);
      if (!coord) continue;

      // 축 눈금 라벨 필터링 (\x, \y, \\x, \\y)
      if (text === '$\\x$' || text === '$\\y$' || text === '\\x' || text === '\\y') {
        continue;
      }

      // 원점 O 라벨 필터링 (O, $O$ 등)
      const cleanedText = cleanLatexLabel(text);

      console.log('[TikZ] 라벨 변환:', text, '→', cleanedText);

      if (coord.x === 0 && coord.y === 0 && (cleanedText === 'O' || cleanedText === 'o')) {
        continue;
      }

      // 색상 추출 - TikZ 그대로 사용
      let color = 'black';
      const colorMatch = colorSpec.match(
        /\b(blue|red|green|gray|orange|purple|brown|pink|cyan|magenta|yellow)\b/,
      );
      if (colorMatch) color = colorMatch[1];

      data.labels.push({ coord, text: cleanedText, color });
    }

    return data;
  }, [tikzCode]);

  if (!tikzCode || !parsedData) return null;

  const { xMin, xMax, yMin, yMax, coordinates, points, lines, filledAreas, functionPlots, labels } =
    parsedData;

  // SVG 좌표계 설정 (1/4 크기로 축소)
  const svgWidth = 300;
  const svgHeight = 300;
  const padding = 30;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  // 좌표 변환 함수
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * graphWidth;
  const toSvgY = (y: number) => svgHeight - padding - ((y - yMin) / (yMax - yMin)) * graphHeight;

  // 함수 표현식 평가
  const evaluateExpression = (expr: string, x: number): number | null => {
    try {
      // {-6/\x} 형식을 JavaScript 표현식으로 변환
      const jsExpr = expr.replace(/x/g, `(${x})`);
      return eval(jsExpr);
    } catch {
      return null;
    }
  };

  // 축 범위에 따라 적절한 눈금 간격 계산
  const calculateStep = (min: number, max: number): number => {
    const range = max - min;
    if (range <= 10) return 1;
    if (range <= 20) return 2;
    if (range <= 50) return 5;
    if (range <= 100) return 10;
    return Math.ceil(range / 10);
  };

  const xStep = calculateStep(xMin, xMax);
  const yStep = calculateStep(yMin, yMax);

  // 색상 팔레트
  const colors = {
    grid: '#d1d5db',
    axis: '#1f2937',
    tick: '#6b7280',
    label: '#374151',
    blue: '#2563eb',
    red: '#dc2626',
    green: '#16a34a',
    gray: '#9ca3af',
    black: '#000000',
  };

  return (
    <div className={`tikz-renderer my-6 ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-center">
        <svg width={svgWidth} height={svgHeight} className="bg-white">
          {/* 그리드 라인 */}
          <g>
            {Array.from({ length: Math.floor((xMax - xMin) / xStep) + 1 }, (_, i) => {
              // xStep의 배수로 정렬 (예: xMin=-6.5, xStep=2 -> 시작점 -6)
              const x = Math.ceil(xMin / xStep) * xStep + i * xStep;
              return x !== 0 && x >= xMin && x <= xMax ? (
                <line
                  key={`grid-v-${i}`}
                  x1={toSvgX(x)}
                  y1={padding}
                  x2={toSvgX(x)}
                  y2={svgHeight - padding}
                  stroke={colors.grid}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              ) : null;
            })}
            {Array.from({ length: Math.floor((yMax - yMin) / yStep) + 1 }, (_, i) => {
              // yStep의 배수로 정렬 (예: yMin=-6.5, yStep=2 -> 시작점 -6)
              const y = Math.ceil(yMin / yStep) * yStep + i * yStep;
              return y !== 0 && y >= yMin && y <= yMax ? (
                <line
                  key={`grid-h-${i}`}
                  x1={padding}
                  y1={toSvgY(y)}
                  x2={svgWidth - padding}
                  y2={toSvgY(y)}
                  stroke={colors.grid}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              ) : null;
            })}
          </g>

          {/* 화살표 정의 */}
          <defs>
            <marker
              id="arrowX"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L7,3 z" fill={colors.axis} />
            </marker>
            <marker
              id="arrowY"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L7,3 z" fill={colors.axis} />
            </marker>
          </defs>

          {/* X축 */}
          <line
            x1={toSvgX(xMin)}
            y1={toSvgY(0)}
            x2={toSvgX(xMax)}
            y2={toSvgY(0)}
            stroke={colors.axis}
            strokeWidth="1.5"
            markerEnd="url(#arrowX)"
          />

          {/* Y축 */}
          <line
            x1={toSvgX(0)}
            y1={toSvgY(yMin)}
            x2={toSvgX(0)}
            y2={toSvgY(yMax)}
            stroke={colors.axis}
            strokeWidth="1.5"
            markerEnd="url(#arrowY)"
          />

          {/* 축 라벨 */}
          <text
            x={toSvgX(xMax) + 15}
            y={toSvgY(0) + 5}
            fontSize="16"
            fill={colors.label}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="italic"
          >
            x
          </text>
          <text
            x={toSvgX(0) + 5}
            y={toSvgY(yMax) - 10}
            fontSize="16"
            fill={colors.label}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="italic"
          >
            y
          </text>

          {/* Filled areas (색칠된 영역) */}
          {filledAreas.map((area, idx) => {
            const pathData =
              area.points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
                .join(' ') + ' Z';

            return (
              <path
                key={`fill-${idx}`}
                d={pathData}
                fill={colors[area.color as keyof typeof colors] || area.color}
                opacity={area.opacity}
              />
            );
          })}

          {/* Lines (선, 도형) */}
          {lines.map((line, idx) => {
            const pathData =
              line.points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
                .join(' ') + (line.isCycle ? ' Z' : '');

            return (
              <path
                key={`line-${idx}`}
                d={pathData}
                stroke={colors[line.color as keyof typeof colors] || line.color}
                strokeWidth={2}
                strokeDasharray={line.style === 'dashed' ? '5 3' : undefined}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Function plots (함수 그래프) */}
          {functionPlots.map((func, idx) => {
            const allPoints: Array<{ x: number; y: number }> = [];
            const step = (func.domain.max - func.domain.min) / 200;
            const yThreshold = Math.abs(yMax - yMin) * 0.8; // y축 범위의 80%

            for (let x = func.domain.min; x <= func.domain.max; x += step) {
              const y = evaluateExpression(func.expression, x);
              if (y !== null && !isNaN(y) && isFinite(y)) {
                allPoints.push({ x, y });
              }
            }

            // 불연속 지점에서 path 분리
            const segments: Array<Array<{ x: number; y: number }>> = [];
            let currentSegment: Array<{ x: number; y: number }> = [];

            for (let i = 0; i < allPoints.length; i++) {
              const point = allPoints[i];

              // y값이 화면 범위를 크게 벗어나면 skip
              if (Math.abs(point.y) > yThreshold) {
                if (currentSegment.length > 0) {
                  segments.push(currentSegment);
                  currentSegment = [];
                }
                continue;
              }

              // 이전 점과 y값 차이가 너무 크면 불연속으로 간주
              if (currentSegment.length > 0) {
                const prevPoint = currentSegment[currentSegment.length - 1];
                const yDiff = Math.abs(point.y - prevPoint.y);
                if (yDiff > yThreshold) {
                  segments.push(currentSegment);
                  currentSegment = [];
                }
              }

              currentSegment.push(point);
            }

            if (currentSegment.length > 0) {
              segments.push(currentSegment);
            }

            return segments.map((segment, segIdx) => {
              if (segment.length === 0) return null;

              const pathData = segment
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
                .join(' ');

              return (
                <path
                  key={`func-${idx}-seg-${segIdx}`}
                  d={pathData}
                  stroke={colors[func.color as keyof typeof colors] || func.color}
                  strokeWidth={2.5}
                  strokeDasharray={func.style === 'dashed' ? '5 3' : undefined}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            });
          })}

          {/* Points (점) */}
          {points.map((point, idx) => {
            const svgX = toSvgX(point.coord.x);
            const svgY = toSvgY(point.coord.y);

            // 라벨 위치 계산 (above, below, left, right, 조합 지원)
            let labelX = svgX;
            let labelY = svgY - 12; // 기본값: above
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';

            const pos = point.labelPos.toLowerCase();

            // 수직 위치
            if (pos.includes('below')) {
              labelY = svgY + 18;
            } else if (pos.includes('above')) {
              labelY = svgY - 12;
            }

            // 수평 위치
            if (pos.includes('right')) {
              labelX = svgX + 8;
              textAnchor = 'start';
            } else if (pos.includes('left')) {
              labelX = svgX - 8;
              textAnchor = 'end';
            }

            // LaTeX 수식에서 텍스트만 추출
            const displayLabel = cleanLatexLabel(point.label);

            return (
              <g key={`point-${idx}`}>
                <circle
                  cx={svgX}
                  cy={svgY}
                  r="4"
                  fill={colors[point.color as keyof typeof colors] || point.color}
                  stroke="white"
                  strokeWidth="1"
                />
                {displayLabel && (
                  <text
                    x={labelX}
                    y={labelY}
                    fontSize="13"
                    fill={colors.label}
                    textAnchor={textAnchor}
                    fontWeight="500"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {displayLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Labels (함수 라벨 등) */}
          {labels.map((label, idx) => {
            const svgX = toSvgX(label.coord.x);
            const svgY = toSvgY(label.coord.y);

            // LaTeX 수식을 KaTeX로 렌더링
            let renderedMath = '';
            try {
              let mathContent = label.text;

              // 분수가 포함된 경우 LaTeX로 렌더링
              if (mathContent.includes('/')) {
                // 다양한 분수 패턴 처리:
                // y=16/x -> y=\frac{16}{x}
                mathContent = mathContent.replace(/(\w+)=(\d+)\/(\w+)/g, '$1=\\frac{$2}{$3}');
                // y=(a)/x -> y=\frac{a}{x}
                mathContent = mathContent.replace(/(\w+)=\(([^)]+)\)\/(\w+)/g, '$1=\\frac{$2}{$3}');
                // (a)/x -> \frac{a}{x} (앞에 = 없는 경우)
                mathContent = mathContent.replace(/\(([^)]+)\)\/(\w+)/g, '\\frac{$1}{$2}');
                // 16/x -> \frac{16}{x} (앞에 = 없는 경우)
                mathContent = mathContent.replace(/(\d+)\/(\w+)/g, '\\frac{$1}{$2}');

                renderedMath = katex.renderToString(mathContent, {
                  displayMode: false,
                  throwOnError: false,
                  output: 'mathml',
                });
              }
            } catch (e) {
              console.warn('KaTeX rendering failed:', e);
            }

            return renderedMath ? (
              <foreignObject
                key={`label-${idx}`}
                x={svgX - 40}
                y={svgY - 15}
                width="80"
                height="30"
              >
                <div
                  style={{
                    color: colors[label.color as keyof typeof colors] || label.color,
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: renderedMath }}
                />
              </foreignObject>
            ) : (
              <text
                key={`label-${idx}`}
                x={svgX}
                y={svgY}
                fontSize="14"
                fill={colors[label.color as keyof typeof colors] || label.color}
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontStyle="italic"
                fontWeight="500"
              >
                {label.text}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
