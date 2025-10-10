import { authApiRequest } from '@/lib/api';

// 인증 관련 타입 정의
export interface TeacherSignupData {
  username: string;
  email: string;
  name: string;
  phone: string;
  password: string;
}

export interface StudentSignupData {
  username: string;
  email: string;
  name: string;
  phone: string;
  parent_phone: string;
  school_level: 'middle' | 'high';
  grade: number;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface TeacherProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  parent_phone: string;
  school_level: 'middle' | 'high';
  grade: number;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  userType: 'teacher' | 'student';
  teacherProfile?: TeacherProfile & { classrooms?: Classroom[] };
  studentProfile?: StudentProfile & { classrooms?: ClassroomWithTeacher[] };
}

export interface ClassroomCreateData {
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
}

export interface Classroom {
  id: number;
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
  class_code: string;
  teacher_id: number;
  is_active: boolean;
  created_at: string;
}

export interface ClassroomUpdate {
  name?: string;
  school_level?: 'middle' | 'high';
  grade?: number;
}

export interface ClassroomWithTeacher {
  id: number;
  name: string;
  school_level: 'middle' | 'high';
  grade: number;
  class_code: string;
  is_active: boolean;
  created_at: string;
  teacher: TeacherProfile;
}

export interface JoinRequestData {
  class_code: string;
}

export interface StudentJoinRequest {
  id: number;
  student_id: number;
  classroom_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'invited';
  requested_at: string;
  processed_at?: string;
  student: StudentProfile;
  classroom: Classroom;
}

export interface DirectRegisterData {
  name: string;
  email: string;
  phone: string;
  parent_phone: string;
}

// 토큰 관리 유틸리티
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_profile');
  },

  getUserType: (): 'teacher' | 'student' | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_type') as 'teacher' | 'student' | null;
  },

  setUserType: (userType: 'teacher' | 'student'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_type', userType);
  },

  getUserProfile: (): TeacherProfile | StudentProfile | null => {
    if (typeof window === 'undefined') return null;
    const profile = localStorage.getItem('user_profile');
    return profile ? JSON.parse(profile) : null;
  },

  setUserProfile: (profile: TeacherProfile | StudentProfile): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_profile', JSON.stringify(profile));
  },
};

// 인증된 요청을 위한 헤더 추가
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 인증 API 서비스
export const authService = {
  // Teacher 회원가입
  async teacherSignup(data: TeacherSignupData): Promise<TeacherProfile> {
    return authApiRequest<TeacherProfile>('/api/auth/teacher/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Student 회원가입
  async studentSignup(data: StudentSignupData): Promise<StudentProfile> {
    return authApiRequest<StudentProfile>('/api/auth/student/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Teacher 로그인
  async teacherLogin(data: LoginData): Promise<AuthToken> {
    const response = await authApiRequest<AuthToken>('/api/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 토큰과 사용자 타입 저장
    tokenStorage.setToken(response.access_token);
    tokenStorage.setUserType('teacher');

    return response;
  },

  // Student 로그인
  async studentLogin(data: LoginData): Promise<AuthToken> {
    const response = await authApiRequest<AuthToken>('/api/auth/student/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // 토큰과 사용자 타입 저장
    tokenStorage.setToken(response.access_token);
    tokenStorage.setUserType('student');

    return response;
  },

  // Teacher 프로필 조회
  async getTeacherProfile(): Promise<TeacherProfile> {
    const profile = await authApiRequest<TeacherProfile>('/api/auth/teacher/me', {
      headers: getAuthHeaders(),
    });

    tokenStorage.setUserProfile(profile);
    return profile;
  },

  // Student 프로필 조회
  async getStudentProfile(): Promise<StudentProfile> {
    const profile = await authApiRequest<StudentProfile>('/api/auth/student/me', {
      headers: getAuthHeaders(),
    });

    tokenStorage.setUserProfile(profile);
    return profile;
  },

  // 로그아웃
  logout(): void {
    tokenStorage.removeToken();
  },

  // 현재 로그인 상태 확인
  isAuthenticated(): boolean {
    return !!tokenStorage.getToken();
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser(): {
    type: 'teacher' | 'student' | null;
    profile: TeacherProfile | StudentProfile | null;
  } {
    return {
      type: tokenStorage.getUserType(),
      profile: tokenStorage.getUserProfile(),
    };
  },

  // 사용자 프로필 통합 조회
  async getUserProfile(): Promise<UserProfile> {
    const userType = tokenStorage.getUserType();
    if (!userType) {
      throw new Error('User not authenticated');
    }

    if (userType === 'teacher') {
      const teacherProfile = await this.getTeacherProfile();
      const classrooms = await classroomService.getMyClassrooms();
      return {
        userType: 'teacher',
        teacherProfile: { ...teacherProfile, classrooms }
      };
    } else {
      const studentProfile = await this.getStudentProfile();
      const classrooms = await studentClassService.getMyClassesWithTeachers(studentProfile.id);
      return {
        userType: 'student',
        studentProfile: { ...studentProfile, classrooms }
      };
    }
  },

  // 아이디 중복 체크
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; message?: string }> {
    return authApiRequest<{ available: boolean; message?: string }>('/api/auth/check-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  },

  // 이메일 중복 체크
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message?: string }> {
    return authApiRequest<{ available: boolean; message?: string }>('/api/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// 클래스룸 관리 API 서비스 (Teacher용)
export const classroomService = {
  // 클래스룸 생성
  async createClassroom(data: ClassroomCreateData): Promise<Classroom> {
    return authApiRequest<Classroom>('/api/classrooms/create', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // 내 클래스룸 목록 조회
  async getMyClassrooms(): Promise<Classroom[]> {
    return authApiRequest<Classroom[]>('/api/classrooms/my-classrooms', {
      headers: getAuthHeaders(),
    });
  },

  // 대기 중인 가입 요청 조회
  async getPendingJoinRequests(): Promise<StudentJoinRequest[]> {
    return authApiRequest<StudentJoinRequest[]>('/api/classrooms/join-requests/pending', {
      headers: getAuthHeaders(),
    });
  },

  // 가입 요청 승인/거절
  async approveJoinRequest(
    requestId: number,
    status: 'approved' | 'rejected',
  ): Promise<StudentJoinRequest> {
    return authApiRequest<StudentJoinRequest>(
      `/api/classrooms/join-requests/${requestId}/approve`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      },
    );
  },

  // 학생 직접 등록
  async registerStudentDirectly(
    classroomId: number,
    data: DirectRegisterData,
  ): Promise<StudentProfile> {
    return authApiRequest<StudentProfile>(`/api/classrooms/${classroomId}/students/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // 클래스룸 학생 목록 조회
  async getClassroomStudents(classroomId: number): Promise<StudentProfile[]> {
    return authApiRequest<StudentProfile[]>(`/api/classrooms/${classroomId}/students`, {
      headers: getAuthHeaders(),
    });
  },

  // 특정 클래스룸 정보 조회
  async getClassroom(classroomId: number): Promise<Classroom> {
    return authApiRequest<Classroom>(`/api/classrooms/${classroomId}`, {
      headers: getAuthHeaders(),
    });
  },

  // 클래스룸 정보 수정
  async updateClassroom(classroomId: number, data: ClassroomUpdate): Promise<Classroom> {
    return authApiRequest<Classroom>(`/api/classrooms/${classroomId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // 클래스룸 삭제
  async deleteClassroom(classroomId: number): Promise<{ message: string }> {
    return authApiRequest<{ message: string }>(`/api/classrooms/${classroomId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // 클래스룸에서 학생 삭제
  async removeStudentFromClassroom(classroomId: number, studentId: number): Promise<void> {
    await authApiRequest<void>(`/api/classrooms/${classroomId}/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

// 학생 클래스 가입 API 서비스 (Student용)
export const studentClassService = {
  // 클래스 가입 요청
  async requestJoinClass(data: JoinRequestData): Promise<StudentJoinRequest> {
    return authApiRequest<StudentJoinRequest>('/api/classrooms/join-request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // 내가 속한 클래스 목록 조회
  async getMyClasses(): Promise<Classroom[]> {
    return authApiRequest<Classroom[]>('/api/classrooms/my-classrooms/student', {
      headers: getAuthHeaders(),
    });
  },

  // 내가 속한 클래스 목록과 교사 정보 조회
  async getMyClassesWithTeachers(studentId: number): Promise<ClassroomWithTeacher[]> {
    return authApiRequest<ClassroomWithTeacher[]>(`/api/classrooms/student/${studentId}/classrooms-with-teachers`, {
      headers: getAuthHeaders(),
    });
  },
};
