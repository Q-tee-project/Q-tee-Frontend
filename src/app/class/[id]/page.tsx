'use client';

<<<<<<< HEAD
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { AssignmentTab } from '@/components/class/AssignmentTab';
import { StudentManagementTab } from '@/components/class/StudentManagementTab';
import { ApprovalTab } from '@/components/class/ApprovalTab';

interface ClassDetailPageProps {
  params: {
    id: string;
  };
}
=======
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
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
  const [isResendModalOpen, setIsResendModalOpen] = useState(false)
  const [resendingStudentIndex, setResendingStudentIndex] = useState<number | null>(null)
  const [assignmentFormErrors, setAssignmentFormErrors] = useState({
    title: false,
    dueDate: false
  })
  
  // 클래스 정보 (URL 파라미터에서 가져옴)
  const [classInfo, setClassInfo] = useState({
    school: '고등학교',
    grade: '1학년'
  })

  // URL 파라미터에서 클래스 정보 가져오기
  useEffect(() => {
    const school = searchParams.get('school')
    const grade = searchParams.get('grade')
    
    if (school && grade) {
      setClassInfo({
        school: decodeURIComponent(school),
        grade: decodeURIComponent(grade)
      })
    }
  }, [searchParams])

  // 클래스 정보가 변경될 때마다 학생 목록 필터링
  useEffect(() => {
    setStudentResults(
      allStudents.filter(student => 
        student.school === classInfo.school && student.grade === classInfo.grade
      )
    )
    setApprovalStudents(
      allApprovalStudents.filter(student => 
        student.school === classInfo.school && student.grade === classInfo.grade
      )
    )
  }, [classInfo.school, classInfo.grade])
>>>>>>> 3d77f5b148f43fa3155f98e33524a53f0d47158d

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const [activeTab, setActiveTab] = useState('assignment');
  const router = useRouter();
  
  const classId = params.id;

<<<<<<< HEAD
  const tabs = [
    { id: 'assignment', label: '과제 목록', count: 0 },
    { id: 'student', label: '학생 관리', count: 0 },
    { id: 'approval', label: '승인 대기', count: 0 }
  ];
=======
  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelectedRows = [...selectedRows]
    newSelectedRows[index] = checked
    setSelectedRows(newSelectedRows)
    
    // 모든 행이 선택되었는지 확인
    const allSelected = newSelectedRows.every(selected => selected)
    setSelectAll(allSelected)
  }

  // 과제 선택 관련 함수들 (라디오 버튼으로 단일 선택만 가능)

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

  // 메일 재전송 모달 관련 함수들
  const handleResendModalOpen = (index: number) => {
    setResendingStudentIndex(index)
    setIsResendModalOpen(true)
  }

  const handleResendModalClose = () => {
    setIsResendModalOpen(false)
    setResendingStudentIndex(null)
  }

  const handleEmailResend = () => {
    if (resendingStudentIndex === null) {
      return
    }

    // 메일 재전송 로직 (실제로는 API 호출)
    alert('메일이 재전송되었습니다.')
    
    handleResendModalClose()
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

    // 새로운 승인 대기 학생 데이터 생성 (메일 전송 상태)
    const newApprovalStudent = {
      name: studentFormData.name,
      school: classInfo.school,
      grade: classInfo.grade,
      schoolName: classInfo.school === '중학교' ? '진건중학교' : '진건고등학교',
      email: studentFormData.email,
      studentPhone: studentFormData.studentPhone,
      parentPhone: studentFormData.parentPhone,
      status: '메일 전송'
    }

    // 승인 대기 목록에 추가
    setApprovalStudents([...approvalStudents, newApprovalStudent])
    
    // selectedApprovals 배열 크기 조정
    setSelectedApprovals([...selectedApprovals, false])
    
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
      school: classInfo.school, // 클래스의 학교 정보로 고정
      grade: classInfo.grade    // 클래스의 학년 정보로 고정
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
      school: classInfo.school, // 클래스의 학교 정보로 초기화
      grade: classInfo.grade    // 클래스의 학년 정보로 초기화
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
      school: classInfo.school, // 클래스의 학교 정보로 고정
      grade: classInfo.grade    // 클래스의 학년 정보로 고정
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
    setAssignmentFormErrors({
      title: false,
      dueDate: false
    })
  }

  const handleAssignmentRegistration = () => {
    // 에러 상태 초기화
    setAssignmentFormErrors({ title: false, dueDate: false })
    
    let hasError = false
    
    // 입력 검증
    if (assignmentFormData.title.trim() === '') {
      setAssignmentFormErrors(prev => ({ ...prev, title: true }))
      hasError = true
    }
    if (assignmentFormData.dueDate.trim() === '') {
      setAssignmentFormErrors(prev => ({ ...prev, dueDate: true }))
      hasError = true
    }
    
    if (hasError) {
      return
    }

    // 첫 번째 모달 닫고 두 번째 모달 열기
    setIsAssignmentModalOpen(false)
    setIsAssignmentSelectModalOpen(true)
  }

  const handleAssignmentSelectModalClose = () => {
    setIsAssignmentSelectModalOpen(false)
    setSelectedAssignments(Array(3).fill(false))
    // 과제 등록 모달로 돌아갈 때 폼 데이터 초기화
    setAssignmentFormData({
      title: '',
      dueDate: ''
    })
    setAssignmentFormErrors({
      title: false,
      dueDate: false
    })
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
    // 과제 등록 모달로 돌아갈 때 폼 데이터 초기화
    setAssignmentFormData({
      title: '',
      dueDate: ''
    })
    setAssignmentFormErrors({
      title: false,
      dueDate: false
    })
  }

  const handleAssignmentFinalRegistration = () => {
    // 선택된 학생들을 기반으로 새로운 과제 데이터 생성
    const selectedStudentData = studentResults.filter((_, index) => selectedStudents[index])
    
    const newAssignment = {
      id: assignments.length + 1,
      title: assignmentFormData.title,
      dueDate: assignmentFormData.dueDate.replace('T', ' '), // T를 공백으로 변경
      students: selectedStudentData.map(student => ({
        name: student.name,
        school: classInfo.school, // 클래스의 학교 정보로 고정
        grade: classInfo.grade,   // 클래스의 학년 정보로 고정
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

  // 과제 데이터 (클래스의 학교와 학년에 맞는 학생들만 포함)
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: '수학 1단원',
      dueDate: '2025-09-02 15:00',
      students: [
        {
          name: '김중1',
          school: '중학교',
          grade: '1학년',
          status: '완료',
          score: '88점',
          timeTaken: '35분',
          completionDate: '2025.09.02 15:00:00'
        },
        {
          name: '이중1',
          school: '중학교',
          grade: '1학년',
          status: '미완료',
          score: '-',
          timeTaken: '-',
          completionDate: '-'
        }
      ]
    },
    {
      id: 2,
      title: '영어 문법, 독해',
      dueDate: '2025-09-05 18:00',
      students: [
        {
          name: '김중1',
          school: '중학교',
          grade: '1학년',
          status: '완료',
          score: '85점',
          timeTaken: '20분',
          completionDate: '2025.09.03 10:15:00'
        },
        {
          name: '이중1',
          school: '중학교',
          grade: '1학년',
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
      dueDate: '2025-09-01 12:00',
      students: [
        {
          name: '김중1',
          school: '중학교',
          grade: '1학년',
          status: '완료',
          score: '90점',
          timeTaken: '60분',
          completionDate: '2025.08.31 16:45:00'
        },
        {
          name: '이중1',
          school: '중학교',
          grade: '1학년',
          status: '완료',
          score: '88점',
          timeTaken: '50분',
          completionDate: '2025.08.31 15:20:00'
        }
      ]
    }
  ])

  // 전체 학생 데이터 (학교와 학년별로 세분화)
  const allStudents = [
    // 중학교 1학년
    {
      name: '김중1',
      school: '중학교',
      grade: '1학년',
      status: '완료',
      score: '88점',
      timeTaken: '35분',
      completionDate: '2025.09.02 15:00:00',
      email: 'middle1_1@naver.com',
      studentPhone: '010-1111-1111',
      parentPhone: '010-2222-2222'
    },
    {
      name: '이중1',
      school: '중학교',
      grade: '1학년',
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: 'middle1_2@naver.com',
      studentPhone: '010-3333-3333',
      parentPhone: '010-4444-4444'
    },
    // 중학교 2학년
    {
      name: '박중2',
      school: '중학교',
      grade: '2학년',
      status: '완료',
      score: '95점',
      timeTaken: '30분',
      completionDate: '2025.09.01 14:30:00',
      email: 'middle2_1@naver.com',
      studentPhone: '010-5555-5555',
      parentPhone: '010-6666-6666'
    },
    {
      name: '최중2',
      school: '중학교',
      grade: '2학년',
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: 'middle2_2@naver.com',
      studentPhone: '010-7777-7777',
      parentPhone: '010-8888-8888'
    },
    // 중학교 3학년
    {
      name: '정중3',
      school: '중학교',
      grade: '3학년',
      status: '완료',
      score: '92점',
      timeTaken: '25분',
      completionDate: '2025.09.01 16:00:00',
      email: 'middle3_1@naver.com',
      studentPhone: '010-9999-9999',
      parentPhone: '010-0000-0000'
    },
    // 고등학교 1학년
    {
      name: '김고1',
      school: '고등학교',
      grade: '1학년',
      status: '완료',
      score: '85점',
      timeTaken: '40분',
      completionDate: '2025.09.02 15:00:00',
      email: 'high1_1@naver.com',
      studentPhone: '010-1234-5678',
      parentPhone: '010-2345-6789'
    },
    {
      name: '이고1',
      school: '고등학교',
      grade: '1학년',
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: 'high1_2@naver.com',
      studentPhone: '010-3456-7890',
      parentPhone: '010-4567-8901'
    },
    // 고등학교 2학년
    {
      name: '박고2',
      school: '고등학교',
      grade: '2학년',
      status: '완료',
      score: '90점',
      timeTaken: '35분',
      completionDate: '2025.09.01 14:30:00',
      email: 'high2_1@naver.com',
      studentPhone: '010-5678-9012',
      parentPhone: '010-6789-0123'
    },
    {
      name: '최고2',
      school: '고등학교',
      grade: '2학년',
      status: '미완료',
      score: '-',
      timeTaken: '-',
      completionDate: '-',
      email: 'high2_2@naver.com',
      studentPhone: '010-7890-1234',
      parentPhone: '010-8901-2345'
    },
    // 고등학교 3학년
    {
      name: '정고3',
      school: '고등학교',
      grade: '3학년',
      status: '완료',
      score: '95점',
      timeTaken: '30분',
      completionDate: '2025.09.01 16:30:00',
      email: 'high3_1@naver.com',
      studentPhone: '010-9012-3456',
      parentPhone: '010-0123-4567'
    }
  ]

  // 클래스의 학교와 학년에 맞는 학생들만 필터링
  const [studentResults, setStudentResults] = useState(
    allStudents.filter(student => 
      student.school === classInfo.school && student.grade === classInfo.grade
    )
  )

  // 전체 승인 대기 학생 데이터 (학교와 학년별로 세분화)
  const allApprovalStudents = [
    // 중학교 1학년 승인 대기
    {
      name: '이중1승인',
      school: '중학교',
      grade: '1학년',
      schoolName: '진건중학교',
      email: 'middle1_approval1@naver.com',
      studentPhone: '010-7777-7777',
      parentPhone: '010-8888-8888',
      status: '승인 대기'
    },
    {
      name: '김중1승인',
      school: '중학교',
      grade: '1학년',
      schoolName: '진건중학교',
      email: 'middle1_approval2@naver.com',
      studentPhone: '010-9999-9999',
      parentPhone: '010-0000-0000',
      status: '메일 전송'
    },
    // 중학교 2학년 승인 대기
    {
      name: '박중2승인',
      school: '중학교',
      grade: '2학년',
      schoolName: '진건중학교',
      email: 'middle2_approval1@naver.com',
      studentPhone: '010-1111-1111',
      parentPhone: '010-2222-2222',
      status: '승인 대기'
    },
    // 중학교 3학년 승인 대기
    {
      name: '최중3승인',
      school: '중학교',
      grade: '3학년',
      schoolName: '진건중학교',
      email: 'middle3_approval1@naver.com',
      studentPhone: '010-3333-3333',
      parentPhone: '010-4444-4444',
      status: '메일 전송'
    },
    // 고등학교 1학년 승인 대기
    {
      name: '이고1승인',
      school: '고등학교',
      grade: '1학년',
      schoolName: '진건고등학교',
      email: 'high1_approval1@naver.com',
      studentPhone: '010-5555-5555',
      parentPhone: '010-6666-6666',
      status: '승인 대기'
    },
    {
      name: '김고1승인',
      school: '고등학교',
      grade: '1학년',
      schoolName: '진건고등학교',
      email: 'high1_approval2@naver.com',
      studentPhone: '010-7777-7777',
      parentPhone: '010-8888-8888',
      status: '메일 전송'
    },
    // 고등학교 2학년 승인 대기
    {
      name: '박고2승인',
      school: '고등학교',
      grade: '2학년',
      schoolName: '진건고등학교',
      email: 'high2_approval1@naver.com',
      studentPhone: '010-9999-9999',
      parentPhone: '010-0000-0000',
      status: '승인 대기'
    },
    // 고등학교 3학년 승인 대기
    {
      name: '정고3승인',
      school: '고등학교',
      grade: '3학년',
      schoolName: '진건고등학교',
      email: 'high3_approval1@naver.com',
      studentPhone: '010-1111-2222',
      parentPhone: '010-3333-4444',
      status: '메일 전송'
    }
  ]

  // 클래스의 학교와 학년에 맞는 승인 대기 학생들만 필터링
  const [approvalStudents, setApprovalStudents] = useState(
    allApprovalStudents.filter(student => 
      student.school === classInfo.school && student.grade === classInfo.grade
    )
  )
>>>>>>> 3d77f5b148f43fa3155f98e33524a53f0d47158d

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/class/create')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
<<<<<<< HEAD
              <h1 className="text-xl font-semibold text-gray-900">
                클래스 상세 정보 (ID: {classId})
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
=======
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
                              {assignment.dueDate.replace('T', ' ')} 까지
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
                                    <button 
                                      className="text-xs hover:opacity-80 transition-opacity"
                                      style={{ 
                                        backgroundColor: '#E6F3FF',
                                        border: 'none',
                                        color: '#0085FF',
                                        padding: '4px 8px',
                                        minWidth: '70px',
                                        textAlign: 'center',
                                        display: 'inline-block',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
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
                          {student.status === '메일 전송' ? (
                            <button 
                              onClick={() => handleResendModalOpen(index)}
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
                                  backgroundColor: '#F0F9F0',
                                  border: 'none',
                                  color: '#4CAF50',
                                  padding: '4px 8px',
                                  minWidth: '70px',
                                  textAlign: 'center',
                                  display: 'inline-block'
                                }}
                              >
                                메일 전송
                              </Badge>
                            </button>
                          ) : (
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
                          )}
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
                  <input
                    type="text"
                    value={classInfo.school}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               bg-gray-50 text-gray-700"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {classInfo.school === '중학교' ? `중학교 ${classInfo.grade} 학생만 등록 가능합니다.` : `고등학교 ${classInfo.grade} 학생만 등록 가능합니다.`}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <input
                    type="text"
                    value={classInfo.grade}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </div>
>>>>>>> 3d77f5b148f43fa3155f98e33524a53f0d47158d
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* 탭 내용 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assignment' && <AssignmentTab classId={classId} />}
        {activeTab === 'student' && <StudentManagementTab classId={classId} />}
        {activeTab === 'approval' && <ApprovalTab classId={classId} />}
      </div>
=======
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
                  <input
                    type="text"
                    value={classInfo.school}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                               bg-gray-50 text-gray-700"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {classInfo.school === '중학교' ? `중학교 ${classInfo.grade} 학생만 수정 가능합니다.` : `고등학교 ${classInfo.grade} 학생만 수정 가능합니다.`}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학년
                  </label>
                  <input
                    type="text"
                    value={classInfo.grade}
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
                  placeholder="과제명을 입력해주세요. (30자 이내)"
                  value={assignmentFormData.title}
                  onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setAssignmentFormData({...assignmentFormData, title: e.target.value})
                      // 입력 시 에러 상태 해제
                      if (assignmentFormErrors.title) {
                        setAssignmentFormErrors(prev => ({ ...prev, title: false }))
                      }
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent ${
                               assignmentFormErrors.title 
                                 ? 'border-red-500' 
                                 : 'border-gray-300'
                             }`}
                />
                <div className={`text-xs mt-1 ${
                  assignmentFormErrors.title ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {assignmentFormErrors.title 
                    ? '과제명을 입력해주세요.' 
                    : ''
                  }
                </div>
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
                  onChange={(e) => {
                    setAssignmentFormData({...assignmentFormData, dueDate: e.target.value})
                    // 입력 시 에러 상태 해제
                    if (assignmentFormErrors.dueDate) {
                      setAssignmentFormErrors(prev => ({ ...prev, dueDate: false }))
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent ${
                               assignmentFormErrors.dueDate 
                                 ? 'border-red-500' 
                                 : 'border-gray-300'
                             }`}
                  style={{ 
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  예: 2025-10-01 21:40
                </div>
                {assignmentFormErrors.dueDate && (
                  <div className="text-xs text-red-500 mt-1">
                    마감일을 선택해주세요.
                  </div>
                )}
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
              문제지 선택
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
                        {/* 전체 선택 체크박스 제거 - 공간 유지 */}
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      학교 / 학년
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      제목
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      문제 유형
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      생성일
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
                          <input
                            type="radio"
                            name="assignment"
                            checked={selectedAssignments[index] || false}
                            onChange={() => {
                              // 다른 모든 선택 해제하고 현재 것만 선택
                              const newSelected = Array(3).fill(false)
                              newSelected[index] = true
                              setSelectedAssignments(newSelected)
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
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
                                border: 'none', 
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
                                border: 'none', 
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
                // 이전 버튼을 눌렀을 때는 폼 데이터 유지
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
              학생 선택
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
                    <TableHead className="text-center text-sm font-medium">
                      학교
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      학년
                    </TableHead>
                    <TableHead className="text-center text-sm font-medium">
                      이름
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {studentResults.filter(student => 
                    student.school === classInfo.school && student.grade === classInfo.grade
                  ).map((student, index) => (
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
                // 이전 버튼을 눌렀을 때는 폼 데이터 유지
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

      {/* 메일 재전송 확인 모달창 */}
      <Dialog open={isResendModalOpen} onOpenChange={setIsResendModalOpen}>
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
              메일 재전송
            </DialogTitle>
            <button 
              onClick={handleResendModalClose}
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
                {resendingStudentIndex !== null && approvalStudents[resendingStudentIndex]?.name}님에게
              </div>
              <div className="text-sm text-gray-600 mb-3">
                클래스 참여 안내 메일을 재전송하시겠습니까?
              </div>
              <div className="text-sm text-gray-600">
                재전송을 원하시면 <span className="text-blue-600 font-medium">[재전송]</span> 버튼을 눌러주세요.
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #e1e1e1', margin: '10px 0px' }}></div>

          <DialogFooter className="flex gap-4">
            <button 
              onClick={handleResendModalClose}
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
              onClick={handleEmailResend}
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
              재전송
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
>>>>>>> 3d77f5b148f43fa3155f98e33524a53f0d47158d
    </div>
  );
}