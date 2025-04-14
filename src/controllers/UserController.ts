import { User } from '../models/User';

export class UserController {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      role: userData.role || 'user', // Garantir que role seja definido
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }
}
