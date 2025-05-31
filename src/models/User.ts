export interface User {
  id: string; // Equivalente ao _id da API para compatibilidade
  _id: string; // ID original do MongoDB
  coduser: string;
  name: string;
  email: string;
  dateOfBirth?: string | Date | null; // Pode ser string ISO ou Date
  role: string;
  plan: string | null;
  orgPoints: number;
  profileImage: string | null;
  loginAttempts: number;
  lastLoginAttempt: string | Date | null; // Pode ser string ISO ou Date
  createdAt: string | Date; // Pode ser string ISO ou Date
  updatedAt: string | Date; // Pode ser string ISO ou Date
  __v?: number; // Campo opcional do MongoDB
}
