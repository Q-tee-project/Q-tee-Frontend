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
  categoryData: Record<string, Array<{
    subject: string;
    클래스평균: number;
    내점수: number;
    fullMark: number;
    hasData: boolean;
  }>>;
  classes: Array<{ id: string; name: string }>;
}

const SubjectAverage: React.FC<SubjectAverageProps> = ({
  selectedClass,
  setSelectedClass,
  radarData,
  categoryData,
  classes,
}) => {
  const [selectedSubject, setSelectedSubject] = React.useState<string>('국어');

  // 선택한 과목의 카테고리별 데이터 (성능 최적화를 위한 메모이제이션)
  const bottomRadarData = React.useMemo(() => {
    return categoryData[selectedSubject] || [];
  }, [selectedSubject, categoryData]);
  return (
    <Card className="shadow-sm h-full flex flex-col px-6 py-5">
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
      <CardContent className="flex-1 pt-4 px-0 flex flex-col min-h-[500px] md:min-h-[600px]">
        <div className="bg-white focus:outline-none flex-1 min-h-[200px] md:min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart key={selectedClass} cx="50%" cy="50%" outerRadius="85%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any, name: string, props: any) => {
                  const num = typeof value === 'number' ? value : 0;
                  const mappedName = name === '내점수' ? '내 평균' : (name === '클래스평균' ? '클래스 평균' : name);
                  const hasData = props.payload?.hasData;
                  
                  // 미응시 (hasData가 false이고 점수가 0)면 "0점 (미응시)"로 표시
                  if (!hasData && num === 0) {
                    return ['0점 (미응시)', mappedName];
                  }
                  
                  // 응시한 경우 점수 표시
                  return [`${num}점`, mappedName];
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

        <div className="bg-white focus:outline-none flex-1 min-h-[200px] md:min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="85%" data={bottomRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip 
                formatter={(value: any, name: string, props: any) => {
                  const num = typeof value === 'number' ? value : 0;
                  const mappedName = name === '내점수' ? '내 평균' : (name === '클래스평균' ? '클래스 평균' : name);
                  const hasData = props.payload?.hasData;
                  
                  // 미응시 (hasData가 false이고 점수가 0)면 "0점 (미응시)"로 표시
                  if (!hasData && num === 0) {
                    return ['0점 (미응시)', mappedName];
                  }
                  
                  // 응시한 경우 점수 표시
                  return [`${num}점`, mappedName];
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