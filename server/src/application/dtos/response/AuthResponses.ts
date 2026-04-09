import { User, UserRole } from '../../../domain/entities';

export interface UserResponse {
  id: number;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user?: UserResponse;
  emailPreviewUrl?: string;
  userId?: number;
  requiresVerification?: boolean;
}

export interface UserListResponse {
  users: UserResponse[];
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toUserResponseList(users: User[]): UserResponse[] {
  return users.map(toUserResponse);
}
