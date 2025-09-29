'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
  return (
    <Card className="shadow-sm lg:col-span-2 h-full flex flex-col px-6 py-5">
      <CardHeader className="px-0 py-0">
        <h3 className="text-xl font-bold text-gray-900">과목별 전체 평균과 내 평균</h3>
      </CardHeader>
      <div className="px-0">
        <div className="flex items-center gap-4">
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
        </div>
      </div>
      <CardContent className="flex-1 pt-4 px-0">
        <div className="h-96 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="클래스평균" dataKey="클래스평균" stroke="#9674CF" fill="#9674CF" fillOpacity={0.4} />
              <Radar name="내점수" dataKey="내점수" stroke="#18BBCB" fill="#18BBCB" fillOpacity={0.4} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* 과목별 점수 요약 정보 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* 국어 */}
            <div className="p-3 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">국어</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-green-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '국어')?.클래스평균 || 0}점
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">내 점수</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-green-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '국어')?.내점수 || 0}점
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 영어 */}
            <div className="p-3 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">영어</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-purple-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '영어')?.클래스평균 || 0}점
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">내 점수</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-purple-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '영어')?.내점수 || 0}점
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 수학 */}
            <div className="p-3 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">수학</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">전체 평균</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-yellow-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '수학')?.클래스평균 || 0}점
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="text-xs text-gray-500 mb-2 text-left">내 점수</div>
                  <div className="flex flex-col justify-center items-center p-4 bg-yellow-50 rounded-lg h-24">
                    <div className="text-2xl font-bold text-gray-900">
                      {radarData.find(item => item.subject === '수학')?.내점수 || 0}점
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectAverage;
