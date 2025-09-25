export type UserType = 'teacher' | 'student';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginFieldErrors {
  [key: string]: string;
}

export interface LoginTouchedFields {
  [key: string]: boolean;
}
