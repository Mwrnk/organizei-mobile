export interface User {
  id: string; // Equivalente ao _id da API
  coduser: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  role: string;
  plan: any | null;
  orgPoints: number;
  profileImage: string | null;
  loginAttempts?: number;
  lastLoginAttempt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
