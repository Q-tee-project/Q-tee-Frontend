import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { classroomService } from '@/services/authService';
import { mathService } from '@/services/mathService';
import { koreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';
import { getMarketStats, MarketStats, getMyProducts, MarketProduct } from '@/services/marketApi';

// 타입 정의
export interface ClassData {
  id: string;
  name: string;
  createdAt: string;
}

export interface StudentData {
  id: number;
  name: string;
  grade: number;
  attendance: number;
}

export interface AssignmentData {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
  averageScore: number;
  studentScores?: Record<number, number>;
  assignedStudents?: number[];
}

export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  activeAssignments: number;
  totalProblems: number;
}

export interface DashboardState {
  // UI 상태
  selectedTab: string;
  selectedClass: string;
  selectedStudents: number[];
  selectedAssignments: string[];
  studentColorMap: Record<number, string>;
  isAssignmentModalOpen: boolean;
  isRefreshing: boolean;
  
  // 데이터 상태
  classes: ClassData[];
  students: Record<string, StudentData[]>;
  assignments: AssignmentData[];
  stats: DashboardStats;
  marketStats: MarketStats | null;
  marketProducts: MarketProduct[];
  selectedProducts: number[];
  
  // 로딩 상태
  isLoadingClasses: boolean;
  isLoadingStudents: boolean;
  isLoadingAssignments: boolean;
  isLoadingStats: boolean;
  isLoadingMarketStats: boolean;
  isLoadingProducts: boolean;
  
  // 에러 상태
  apiErrors: Set<string>;
  errorMessages: Record<string, string>;
  
  // 동기화 시간 (ISO 문자열로 저장)
  lastSyncTime: string | null;
  lastClassSyncTime: string | null;
}

// 초기 상태
const initialState: DashboardState = {
  selectedTab: '클래스 관리',
  selectedClass: '',
  selectedStudents: [],
  selectedAssignments: [],
  studentColorMap: {},
  isAssignmentModalOpen: false,
  isRefreshing: false,
  
  classes: [],
  students: {},
  assignments: [],
  stats: {
    totalClasses: 0,
    totalStudents: 0,
    activeAssignments: 0,
    totalProblems: 0,
  },
  marketStats: null,
  marketProducts: [],
  selectedProducts: [],
  
  isLoadingClasses: true,
  isLoadingStudents: true,
  isLoadingAssignments: true,
  isLoadingStats: true,
  isLoadingMarketStats: true,
  isLoadingProducts: true,
  
  apiErrors: new Set(),
  errorMessages: {},
  
  lastSyncTime: null,
  lastClassSyncTime: null,
};

// 에러 메시지를 사용자 친화적으로 변환하는 함수
const getErrorMessage = (error: any, context: string): string => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
  }

  if (error.status) {
    switch (error.status) {
      case 401:
        return '로그인이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return `${context}을(를) 찾을 수 없습니다.`;
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 503:
        return '서비스가 일시적으로 사용할 수 없습니다.';
      default:
        return `${context} 처리 중 오류가 발생했습니다.`;
    }
  }

  if (error.message && error.message.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  return error.message || `${context} 처리 중 오류가 발생했습니다.`;
};

// API 재시도 함수
const retryApiCall = async <T,>(
  apiCall: () => Promise<T>,
  context: string = 'API',
  maxRetries: number = 2,
  delay: number = 1000,
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw error;
      }

      if (i < maxRetries - 1) {
        console.log(`${context} 재시도 중... (${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  const userFriendlyError = new Error(getErrorMessage(lastError, context));
  (userFriendlyError as any).originalError = lastError;
  throw userFriendlyError;
};

// Async Thunks
export const loadClasses = createAsyncThunk(
  'dashboard/loadClasses',
  async (_, { rejectWithValue }) => {
    try {
      const classrooms = await retryApiCall(
        () => classroomService.getMyClassrooms(),
        '클래스 정보',
        3,
        1000,
      );

      const classData: ClassData[] = classrooms.map((classroom) => ({
        id: classroom.id.toString(),
        name: classroom.name,
        createdAt: classroom.created_at,
      }));

      console.log('클래스 데이터 로딩 성공:', classData.length, '개 클래스');
      return classData;
    } catch (error) {
      console.error('클래스 데이터 로딩 실패:', error);
      return rejectWithValue(getErrorMessage(error, '클래스 정보'));
    }
  }
);

export const loadStudents = createAsyncThunk(
  'dashboard/loadStudents',
  async (classId: string | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dashboard: DashboardState };
      const studentsData: Record<string, StudentData[]> = {};
      const classesToProcess = classId 
        ? state.dashboard.classes.filter(cls => cls.id === classId)
        : state.dashboard.classes;

      const classPromises = classesToProcess.map(async (classroom) => {
        try {
          const students = await retryApiCall(
            () => classroomService.getClassroomStudents(parseInt(classroom.id)),
            `클래스 ${classroom.name} 학생 정보`,
            2,
            500,
          );

          const classStudents: StudentData[] = students.map((student) => ({
            id: student.id,
            name: student.name,
            grade: student.grade,
            attendance: Math.floor(Math.random() * 20) + 80,
          }));

          return { classId: classroom.id, students: classStudents };
        } catch (error) {
          console.error(`클래스 ${classroom.name} 학생 데이터 로딩 실패:`, error);
          return { classId: classroom.id, students: [] };
        }
      });

      const results = await Promise.all(classPromises);
      results.forEach(({ classId, students }) => {
        studentsData[classId] = students;
      });

      return studentsData;
    } catch (error) {
      console.error('학생 데이터 로딩 실패:', error);
      return rejectWithValue(getErrorMessage(error, '학생 정보'));
    }
  }
);

export const loadAssignments = createAsyncThunk(
  'dashboard/loadAssignments',
  async (classId: string | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { dashboard: DashboardState };
      const assignmentsData: AssignmentData[] = [];

      const classesToProcess = classId
        ? state.dashboard.classes.filter((cls) => cls.id === classId)
        : state.dashboard.classes;

      const classPromises = classesToProcess.map(async (classroom) => {
        try {
          const [koreanAssignments, englishAssignments, mathAssignments] =
            await Promise.allSettled([
              retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
              retryApiCall(() => EnglishService.getDeployedAssignments(classroom.id.toString())),
              retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString())),
            ]);

          const processAssignments = async (
            assignments: any[],
            subject: 'korean' | 'english' | 'math',
          ) => {
            if (!assignments || assignments.length === 0) return [];

            return Promise.all(
              assignments.map(async (assignment) => {
                return {
                  id: assignment.id.toString(),
                  title: assignment.title,
                  subject: subject === 'korean' ? '국어' : subject === 'english' ? '영어' : '수학',
                  dueDate: assignment.created_at
                    ? new Date(assignment.created_at).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                  submitted: 0,
                  total: 0,
                  averageScore: 0,
                  studentScores: {},
                  assignedStudents: [],
                };
              }),
            );
          };

          const [koreanData, englishData, mathData] = await Promise.all([
            koreanAssignments.status === 'fulfilled'
              ? processAssignments(koreanAssignments.value, 'korean')
              : [],
            englishAssignments.status === 'fulfilled'
              ? processAssignments(englishAssignments.value, 'english')
              : [],
            mathAssignments.status === 'fulfilled'
              ? processAssignments(mathAssignments.value, 'math')
              : [],
          ]);

          return [...koreanData, ...englishData, ...mathData];
        } catch (error) {
          return [];
        }
      });

      const results = await Promise.all(classPromises);
      const allAssignments = results.flat();

      return allAssignments;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '과제 정보'));
    }
  }
);

export const loadStats = createAsyncThunk(
  'dashboard/loadStats',
  async (_, { rejectWithValue }) => {
    try {
      let myClasses: any[] = [];
      try {
        myClasses = await classroomService.getMyClassrooms();
      } catch (error) {
        myClasses = [];
      }

      const totalClasses = myClasses.length;

      const [totalStudents, activeAssignments] = await Promise.all([
        (async () => {
          let students = 0;
          const studentPromises = myClasses.map(async (classroom) => {
            try {
              const classStudents = await classroomService.getClassroomStudents(classroom.id);
              return classStudents.length;
            } catch (error) {
              return 0;
            }
          });
          const studentCounts = await Promise.all(studentPromises);
          students = studentCounts.reduce((sum, count) => sum + count, 0);
          return students;
        })(),

        (async () => {
          let assignments = 0;
          const assignmentPromises = myClasses.map(async (classroom) => {
            try {
              const [koreanAssignments, englishAssignments, mathAssignments] =
                await Promise.allSettled([
                  retryApiCall(() => koreanService.getDeployedAssignments(classroom.id.toString())),
                  retryApiCall(() => EnglishService.getDeployedAssignments(classroom.id.toString())),
                  retryApiCall(() => mathService.getDeployedAssignments(classroom.id.toString())),
                ]);

              let classAssignments = 0;
              if (koreanAssignments.status === 'fulfilled')
                classAssignments += koreanAssignments.value?.length || 0;
              if (englishAssignments.status === 'fulfilled')
                classAssignments += englishAssignments.value?.length || 0;
              if (mathAssignments.status === 'fulfilled')
                classAssignments += mathAssignments.value?.length || 0;

              return classAssignments;
            } catch (error) {
              return 0;
            }
          });
          const assignmentCounts = await Promise.all(assignmentPromises);
          assignments = assignmentCounts.reduce((sum, count) => sum + count, 0);
          return assignments;
        })(),
      ]);

      const totalProblems = await (async () => {
        try {
          const [koreanWorksheets, englishWorksheets, mathWorksheets] = await Promise.allSettled([
            retryApiCall(() => koreanService.getKoreanWorksheets()),
            retryApiCall(() => EnglishService.getEnglishWorksheets()),
            retryApiCall(() => mathService.getMathWorksheets()),
          ]);

          let problems = 0;
          if (koreanWorksheets.status === 'fulfilled' && koreanWorksheets.value?.worksheets) {
            problems += koreanWorksheets.value.worksheets.length;
          }
          if (englishWorksheets.status === 'fulfilled' && Array.isArray(englishWorksheets.value)) {
            problems += englishWorksheets.value.length;
          }
          if (mathWorksheets.status === 'fulfilled' && mathWorksheets.value?.worksheets) {
            problems += mathWorksheets.value.worksheets.length;
          }

          return problems;
        } catch (error) {
          return 0;
        }
      })();

      return {
        totalClasses,
        totalStudents,
        activeAssignments,
        totalProblems,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, '통계 정보'));
    }
  }
);

export const loadMarketStats = createAsyncThunk(
  'dashboard/loadMarketStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getMarketStats();
      return stats;
    } catch (error: any) {
      console.log('[Dashboard] 마켓 통계 조회 실패, 기본값을 사용합니다.');
      const fallbackStats = {
        total_products: 0,
        total_sales: 0,
        average_rating: 0,
        total_revenue: 0,
      };
      return fallbackStats;
    }
  }
);

export const loadMarketProducts = createAsyncThunk(
  'dashboard/loadMarketProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await getMyProducts();
      return products;
    } catch (error: any) {
      console.log('[Dashboard] 마켓 상품 조회 실패, 빈 목록을 표시합니다.');
      return [];
    }
  }
);

export const refreshAll = createAsyncThunk(
  'dashboard/refreshAll',
  async (_, { dispatch, getState }) => {
    const state = getState() as { dashboard: DashboardState };
    
    await Promise.all([
      dispatch(loadMarketStats()),
      dispatch(loadMarketProducts()),
      dispatch(loadClasses()),
      dispatch(loadStats()),
      dispatch(loadStudents()),
      dispatch(loadAssignments(state.dashboard.selectedClass)),
    ]);
    
    return new Date().toISOString();
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
    },
    setSelectedClass: (state, action: PayloadAction<string>) => {
      state.selectedClass = action.payload;
      state.selectedStudents = [];
      state.studentColorMap = {};
    },
    setSelectedStudents: (state, action: PayloadAction<number[]>) => {
      state.selectedStudents = action.payload;
    },
    setSelectedAssignments: (state, action: PayloadAction<string[]>) => {
      state.selectedAssignments = action.payload;
    },
    setStudentColorMap: (state, action: PayloadAction<Record<number, string>>) => {
      state.studentColorMap = action.payload;
    },
    setAssignmentModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAssignmentModalOpen = action.payload;
    },
    setSelectedProducts: (state, action: PayloadAction<number[]>) => {
      state.selectedProducts = action.payload;
    },
    addApiError: (state, action: PayloadAction<string>) => {
      state.apiErrors.add(action.payload);
    },
    removeApiError: (state, action: PayloadAction<string>) => {
      state.apiErrors.delete(action.payload);
    },
    setErrorMessage: (state, action: PayloadAction<{ key: string; message: string }>) => {
      state.errorMessages[action.payload.key] = action.payload.message;
    },
    clearErrorMessage: (state, action: PayloadAction<string>) => {
      delete state.errorMessages[action.payload];
    },
    resetSelections: (state) => {
      state.selectedStudents = [];
      state.selectedAssignments = [];
      state.studentColorMap = {};
    },
  },
  extraReducers: (builder) => {
    // Load Classes
    builder
      .addCase(loadClasses.pending, (state) => {
        state.isLoadingClasses = true;
        state.apiErrors.delete('classes');
      })
      .addCase(loadClasses.fulfilled, (state, action) => {
        state.isLoadingClasses = false;
        state.classes = action.payload;
        state.lastClassSyncTime = new Date().toISOString();
      })
      .addCase(loadClasses.rejected, (state, action) => {
        state.isLoadingClasses = false;
        state.classes = [];
        state.apiErrors.add('classes');
        if (action.payload) {
          state.errorMessages.classes = action.payload as string;
        }
      });

    // Load Students
    builder
      .addCase(loadStudents.pending, (state) => {
        state.isLoadingStudents = true;
        state.apiErrors.delete('students');
      })
      .addCase(loadStudents.fulfilled, (state, action) => {
        state.isLoadingStudents = false;
        state.students = { ...state.students, ...action.payload };
      })
      .addCase(loadStudents.rejected, (state, action) => {
        state.isLoadingStudents = false;
        state.students = {};
        state.apiErrors.add('students');
        if (action.payload) {
          state.errorMessages.students = action.payload as string;
        }
      });

    // Load Assignments
    builder
      .addCase(loadAssignments.pending, (state) => {
        state.isLoadingAssignments = true;
      })
      .addCase(loadAssignments.fulfilled, (state, action) => {
        state.isLoadingAssignments = false;
        state.assignments = action.payload;
      })
      .addCase(loadAssignments.rejected, (state, action) => {
        state.isLoadingAssignments = false;
        state.assignments = [];
      });

    // Load Stats
    builder
      .addCase(loadStats.pending, (state) => {
        state.isLoadingStats = true;
      })
      .addCase(loadStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload;
      })
      .addCase(loadStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.stats = {
          totalClasses: 0,
          totalStudents: 0,
          activeAssignments: 0,
          totalProblems: 0,
        };
      });

    // Load Market Stats
    builder
      .addCase(loadMarketStats.pending, (state) => {
        state.isLoadingMarketStats = true;
      })
      .addCase(loadMarketStats.fulfilled, (state, action) => {
        state.isLoadingMarketStats = false;
        state.marketStats = action.payload;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(loadMarketStats.rejected, (state) => {
        state.isLoadingMarketStats = false;
        state.marketStats = {
          total_products: 0,
          total_sales: 0,
          average_rating: 0,
          total_revenue: 0,
        };
      });

    // Load Market Products
    builder
      .addCase(loadMarketProducts.pending, (state) => {
        state.isLoadingProducts = true;
      })
      .addCase(loadMarketProducts.fulfilled, (state, action) => {
        state.isLoadingProducts = false;
        state.marketProducts = action.payload;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(loadMarketProducts.rejected, (state) => {
        state.isLoadingProducts = false;
        state.marketProducts = [];
      });

    // Refresh All
    builder
      .addCase(refreshAll.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshAll.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.lastClassSyncTime = action.payload;
      })
      .addCase(refreshAll.rejected, (state) => {
        state.isRefreshing = false;
      });
  },
});

export const {
  setSelectedTab,
  setSelectedClass,
  setSelectedStudents,
  setSelectedAssignments,
  setStudentColorMap,
  setAssignmentModalOpen,
  setSelectedProducts,
  addApiError,
  removeApiError,
  setErrorMessage,
  clearErrorMessage,
  resetSelections,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
