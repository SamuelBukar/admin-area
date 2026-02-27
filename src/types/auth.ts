// Roles supported by the backend (see Postman collection/users payloads)
export type UserRole = 'admin' | 'user' | 'editor' | 'viewer' | 'land_administrator';

export interface Permission {
  pages: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    publish: boolean;
  };
  users: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  templates: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
  applications: {
    view: boolean;
    submit: boolean;
    edit: boolean;
  };
  reports: {
    view: boolean;
    generate: boolean;
  };
  payments: {
    view: boolean;
    manage: boolean;
  };
  allocations: {
    view: boolean;
    manage: boolean;
  };
}

// Auth API Request/Response Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'active' | 'inactive';
    permissions?: Permission;
    twoFactorEnabled?: boolean;
  };
}

export interface TwoFactorSendRequest {
  email: string;
}

export interface TwoFactorRequestLoginCodeRequest {
  email: string;
}

export interface TwoFactorVerifyRequest {
  email: string;
  code: string;
}

export interface TwoFactorVerifyLoginRequest {
  email: string;
  code: string;
}

export interface TwoFactorVerifyLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface TwoFactorDisableRequest {
  code: string;
}

