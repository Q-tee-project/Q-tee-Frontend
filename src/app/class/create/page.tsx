'use client';

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoIosArrowDown, IoIosClose } from "react-icons/io";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ClassCreatePage() {
  const router = useRouter();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>(Array(2).fill(false));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deletingClass, setDeletingClass] = useState<any>(null);
  const [viewingClass, setViewingClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [formData, setFormData] = useState({
    className: '',
    school: '중학교',
    grade: '1학년',
    startHour: '01시',
    startMinute: '00분',
    endHour: '01시',
    endMinute: '00분'
  });

  // 샘플 데이터
  const [classData, setClassData] = useState([
    {
      id: 1,
      name: '중학교 A반',
      school: '중학교',
      grade: '1학년',
      studentCount: 3,
      selectedDays: [false, true, false, true, false, false, false], // 월,화,수,목,금,토,일
      startHour: '09시',
      startMinute: '00분',
      endHour: '10시',
      endMinute: '00분',
      code: '1Q2W3E4R'
    },
    {
      id: 2,
      name: '고등학교 B반',
      school: '고등학교',
      grade: '2학년',
      studentCount: 5,
      selectedDays: [true, false, true, false, false, false, false], // 월,화,수,목,금,토,일
      startHour: '14시',
      startMinute: '30분',
      endHour: '15시',
      endMinute: '30분',
      code: '5T6Y7U8I'
    }
  ]);

  // 검색 필터링
  const filteredClasses = classData.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(Array(filteredClasses.length).fill(checked));
  };

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows[index] = checked;
    setSelectedRows(newSelectedRows);
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedRows.every(selected => selected);
    setSelectAll(allSelected);
  };

  // 검색어가 변경될 때 selectedRows 배열 크기 조정
  React.useEffect(() => {
    setSelectedRows(Array(filteredClasses.length).fill(false));
    setSelectAll(false);
  }, [filteredClasses.length]);

  // 요일 선택 핸들러
  const handleDaySelect = (index: number) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setFormData({
      className: '',
      school: '중학교',
      grade: '1학년',
      startHour: '01시',
      startMinute: '00분',
      endHour: '01시',
      endMinute: '00분'
    });
    setSelectedDays([false, false, false, false, false, false, false]);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // 수정 모달 열기 핸들러
  const handleEditModalOpen = (classItem: any) => {
    setEditingClass(classItem);
    setFormData({
      className: classItem.name.split(' (')[0], // 요일 정보 제거
      school: classItem.school,
      grade: classItem.grade,
      startHour: classItem.startHour,
      startMinute: classItem.startMinute,
      endHour: classItem.endHour,
      endMinute: classItem.endMinute
    });
    setSelectedDays(classItem.selectedDays);
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기 핸들러
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingClass(null);
    resetForm();
  };

  // 수정 완료 핸들러
  const handleEditComplete = () => {
    if (editingClass) {
      const updatedClassData = classData.map(item => 
        item.id === editingClass.id 
          ? {
              ...item,
              name: formData.className,
              school: formData.school,
              grade: formData.grade,
              startHour: formData.startHour,
              startMinute: formData.startMinute,
              endHour: formData.endHour,
              endMinute: formData.endMinute,
              selectedDays: selectedDays
            }
          : item
      );
      
      setClassData(updatedClassData);
      handleEditModalClose();
    }
  };

  // 삭제 모달 열기 핸들러
  const handleDeleteModalOpen = (classItem: any) => {
    setDeletingClass(classItem);
    setIsDeleteModalOpen(true);
  };

  // 삭제 모달 닫기 핸들러
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingClass(null);
  };

  // 삭제 완료 핸들러
  const handleDeleteComplete = () => {
    if (deletingClass) {
      const updatedClassData = classData.filter(item => item.id !== deletingClass.id);
      setClassData(updatedClassData);
      handleDeleteModalClose();
    }
  };

  // 생성 완료 핸들러
  const handleCreateComplete = () => {
    if (formData.className.trim() === '') {
      alert('클래스명을 입력해주세요.');
      return;
    }

    const selectedDayNames = ['월', '화', '수', '목', '금', '토', '일']
      .filter((_, index) => selectedDays[index])
      .join(', ');

    if (selectedDayNames === '') {
      alert('요일을 선택해주세요.');
      return;
    }

    // 새로운 클래스 ID 생성 (기존 ID 중 최대값 + 1)
    const newId = Math.max(...classData.map(item => item.id)) + 1;

    // 랜덤 코드 생성 함수
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newClass = {
      id: newId,
      name: formData.className,
      school: formData.school,
      grade: formData.grade,
      studentCount: 0, // 새로 생성된 클래스는 학생 수 0명
      selectedDays: selectedDays,
      startHour: formData.startHour,
      startMinute: formData.startMinute,
      endHour: formData.endHour,
      endMinute: formData.endMinute,
      code: generateCode() // 자동으로 코드 생성
    };

    setClassData([...classData, newClass]);
    handleModalClose();
  };

  // 코드 모달 열기 핸들러
  const handleCodeModalOpen = (classItem: any) => {
    setViewingClass(classItem);
    setIsCodeModalOpen(true);
  };

  // 코드 모달 닫기 핸들러
  const handleCodeModalClose = () => {
    setIsCodeModalOpen(false);
    setViewingClass(null);
  };

  // 코드 복사 핸들러
  const handleCopyCode = () => {
    if (viewingClass && viewingClass.code) {
      navigator.clipboard.writeText(viewingClass.code).then(() => {
        alert('코드가 클립보드에 복사되었습니다.');
      }).catch(() => {
        alert('코드 복사에 실패했습니다.');
      });
    }
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: '#EFF0F5', 
        padding: '40px 60px' 
      }}
    >
      {/* 페이지 제목 */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        수업 관리
      </h1>
      
      {/* 메인 콘텐츠 영역 */}
      <div 
        className="bg-white shadow-sm" 
        style={{ 
          padding: '40px 50px', 
          borderRadius: '5px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px' 
        }}
      >
        {/* 검색 및 생성 버튼 영역 */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="클래스 명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent"
              style={{ width: '400px', paddingLeft: '20px', paddingRight: '20px' }}
            />
            <div 
              className="absolute inset-y-0 right-0 flex items-center 
                         pointer-events-none" 
              style={{ 
                paddingRight: '20px',
                alignItems: 'center' 
              }}
            >
              <svg 
                className="h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg 
                       hover:bg-blue-700 transition-colors font-medium"
          >
            신규 수업 생성하기
          </button>
        </div>

        <div>
          {/* 수업 목록 카드 */}
          <div 
            className="bg-white border border-gray-200 rounded-lg shadow-sm" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              padding: '20px'
            }}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              수업 목록
            </h2>
        
            <Table>
              <TableHeader 
                style={{ 
                  background: '#fff', 
                  borderBottom: '1px solid #666' 
                }}
              >
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-left">
                    <div className="flex items-center justify-center">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-[#0085FF] 
                                   data-[state=checked]:border-[#0085FF]"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      클래스명
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      학교
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      학년
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      요일/시간
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      학생 수
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      수정
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      삭제
                    </div>
                  </TableHead>
                  <TableHead className="text-left text-sm font-bold 
                                        uppercase tracking-wider">
                    <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                      코드
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {/* 테이블 행들 */}
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 클래스가 없습니다.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((classItem, index) => (
                  <TableRow key={classItem.id} className="hover:bg-gray-50">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <Checkbox 
                          checked={selectedRows[index] || false}
                          onCheckedChange={(checked: boolean) => 
                            handleRowSelect(index, checked)
                          }
                          className="data-[state=checked]:bg-[#0085FF] 
                                     data-[state=checked]:border-[#0085FF]"
                        />
                      </div>
                    </TableCell>
                    <TableCell 
                      className="whitespace-nowrap text-sm font-medium cursor-pointer"
                      onClick={() => router.push(`/class/${classItem.id}`)}
                    >
                      <div className="flex items-center justify-center text-sm text-gray-600 hover:text-blue-600">
                        {classItem.name}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="whitespace-nowrap cursor-pointer"
                      onClick={() => router.push(`/class/${classItem.id}`)}
                    >
                      <div className="flex items-center justify-center">
                        <Badge 
                          className="text-sm"
                          style={{ 
                            backgroundColor: classItem.school === '중학교' ? '#E6F3FF' : '#FFF5E9', 
                            border: 'none', 
                            color: classItem.school === '중학교' ? '#0085FF' : '#FF9F2D',
                            padding: '6px 12px',
                            minWidth: '80px',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          {classItem.school}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="whitespace-nowrap cursor-pointer"
                      onClick={() => router.push(`/class/${classItem.id}`)}
                    >
                      <div className="flex items-center justify-center">
                        <Badge 
                          className="text-sm"
                          style={{ 
                            backgroundColor: '#f5f5f5', 
                            border: 'none', 
                            color: '#999999',
                            padding: '6px 12px',
                            minWidth: '60px',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          {classItem.grade}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell 
                      className="whitespace-nowrap text-sm cursor-pointer"
                      onClick={() => router.push(`/class/${classItem.id}`)}
                    >
                      <div className="flex items-center justify-center text-sm text-gray-600 hover:text-blue-600">
                        {(() => {
                          const selectedDayNames = ['월', '화', '수', '목', '금', '토', '일']
                            .filter((_, index) => classItem.selectedDays[index])
                            .join(', ');
                          const timeString = `${classItem.startHour.replace('시', '')}:${classItem.startMinute.replace('분', '')} - ${classItem.endHour.replace('시', '')}:${classItem.endMinute.replace('분', '')}`;
                          return `${selectedDayNames} (${timeString})`;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell 
                      className="whitespace-nowrap text-sm cursor-pointer"
                      onClick={() => router.push(`/class/${classItem.id}`)}
                    >
                      <div className="flex items-center justify-center text-sm text-gray-600 hover:text-blue-600">
                        총 {classItem.studentCount}명
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleEditModalOpen(classItem)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            padding: '0', 
                            cursor: 'pointer' 
                          }}
                        >
                          <svg 
                            className="h-5 w-5" 
                            fill="none" 
                            stroke="#666" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleDeleteModalOpen(classItem)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            padding: '0', 
                            cursor: 'pointer' 
                          }}
                        >
                          <svg 
                            className="h-5 w-5" 
                            fill="none" 
                            stroke="#666" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleCodeModalOpen(classItem)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            padding: '0', 
                            cursor: 'pointer' 
                          }}
                        >
                          <svg 
                            className="h-5 w-5" 
                            fill="none" 
                            stroke="#666" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 클래스 생성 모달창 시작 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-w-md"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px' 
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              클래스 생성
            </DialogTitle>
            <button 
              onClick={handleModalClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '0', 
                cursor: 'pointer',
                color: '#000'
              }}
            >
              <IoIosClose size={32} />
            </button>
          </DialogHeader>

          {/* modal-body */}
          <div className="space-y-4">
            {/* 입력과 선택 부분 */}
            <div className="space-y-4">
              {/* 클래스명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  클래스명
                </label>
                <input
                  type="text"
                  placeholder="클래스 이름을 입력해 주세요."
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학교,학년 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학교
                  </label>
                  <Select 
                    value={formData.school}
                    onValueChange={(value) => setFormData({...formData, school: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="학교 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="중학교">중학교</SelectItem>
                      <SelectItem value="고등학교">고등학교</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <Select 
                    value={formData.grade}
                    onValueChange={(value) => setFormData({...formData, grade: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="학년 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1학년">1학년</SelectItem>
                      <SelectItem value="2학년">2학년</SelectItem>
                      <SelectItem value="3학년">3학년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 요일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요일 선택
                </label>
                <div className="flex gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(index)}
                      className="flex-1 aspect-square flex items-center justify-center"
                      style={{
                        background: 'none',
                        border: selectedDays[index] ? '1px solid #0072CE' : '1px solid #D1D1D1',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        color: selectedDays[index] ? '#0072CE' : '#666',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시작 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작 시간
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={formData.startHour}
                      onValueChange={(value) => setFormData({...formData, startHour: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] [&>button]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${String(i + 1).padStart(2, '0')}시`}>
                            {String(i + 1).padStart(2, '0')}시
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={formData.startMinute}
                      onValueChange={(value) => setFormData({...formData, startMinute: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="분 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00분">00분</SelectItem>
                        <SelectItem value="10분">10분</SelectItem>
                        <SelectItem value="20분">20분</SelectItem>
                        <SelectItem value="30분">30분</SelectItem>
                        <SelectItem value="40분">40분</SelectItem>
                        <SelectItem value="50분">50분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 종료 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료 시간
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={formData.endHour}
                      onValueChange={(value) => setFormData({...formData, endHour: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] [&>button]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${String(i + 1).padStart(2, '0')}시`}>
                            {String(i + 1).padStart(2, '0')}시
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={formData.endMinute}
                      onValueChange={(value) => setFormData({...formData, endMinute: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="분 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00분">00분</SelectItem>
                        <SelectItem value="10분">10분</SelectItem>
                        <SelectItem value="20분">20분</SelectItem>
                        <SelectItem value="30분">30분</SelectItem>
                        <SelectItem value="40분">40분</SelectItem>
                        <SelectItem value="50분">50분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleModalClose}
              className="flex-1"
              style={{
                background: '#F5F5F5',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              취소
            </button>
            <button 
              onClick={handleCreateComplete}
              className="flex-1"
              style={{
                background: '#0072CE',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              생성
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 클래스 생성 모달창 끝 */}

      {/* 클래스 수정 모달창 시작 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent 
          className="max-w-md"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px' 
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              클래스 수정
            </DialogTitle>
            <button 
              onClick={handleEditModalClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '0', 
                cursor: 'pointer',
                color: '#000'
              }}
            >
              <IoIosClose size={32} />
            </button>
          </DialogHeader>

          {/* modal-body */}
          <div className="space-y-4">
            {/* 입력과 선택 부분 */}
            <div className="space-y-4">
              {/* 클래스명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  클래스명
                </label>
                <input
                  type="text"
                  placeholder="클래스 이름을 입력해 주세요."
                  value={formData.className}
                  onChange={(e) => setFormData({...formData, className: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학교,학년 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학교
                  </label>
                  <Select 
                    value={formData.school}
                    onValueChange={(value) => setFormData({...formData, school: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="학교 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="중학교">중학교</SelectItem>
                      <SelectItem value="고등학교">고등학교</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <Select 
                    value={formData.grade}
                    onValueChange={(value) => setFormData({...formData, grade: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="학년 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1학년">1학년</SelectItem>
                      <SelectItem value="2학년">2학년</SelectItem>
                      <SelectItem value="3학년">3학년</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 요일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요일 선택
                </label>
                <div className="flex gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(index)}
                      className="flex-1 aspect-square flex items-center justify-center"
                      style={{
                        background: 'none',
                        border: selectedDays[index] ? '1px solid #0072CE' : '1px solid #D1D1D1',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        color: selectedDays[index] ? '#0072CE' : '#666',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시작 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작 시간
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={formData.startHour}
                      onValueChange={(value) => setFormData({...formData, startHour: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] [&>button]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${String(i + 1).padStart(2, '0')}시`}>
                            {String(i + 1).padStart(2, '0')}시
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={formData.startMinute}
                      onValueChange={(value) => setFormData({...formData, startMinute: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="분 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00분">00분</SelectItem>
                        <SelectItem value="10분">10분</SelectItem>
                        <SelectItem value="20분">20분</SelectItem>
                        <SelectItem value="30분">30분</SelectItem>
                        <SelectItem value="40분">40분</SelectItem>
                        <SelectItem value="50분">50분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 종료 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료 시간
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={formData.endHour}
                      onValueChange={(value) => setFormData({...formData, endHour: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="시간 선택" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] [&>button]:hidden [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${String(i + 1).padStart(2, '0')}시`}>
                            {String(i + 1).padStart(2, '0')}시
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={formData.endMinute}
                      onValueChange={(value) => setFormData({...formData, endMinute: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="분 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00분">00분</SelectItem>
                        <SelectItem value="10분">10분</SelectItem>
                        <SelectItem value="20분">20분</SelectItem>
                        <SelectItem value="30분">30분</SelectItem>
                        <SelectItem value="40분">40분</SelectItem>
                        <SelectItem value="50분">50분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleEditModalClose}
              className="flex-1"
              style={{
                background: '#F5F5F5',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              취소
            </button>
            <button 
              onClick={handleEditComplete}
              className="flex-1"
              style={{
                background: '#0072CE',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              수정
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 클래스 수정 모달창 끝 */}

      {/* 클래스 삭제 확인 모달창 시작 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent 
          className="max-w-md"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px' 
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              클래스 삭제
            </DialogTitle>
            <button 
              onClick={handleDeleteModalClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '0', 
                cursor: 'pointer',
                color: '#000'
              }}
            >
              <IoIosClose size={32} />
            </button>
          </DialogHeader>

          {/* modal-body */}
          <div className="space-y-4">
            <div className="py-4">
              <div className="text-sm text-gray-600 mb-3">
                선택하신 수업과 관련된 모든 정보(문제, 기록 등)가 삭제됩니다.
              </div>
              <div className="text-sm text-gray-600 mb-3">
                삭제된 수업은 다시 복구할 수 없습니다.
              </div>
              <div className="text-sm text-gray-600 mb-3">
                정말 삭제하시겠습니까?
              </div>
              <div className="text-sm text-gray-600">
                삭제를 원하시면 <span className="text-blue-600 font-medium">[삭제]</span> 버튼을 눌러주세요.
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleDeleteModalClose}
              className="flex-1"
              style={{
                background: '#F5F5F5',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              취소
            </button>
            <button 
              onClick={handleDeleteComplete}
              className="flex-1"
              style={{
                background: '#DC2626',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 클래스 삭제 확인 모달창 끝 */}

      {/* 과외 코드 확인 모달창 시작 */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent 
          className="max-w-md"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px' 
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              과외 코드 확인
            </DialogTitle>
            <button 
              onClick={handleCodeModalClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '0', 
                cursor: 'pointer',
                color: '#000'
              }}
            >
              <IoIosClose size={32} />
            </button>
          </DialogHeader>

          {/* modal-body */}
          <div className="space-y-4">
            <div className="py-4">
              <div className="text-sm text-gray-600 mb-4">
                아래 코드를 학생이 입력 할 경우 해당 수업에 참여할 수 있습니다.
              </div>
              
              {/* 코드 표시 영역 */}
              <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-gray-800 tracking-wider ml-4">
                  {viewingClass?.code || ''}
                </div>
                <button 
                  onClick={handleCopyCode}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '8px', 
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  className="hover:bg-gray-200 transition-colors"
                >
                  <svg 
                    className="h-5 w-5 text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex">
            <button 
              onClick={handleCodeModalClose}
              className="w-full"
              style={{
                background: '#0072CE',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              닫기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 과외 코드 확인 모달창 끝 */}
    </div>
  )
}