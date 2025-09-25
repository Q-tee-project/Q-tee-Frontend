export type Step = 1 | 2 | 3 | 4;

export type UserType = 'teacher' | 'student';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  parent_phone: string;
  school_level: 'middle' | 'high';
  grade: number;
}

export interface FieldErrors {
  [key: string]: string;
}

export interface TouchedFields {
  [key: string]: boolean;
}
