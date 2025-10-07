'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface SubjectAverageProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  radarData: Array<{
    subject: string;
    클래스평균: number;
    내점수: number;
    fullMark: number;
  }>;
  classes: Array<{ id: string; name: string }>;
}

const SubjectAverage: React.FC<SubjectAverageProps> = ({
  selectedClass,
  setSelectedClass,
  radarData,
  classes,
}) => {
  const [selectedSubject, setSelectedSubject] = React.useState<string>('국어');

  // 하단 차트용: 과목별 카테고리 정의 및 데이터 생성
  const subjectCategories: Record<string, string[]> = React.useMemo(() => ({
    '국어': ['전체','시', '소설', '수필/비문학', '문법'],
    '영어': ['전체', '독해', '어휘', '문법'],
    '수학': ['전체', '소인수분해', '정수와 유리수', '방정식', '그래프와 비례'],
  }), []);

  // 하단 차트용 임시 점수 데이터 (과목/카테고리별 클래스 평균과 내 평균)
  const mockSubjectScores: Record<string, Record<string, { avg: number; mine: number }>> = React.useMemo(() => ({
    '국어': {
      '시': { avg: 78, mine: 82 },
      '소설': { avg: 74, mine: 69 },
      '수필/비문학': { avg: 81, mine: 77 },
      '문법': { avg: 70, mine: 73 },
    },
    '영어': {
      '전체': { avg: 76, mine: 84 },
      '독해': { avg: 72, mine: 80 },
      '어휘': { avg: 79, mine: 75 },
      '문법': { avg: 68, mine: 71 },
    },
    '수학': {
      '소인수분해': { avg: 83, mine: 78 },
      '정수와 유리수': { avg: 75, mine: 72 },
      '방정식': { avg: 82, mine: 85 },
      '그래프와 비례': { avg: 77, mine: 74 },
    },
  }), []);

  const bottomRadarData = React.useMemo(() => {
    const base = radarData.find(item => item.subject === selectedSubject);
    const baseAvg = base?.클래스평균 ?? 0;
    const baseMine = base?.내점수 ?? 0;
    const categories = subjectCategories[selectedSubject] || [];
    return categories.map(cat => {
      const mock = mockSubjectScores[selectedSubject]?.[cat];
      const avg = mock?.avg ?? baseAvg ?? 0;
      const mine = mock?.mine ?? baseMine ?? 0;
      return {
        subject: cat,
        클래스평균: typeof avg === 'number' ? avg : 0,
        내점수: typeof mine === 'number' ? mine : 0,
        fullMark: 100,
      };
    });
  }, [radarData, selectedSubject, subjectCategories, mockSubjectScores]);
  return (
    <Card className="shadow-sm lg:col-span-2 h-full flex flex-col px-6 py-5" style={{ height: '100%' }}>
      <CardHeader className="px-0 py-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">과목별 내 점수</h3>
          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="클래스를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="과목" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="국어">국어</SelectItem>
                <SelectItem value="영어">영어</SelectItem>
                <SelectItem value="수학">수학</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 px-0 flex flex-col">
        <div className="bg-white focus:outline-none" style={{ flexBasis: '46%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart key={selectedClass} cx="50%" cy="50%" outerRadius="85%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any) => {
                  const num = typeof value === 'number' ? value : 0;
                  return num === 0 ? ['0점', ''] : [`${num}점`, ''];
                }}
              />
              <Radar
                name="클래스 평균"
                dataKey="클래스평균"
                stroke="#9674CF"
                fill="#9674CF"
                fillOpacity={0.4}
                isAnimationActive={true}
                animationBegin={80}
                animationDuration={420}
                animationEasing="ease-in-out"
              />
              <Radar
                name="내 평균"
                dataKey="내점수"
                stroke="#18BBCB"
                fill="#18BBCB"
                fillOpacity={0.4}
                isAnimationActive={true}
                animationBegin={140}
                animationDuration={460}
                animationEasing="ease-in-out"
              />
              <Legend 
                content={(props: any) => {
                  const { payload } = props;
                  if (!payload) return null;
                  return (
                    <div className="absolute bottom-[50px] w-full flex justify-center gap-8">
                      {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="py-3">
          <div className="border-t border-gray-200" />
        </div>

        <div className="bg-white focus:outline-none" style={{ flexBasis: '54%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="85%" data={bottomRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  const num = typeof value === 'number' ? value : 0;
                  const mappedName = name === '내점수' ? '내 평균' : (name === '클래스평균' ? '클래스 평균' : name);
                  const display = num === 0 ? '0점' : `${num}점`;
                  return [display, mappedName];
                }}
              />
              <Radar
                name="클래스 평균"
                dataKey="클래스평균"
                stroke="#9674CF"
                fill="#9674CF"
                fillOpacity={0.4}
                isAnimationActive={true}
                animationBegin={80}
                animationDuration={420}
                animationEasing="ease-in-out"
              />
              <Radar
                name="내 평균"
                dataKey="내점수"
                stroke="#18BBCB"
                fill="#18BBCB"
                fillOpacity={0.4}
                isAnimationActive={true}
                animationBegin={140}
                animationDuration={460}
                animationEasing="ease-in-out"
              />
              <Legend 
                content={(props: any) => {
                  const { payload } = props;
                  if (!payload) return null;
                  return (
                    <div className="flex justify-center gap-8 mt-0">
                      {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectAverage;