'use client';

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiChevronDown } from "react-icons/fi"
import { IoIosClose } from "react-icons/io"
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState('assignment')
  const router = useRouter()
  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<boolean[]>(Array(3).fill(false))
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [isAssignmentSelectModalOpen, setIsAssignmentSelectModalOpen] = useState(false)
  const [isStudentSelectModalOpen, setIsStudentSelectModalOpen] = useState(false)
  const [editingStudentIndex, setEditingStudentIndex] = useState<number | null>(null)
  const [deletingStudentIndex, setDeletingStudentIndex] = useState<number | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    studentPhone: '',
    parentPhone: '',
    school: '중학교',
    grade: '1학년'
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    studentPhone: '',
    parentPhone: '',
    school: '중학교',
    grade: '1학년'
  })
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    dueDate: ''
  })
  const [assignmentSelectAll, setAssignmentSelectAll] = useState(false)
  const [selectedAssignments, setSelectedAssignments] = useState<boolean[]>(Array(3).fill(false))
  const [studentSelectAll, setStudentSelectAll] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<boolean[]>(Array(3).fill(false))
  const [approvalSelectAll, setApprovalSelectAll] = useState(false)
  const [selectedApprovals, setSelectedApprovals] = useState<boolean[]>(Array(2).fill(false))
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [approvingStudentIndex, setApprovingStudentIndex] = useState<number | null>(null)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setSelectedRows(Array(studentResults.length).fill(checked))
  }

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelectedRows = [...selectedRows]
    newSelectedRows[index] = checked
    setSelectedRows(newSelectedRows)
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedRows.every(selected => selected)
    setSelectAll(allSelected)
  }

  const handleAssignmentSelectAll = (checked: boolean) => {
    setAssignmentSelectAll(checked)
    setSelectedAssignments(Array(3).fill(checked))
  }

  const handleAssignmentRowSelect = (index: number, checked: boolean) => {
    const newSelectedAssignments = [...selectedAssignments]
    newSelectedAssignments[index] = checked
    setSelectedAssignments(newSelectedAssignments)
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedAssignments.every(selected => selected)
    setAssignmentSelectAll(allSelected)
  }

  const handleStudentSelectAll = (checked: boolean) => {
    setStudentSelectAll(checked)
    setSelectedStudents(Array(studentResults.length).fill(checked))
  }

  const handleStudentRowSelect = (index: number, checked: boolean) => {
    const newSelectedStudents = [...selectedStudents]
    newSelectedStudents[index] = checked
    setSelectedStudents(newSelectedStudents)
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedStudents.every(selected => selected)
    setStudentSelectAll(allSelected)
  }

  const handleApprovalSelectAll = (checked: boolean) => {
    setApprovalSelectAll(checked)
    setSelectedApprovals(Array(approvalStudents.length).fill(checked))
  }

  const handleApprovalRowSelect = (index: number, checked: boolean) => {
    const newSelectedApprovals = [...selectedApprovals]
    newSelectedApprovals[index] = checked
    setSelectedApprovals(newSelectedApprovals)
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedApprovals.every(selected => selected)
    setApprovalSelectAll(allSelected)
  }

  // 승인 모달 관련 함수들
  const handleApprovalModalOpen = (index: number) => {
    setApprovingStudentIndex(index)
    setIsApprovalModalOpen(true)
  }

  const handleApprovalModalClose = () => {
    setIsApprovalModalOpen(false)
    setApprovingStudentIndex(null)
  }

  const handleStudentApproval = () => {
    if (approvingStudentIndex === null) {
      return
    }

    const studentToApprove = approvalStudents[approvingStudentIndex]
    
    // 승인된 학생을 학생 목록에 추가
    const approvedStudent = {
      name: studentToApprove.name,
      school: studentToApprove.school,
      grade: studentToApprove.grade,
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: studentToApprove.email,
      studentPhone: studentToApprove.studentPhone,
      parentPhone: studentToApprove.parentPhone
    }

    setStudentResults([...studentResults, approvedStudent])
    
    // 승인 대기 목록에서 제거
    const updatedApprovals = approvalStudents.filter((_, i) => i !== approvingStudentIndex)
    setApprovalStudents(updatedApprovals)
    
    // selectedRows 배열 크기 조정
    setSelectedRows([...selectedRows, false])
    
    // selectedApprovals 배열 크기 조정
    const newSelectedApprovals = selectedApprovals.filter((_, i) => i !== approvingStudentIndex)
    setSelectedApprovals(newSelectedApprovals)
    
    handleApprovalModalClose()
  }

  // 학생 등록 모달 관련 함수들
  const handleStudentModalClose = () => {
    setIsStudentModalOpen(false)
    setStudentFormData({
      name: '',
      email: '',
      studentPhone: '',
      parentPhone: '',
      school: '중학교',
      grade: '1학년'
    })
  }

  const handleStudentRegistration = () => {
    if (studentFormData.name.trim() === '') {
      return
    }
    if (studentFormData.email.trim() === '') {
      return
    }
    if (studentFormData.studentPhone.trim() === '') {
      return
    }
    if (studentFormData.parentPhone.trim() === '') {
      return
    }

    // 새로운 학생 데이터 생성
    const newStudent = {
      name: studentFormData.name,
      school: studentFormData.school,
      grade: studentFormData.grade,
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: studentFormData.email,
      studentPhone: studentFormData.studentPhone,
      parentPhone: studentFormData.parentPhone
    }

    // 학생 목록에 추가
    setStudentResults([...studentResults, newStudent])
    
    // selectedRows 배열 크기 조정
    setSelectedRows([...selectedRows, false])
    
    handleStudentModalClose()
  }

  // 학생 수정 모달 관련 함수들
  const handleEditModalOpen = (index: number) => {
    const student = studentResults[index]
    setEditingStudentIndex(index)
    setEditFormData({
      name: student.name,
      email: student.email,
      studentPhone: student.studentPhone,
      parentPhone: student.parentPhone,
      school: student.school,
      grade: student.grade
    })
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingStudentIndex(null)
    setEditFormData({
      name: '',
      email: '',
      studentPhone: '',
      parentPhone: '',
      school: '중학교',
      grade: '1학년'
    })
  }

  const handleStudentUpdate = () => {
    if (editFormData.name.trim() === '') {
      return
    }
    if (editFormData.email.trim() === '') {
      return
    }
    if (editFormData.studentPhone.trim() === '') {
      return
    }
    if (editFormData.parentPhone.trim() === '') {
      return
    }
    if (editingStudentIndex === null) {
      return
    }

    // 학생 데이터 업데이트
    const updatedStudents = [...studentResults]
    updatedStudents[editingStudentIndex] = {
      ...updatedStudents[editingStudentIndex],
      name: editFormData.name,
      email: editFormData.email,
      studentPhone: editFormData.studentPhone,
      parentPhone: editFormData.parentPhone,
      school: editFormData.school,
      grade: editFormData.grade
    }
    
    setStudentResults(updatedStudents)
    handleEditModalClose()
  }

  // 학생 삭제 모달 관련 함수들
  const handleDeleteModalOpen = (index: number) => {
    setDeletingStudentIndex(index)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setDeletingStudentIndex(null)
  }

  const handleStudentDelete = () => {
    if (deletingStudentIndex === null) {
      return
    }

    // 학생 데이터 삭제
    const updatedStudents = studentResults.filter((_, index) => index !== deletingStudentIndex)
    setStudentResults(updatedStudents)
    
    // selectedRows 배열 크기 조정
    const newSelectedRows = selectedRows.filter((_, index) => index !== deletingStudentIndex)
    setSelectedRows(newSelectedRows)
    
    // selectAll 상태 초기화
    setSelectAll(false)
    
    handleDeleteModalClose()
  }

  // 과제 등록 모달 관련 함수들
  const handleAssignmentModalClose = () => {
    setIsAssignmentModalOpen(false)
    setAssignmentFormData({
      title: '',
      dueDate: ''
    })
  }

  const handleAssignmentRegistration = () => {
    if (assignmentFormData.title.trim() === '') {
      return
    }
    if (assignmentFormData.dueDate.trim() === '') {
      return
    }

    // 첫 번째 모달 닫고 두 번째 모달 열기
    setIsAssignmentModalOpen(false)
    setIsAssignmentSelectModalOpen(true)
  }

  const handleAssignmentSelectModalClose = () => {
    setIsAssignmentSelectModalOpen(false)
    setAssignmentSelectAll(false)
    setSelectedAssignments(Array(3).fill(false))
  }

  const handleAssignmentToStudentSelect = () => {
    // 과제 선택 모달 닫고 학생 선택 모달 열기
    setIsAssignmentSelectModalOpen(false)
    setIsStudentSelectModalOpen(true)
  }

  const handleStudentSelectModalClose = () => {
    setIsStudentSelectModalOpen(false)
    setStudentSelectAll(false)
    setSelectedStudents(Array(studentResults.length).fill(false))
  }

  const handleAssignmentFinalRegistration = () => {
    // 선택된 학생들을 기반으로 새로운 과제 데이터 생성
    const selectedStudentData = studentResults.filter((_, index) => selectedStudents[index])
    
    const newAssignment = {
      id: assignments.length + 1,
      title: assignmentFormData.title,
      dueDate: assignmentFormData.dueDate,
      students: selectedStudentData.map(student => ({
        name: student.name,
        school: student.school,
        grade: student.grade,
        status: '미완료',
        score: '-',
        timeTaken: '-',
        completionDate: '-'
      }))
    }

    // 과제 목록에 추가
    setAssignments([...assignments, newAssignment])
    
    // 폼 데이터 초기화
    setAssignmentFormData({
      title: '',
      dueDate: ''
    })
    
    handleStudentSelectModalClose()
  }

  // 과제 데이터
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: '수학 1단원',
      dueDate: '2025.09.02 15:00',
      students: [
        {
          name: '이윤진',
          school: '고등학교',
          grade: '1학년',
          status: '완료',
          score: '80점',
          timeTaken: '45분',
          completionDate: '2025.09.02 15:00:00'
        },
        {
          name: '김민수',
          school: '고등학교',
          grade: '2학년',
          status: '미완료',
          score: '-',
          timeTaken: '-',
          completionDate: '-'
        },
        {
          name: '박지영',
          school: '중학교',
          grade: '3학년',
          status: '완료',
          score: '95점',
          timeTaken: '30분',
          completionDate: '2025.09.01 14:30:00'
        }
      ]
    },
    {
      id: 2,
      title: '영어 문법, 독해',
      dueDate: '2025.09.05 18:00',
      students: [
        {
          name: '이윤진',
          school: '고등학교',
          grade: '1학년',
          status: '완료',
          score: '85점',
          timeTaken: '20분',
          completionDate: '2025.09.03 10:15:00'
        },
        {
          name: '김민수',
          school: '고등학교',
          grade: '2학년',
          status: '미완료',
          score: '-',
          timeTaken: '-',
          completionDate: '-'
        },
        {
          name: '박지영',
          school: '중학교',
          grade: '3학년',
          status: '미완료',
          score: '-',
          timeTaken: '-',
          completionDate: '-'
        }
      ]
    },
    {
      id: 3,
      title: '국어 시 / 소설',
      dueDate: '2025.09.01 12:00',
      students: [
        {
          name: '이윤진',
          school: '고등학교',
          grade: '1학년',
          status: '완료',
          score: '90점',
          timeTaken: '60분',
          completionDate: '2025.08.31 16:45:00'
        },
        {
          name: '김민수',
          school: '고등학교',
          grade: '2학년',
          status: '완료',
          score: '75점',
          timeTaken: '55분',
          completionDate: '2025.08.31 17:30:00'
        },
        {
          name: '박지영',
          school: '중학교',
          grade: '3학년',
          status: '완료',
          score: '88점',
          timeTaken: '50분',
          completionDate: '2025.08.31 15:20:00'
        }
      ]
    }
  ])

  // 샘플 데이터
  const [studentResults, setStudentResults] = useState([
    {
      name: '이윤진',
      school: '고등학교',
      grade: '1학년',
      status: '완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00',
      email: 'test@naver.com',
      studentPhone: '010-1111-2222',
      parentPhone: '010-1111-2222'
    },
    {
      name: '이윤진',
      school: '고등학교',
      grade: '1학년',
      status: '미완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00',
      email: 'test@naver.com',
      studentPhone: '010-1111-2222',
      parentPhone: '010-1111-2222'
    },
    {
      name: '이윤진',
      school: '고등학교',
      grade: '1학년',
      status: '완료',
      score: '80점',
      timeTaken: '45분',
      completionDate: '2025.09.02 15:00:00',
      email: 'test@naver.com',
      studentPhone: '010-1111-2222',
      parentPhone: '010-1111-2222'
    }
  ])

  // 승인 대기 학생 데이터
  const [approvalStudents, setApprovalStudents] = useState([
    {
      name: '이문진',
      school: '고등학교',
      grade: '1학년',
      schoolName: '이용진',
      email: 'test@naver.com',
      studentPhone: '010-1111-2222',
      parentPhone: '010-3333-4444',
      status: '승인 대기'
    },
    {
      name: '김민수',
      school: '중학교',
      grade: '2학년',
      schoolName: '진건중학교',
      email: 'minsu@naver.com',
      studentPhone: '010-5555-6666',
      parentPhone: '010-7777-8888',
      status: '승인 대기'
    }
  ])

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
          gap: '15px' 
        }}
      >
        {/* 헤더 영역 */}
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => router.push('/class/create')}
            className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full"
          >
            <FiArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">과외의 아이 (클래스명)</h2>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'assignment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            과제 관리
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'student'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            학생 관리
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`pb-3 px-1 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'approval'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            승인 대기
            {approvalStudents.length > 0 && (
              <Badge 
                className="text-xs"
                style={{ 
                  backgroundColor: '#0072CE',
                  border: 'none',
                  color: '#fff',
                  padding: '2px 6px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
              >
                {approvalStudents.length}
              </Badge>
            )}
          </button>
        </div>

        {/* 과제 관리 탭 내용 */}
        {activeTab === 'assignment' && (
          <div className="space-y-6" style={{ padding: '10px' }}>
            {/* 과제 목록 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>과제 목록</h3>
              <button 
                onClick={() => setIsAssignmentModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                과제 생성
              </button>
            </div>

            {/* 과제 목록 아코디언 */}
            <div className="space-y-4 pb-4">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full"
                value={openAccordion || undefined}
                onValueChange={setOpenAccordion}
              >
                {assignments.map((assignment, index) => (
                  <AccordionItem key={assignment.id} value={`item-${assignment.id}`} className="mb-4 border-b-0">
                    {/* 아코디언 헤더 */}
                    <div 
                      className="border rounded-lg"
                      style={{ 
                        borderColor: openAccordion === `item-${assignment.id}` ? '#0072CE' : '#e5e7eb'
                      }}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex flex-col items-start">
                            <div className="text-sm text-gray-500 mb-1">
                              {assignment.dueDate} 까지
                            </div>
                            <div className="text-base font-medium text-gray-800">
                              {assignment.title}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                    </div>
                    
                    {/* 아코디언 내용 */}
                    <AccordionContent className="px-0 pb-0">
                      <div className="mt-4">
                        {/* 학생별 풀이 결과 섹션 */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">학생별 풀이 결과</h4>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">이름</TableHead>
                              <TableHead className="text-center">학교/학년</TableHead>
                              <TableHead className="text-center">상태</TableHead>
                              <TableHead className="text-center">점수</TableHead>
                              <TableHead className="text-center">소요 시간</TableHead>
                              <TableHead className="text-center">완료일시</TableHead>
                              <TableHead className="text-center">재전송</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignment.students.map((student, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-center text-sm text-gray-600">
                                  {student.name}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex gap-2 justify-center">
                                    <Badge 
                                      className="text-xs"
                                      style={{ 
                                        backgroundColor: student.school === '중학교' ? '#E6F3FF' : '#FFF5E9', 
                                        border: 'none', 
                                        color: student.school === '중학교' ? '#0085FF' : '#FF9F2D',
                                        padding: '4px 8px',
                                        minWidth: '40px',
                                        textAlign: 'center',
                                        display: 'inline-block'
                                      }}
                                    >
                                      {student.school === '중학교' ? '중등' : '고등'}
                                    </Badge>
                                    <Badge 
                                      className="text-xs"
                                      style={{ 
                                        backgroundColor: '#f5f5f5', 
                                        border: 'none', 
                                        color: '#999999',
                                        padding: '4px 8px',
                                        minWidth: '40px',
                                        textAlign: 'center',
                                        display: 'inline-block'
                                      }}
                                    >
                                      {student.grade}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    className="text-xs"
                                    style={{ 
                                      backgroundColor: student.status === '완료' ? '#F0F9F0' : '#FFF0F0',
                                      border: 'none',
                                      color: student.status === '완료' ? '#4CAF50' : '#F44336',
                                      padding: '4px 8px',
                                      minWidth: '50px',
                                      textAlign: 'center',
                                      display: 'inline-block'
                                    }}
                                  >
                                    {student.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center text-sm text-gray-600">
                                  {student.score}
                                </TableCell>
                                <TableCell className="text-center text-sm text-gray-600">
                                  {student.timeTaken}
                                </TableCell>
                                <TableCell className="text-center text-sm text-gray-600">
                                  {student.completionDate}
                                </TableCell>
                                <TableCell className="text-center">
                                  {student.status === '미완료' && (
                                    <button className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded">
                                      과제 재전송
                                    </button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* 학생 관리 탭 내용 */}
        {activeTab === 'student' && (
          <div className="space-y-6" style={{ padding: '10px' }}>
            {/* 학생 목록 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>학생 목록</h3>
              <button 
                onClick={() => setIsStudentModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                학생 등록
              </button>
            </div>

            {/* 학생 목록 테이블 */}
            <div 
              className="bg-white border border-gray-200 rounded-lg shadow-sm" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px',
                padding: '10px'
              }}
            >
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
                        학교/학년
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        이름
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학교명
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        이메일
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학생 연락처
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학부모 연락처
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
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {studentResults.map((student, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
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
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="flex gap-2">
                            <Badge 
                              className="text-sm"
                              style={{ 
                                backgroundColor: student.school === '중학교' ? '#E6F3FF' : '#FFF5E9', 
                                border: 'none', 
                                color: student.school === '중학교' ? '#0085FF' : '#FF9F2D',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}
                            >
                              {student.school}
                            </Badge>
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
                              {student.grade}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          진건고등학교
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.studentPhone}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.parentPhone}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleEditModalOpen(index)}
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
                            onClick={() => handleDeleteModalOpen(index)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 승인 대기 탭 내용 */}
        {activeTab === 'approval' && (
          <div className="space-y-6" style={{ padding: '10px' }}>
            {/* 승인 대기 목록 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800" style={{ padding: '0 10px' }}>학생 목록</h3>
            </div>

            {/* 승인 대기 학생 목록 테이블 */}
            <div 
              className="bg-white border border-gray-200 rounded-lg shadow-sm" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px',
                padding: '10px'
              }}
            >
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
                          checked={approvalSelectAll}
                          onCheckedChange={handleApprovalSelectAll}
                          className="data-[state=checked]:bg-[#0085FF] 
                                     data-[state=checked]:border-[#0085FF]"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학교/학년
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        이름
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학교명
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        이메일
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학생 연락처
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학부모 연락처
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        상태
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        삭제
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {approvalStudents.map((student, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <Checkbox 
                            checked={selectedApprovals[index] || false}
                            onCheckedChange={(checked: boolean) => 
                              handleApprovalRowSelect(index, checked)
                            }
                            className="data-[state=checked]:bg-[#0085FF] 
                                       data-[state=checked]:border-[#0085FF]"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="flex gap-2">
                            <Badge 
                              className="text-sm"
                              style={{ 
                                backgroundColor: student.school === '중학교' ? '#E6F3FF' : '#FFF5E9', 
                                border: 'none', 
                                color: student.school === '중학교' ? '#0085FF' : '#FF9F2D',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}
                            >
                              {student.school === '중학교' ? '중등' : '고등'}
                            </Badge>
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
                              {student.grade}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.schoolName}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.studentPhone}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.parentPhone}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleApprovalModalOpen(index)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              padding: '0', 
                              cursor: 'pointer' 
                            }}
                          >
                            <Badge 
                              className="text-xs hover:opacity-80 transition-opacity"
                              style={{ 
                                backgroundColor: '#FFF0F0',
                                border: 'none',
                                color: '#F44336',
                                padding: '4px 8px',
                                minWidth: '70px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}
                            >
                              {student.status}
                            </Badge>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => {
                              // 승인 대기 학생 삭제 로직
                              const updatedApprovals = approvalStudents.filter((_, i) => i !== index)
                              setApprovalStudents(updatedApprovals)
                              const newSelectedApprovals = selectedApprovals.filter((_, i) => i !== index)
                              setSelectedApprovals(newSelectedApprovals)
                            }}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* 학생 등록 모달창 */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
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
              학생 등록
            </DialogTitle>
            <button 
              onClick={handleStudentModalClose}
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
            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력해 주세요."
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  placeholder="이메일을 입력해 주세요."
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData({...studentFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학생 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 연락처
                </label>
                <input
                  type="tel"
                  placeholder="학생의 연락처를 입력해 주세요."
                  value={studentFormData.studentPhone}
                  onChange={(e) => setStudentFormData({...studentFormData, studentPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학부모 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학부모 연락처
                </label>
                <input
                  type="tel"
                  placeholder="학부모의 연락처를 입력해 주세요."
                  value={studentFormData.parentPhone}
                  onChange={(e) => setStudentFormData({...studentFormData, parentPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학교/학년 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학교
                  </label>
                  <Select 
                    value={studentFormData.school}
                    onValueChange={(value) => setStudentFormData({...studentFormData, school: value})}
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
                    value={studentFormData.grade}
                    onValueChange={(value) => setStudentFormData({...studentFormData, grade: value})}
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
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleStudentModalClose}
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
              onClick={handleStudentRegistration}
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
              등록
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 수정 모달창 */}
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
              학생 정보 수정
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
            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력해 주세요."
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  placeholder="이메일을 입력해 주세요."
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학생 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 연락처
                </label>
                <input
                  type="tel"
                  placeholder="학생의 연락처를 입력해 주세요."
                  value={editFormData.studentPhone}
                  onChange={(e) => setEditFormData({...editFormData, studentPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학부모 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학부모 연락처
                </label>
                <input
                  type="tel"
                  placeholder="학부모의 연락처를 입력해 주세요."
                  value={editFormData.parentPhone}
                  onChange={(e) => setEditFormData({...editFormData, parentPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 학교/학년 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학교
                  </label>
                  <Select 
                    value={editFormData.school}
                    onValueChange={(value) => setEditFormData({...editFormData, school: value})}
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
                    value={editFormData.grade}
                    onValueChange={(value) => setEditFormData({...editFormData, grade: value})}
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
              onClick={handleStudentUpdate}
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
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 삭제 확인 모달창 */}
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
              학생 삭제
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
                선택하신 학생과 관련된 모든 정보(이름, 연락처 등)가 삭제됩니다.
              </div>
              <div className="text-sm text-gray-600 mb-3">
                삭제된 학생 정보는 다시 복구할 수 없습니다.
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
              onClick={handleStudentDelete}
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

      {/* 과제 등록 모달창 */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
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
              과제 등록
            </DialogTitle>
            <button 
              onClick={handleAssignmentModalClose}
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
            <div className="space-y-4">
              {/* 과제명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제명
                </label>
                <input
                  type="text"
                  placeholder="과제를 입력해주세요."
                  value={assignmentFormData.title}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>

              {/* 마감일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마감일
                </label>
                <input
                  type="datetime-local"
                  placeholder="마감일을 선택해주세요."
                  value={assignmentFormData.dueDate}
                  onChange={(e) => setAssignmentFormData({...assignmentFormData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleAssignmentModalClose}
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
              onClick={handleAssignmentRegistration}
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
              다음
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 과제 선택 모달창 */}
      <Dialog open={isAssignmentSelectModalOpen} onOpenChange={setIsAssignmentSelectModalOpen}>
        <DialogContent 
          className="w-auto max-w-4xl"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px',
            width: 'fit-content',
            minWidth: '600px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              과제 등록
            </DialogTitle>
            <button 
              onClick={handleAssignmentSelectModalClose}
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
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
                          checked={assignmentSelectAll}
                          onCheckedChange={handleAssignmentSelectAll}
                          className="data-[state=checked]:bg-[#0085FF] 
                                     data-[state=checked]:border-[#0085FF]"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        학교 / 학년
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        제목
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        문제 유형
                      </div>
                    </TableHead>
                    <TableHead className="text-left text-sm font-bold 
                                          uppercase tracking-wider">
                      <div className="flex items-center justify-center text-base font-bold" style={{ color: '#666' }}>
                        생성일
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      school: '중학교',
                      grade: '1학년',
                      title: '소인수분해 - 10문제',
                      problemType: '소인수분해',
                      creationDate: '2025.09.10'
                    },
                    {
                      school: '중학교',
                      grade: '1학년',
                      title: '소인수분해 - 10문제',
                      problemType: '소인수분해',
                      creationDate: '2025.09.10'
                    },
                    {
                      school: '중학교',
                      grade: '1학년',
                      title: '소인수분해 - 10문제',
                      problemType: '소인수분해',
                      creationDate: '2025.09.10'
                    }
                  ].map((assignment, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <Checkbox 
                            checked={selectedAssignments[index] || false}
                            onCheckedChange={(checked: boolean) => 
                              handleAssignmentRowSelect(index, checked)
                            }
                            className="data-[state=checked]:bg-[#0085FF] 
                                       data-[state=checked]:border-[#0085FF]"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="flex gap-2">
                            <Badge 
                              className="text-sm"
                              style={{ 
                                backgroundColor: '#E6F3FF', 
                                border: '1px solid #0085FF', 
                                color: '#0085FF',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}
                            >
                              중등
                            </Badge>
                            <Badge 
                              className="text-sm"
                              style={{ 
                                backgroundColor: '#f5f5f5', 
                                border: '1px solid #999999', 
                                color: '#999999',
                                padding: '6px 12px',
                                minWidth: '60px',
                                textAlign: 'center',
                                display: 'inline-block'
                              }}
                            >
                              {assignment.grade}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {assignment.title}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {assignment.problemType}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {assignment.creationDate}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={() => {
                setIsAssignmentSelectModalOpen(false)
                setIsAssignmentModalOpen(true)
              }}
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
              이전
            </button>
            <button 
              onClick={handleAssignmentToStudentSelect}
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
              다음
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 선택 모달창 */}
      <Dialog open={isStudentSelectModalOpen} onOpenChange={setIsStudentSelectModalOpen}>
        <DialogContent 
          className="w-auto max-w-4xl"
          showCloseButton={false}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '5px', 
            padding: '40px',
            width: 'fit-content',
            minWidth: '600px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              과제 등록
            </DialogTitle>
            <button 
              onClick={handleStudentSelectModalClose}
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
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
                          checked={studentSelectAll}
                          onCheckedChange={handleStudentSelectAll}
                          className="data-[state=checked]:bg-[#0085FF] 
                                     data-[state=checked]:border-[#0085FF]"
                        />
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
                        이름
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {studentResults.map((student, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <Checkbox 
                            checked={selectedStudents[index] || false}
                            onCheckedChange={(checked: boolean) => 
                              handleStudentRowSelect(index, checked)
                            }
                            className="data-[state=checked]:bg-[#0085FF] 
                                       data-[state=checked]:border-[#0085FF]"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <Badge 
                            className="text-sm"
                            style={{ 
                              backgroundColor: student.school === '중학교' ? '#E6F3FF' : '#FFF5E9', 
                              border: 'none', 
                              color: student.school === '중학교' ? '#0085FF' : '#FF9F2D',
                              padding: '6px 12px',
                              minWidth: '60px',
                              textAlign: 'center',
                              display: 'inline-block'
                            }}
                          >
                            {student.school === '중학교' ? '중등' : '고등'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
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
                            {student.grade}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          {student.name}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={() => {
                setIsStudentSelectModalOpen(false)
                setIsAssignmentSelectModalOpen(true)
              }}
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
              이전
            </button>
            <button 
              onClick={handleAssignmentFinalRegistration}
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
              다음
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 승인 모달창 */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
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
              학생 승인
            </DialogTitle>
            <button 
              onClick={handleApprovalModalClose}
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
            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.name || '' : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             bg-gray-50 text-gray-700"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.email || '' : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             bg-gray-50 text-gray-700"
                />
              </div>

              {/* 학생 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 연락처
                </label>
                <input
                  type="tel"
                  value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.studentPhone || '' : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             bg-gray-50 text-gray-700"
                />
              </div>

              {/* 학부모 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학부모 연락처
                </label>
                <input
                  type="tel"
                  value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.parentPhone || '' : ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                             bg-gray-50 text-gray-700"
                />
              </div>

              {/* 학교/학년 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학교
                  </label>
                  <input
                    type="text"
                    value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.school || '' : ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               bg-gray-50 text-gray-700"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <input
                    type="text"
                    value={approvingStudentIndex !== null ? approvalStudents[approvingStudentIndex]?.grade || '' : ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleApprovalModalClose}
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
              onClick={handleStudentApproval}
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
              승인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
