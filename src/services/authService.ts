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

export interface JoinRequestData {
  class_code: string;
}

export interface StudentJoinRequest {
  id: number;
  student_id: number;
  classroom_id: number;
  status: 'pending' | 'approved' | 'rejected';
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
  }
};

// 인증된 요청을 위한 헤더 추가
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  getCurrentUser(): { type: 'teacher' | 'student' | null; profile: TeacherProfile | StudentProfile | null } {
    return {
      type: tokenStorage.getUserType(),
      profile: tokenStorage.getUserProfile(),
    };
  }
};

// 클래스룸 관리 API 서비스 (Teacher용)
export const classroomService = {
  // 클래스룸 생성
  async createClassroom(data: ClassroomCreateData): Promise<Classroom> {
    const headers = getAuthHeaders();
    console.log('🔍 Creating classroom with data:', data);
    console.log('🔍 Using headers:', headers);
    console.log('🔍 Token from storage:', tokenStorage.getToken());
    
    return authApiRequest<Classroom>('/api/classrooms/create', {
      method: 'POST',
      headers,
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
  async approveJoinRequest(requestId: number, status: 'approved' | 'rejected'): Promise<StudentJoinRequest> {
    return authApiRequest<StudentJoinRequest>(`/api/classrooms/join-requests/${requestId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  // 학생 직접 등록
  async registerStudentDirectly(classroomId: number, data: DirectRegisterData): Promise<StudentProfile> {
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
  }
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
  }
};