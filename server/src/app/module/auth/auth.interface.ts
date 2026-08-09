export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IRegisterStudentPayload {
  name: string;
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IGoogleSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IGoogleSession {
  user: IGoogleSessionUser;
}
