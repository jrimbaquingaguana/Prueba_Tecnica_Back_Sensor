import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as usersData from '../mailer/users.json';
export type UserRole = 'admin' | 'technician' | 'viewer';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email: string;
  photo?: string;
  resetToken?: string | null;
  resetTokenExpiry?: number | null;
}

@Injectable()
export class UsersService {
  // 📌 Ajusta la ruta al JSON dentro de la carpeta mailer
  private filePath = path.resolve(__dirname, '../mailer/users.json');
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.users = JSON.parse(data);
      console.log('Usuarios cargados:', this.users);
    } else {
      this.users = [];
      console.warn('No se encontró users.json');
    }
  }

  private saveUsers() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.users, null, 2));
  }

  async findByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }

  async findByEmail(email: string) {
    return this.users.find(u => u.email === email);
  }

  async findByResetToken(token: string) {
    return this.users.find(u => u.resetToken === token);
  }

  async update(id: string, data: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...data };
    this.saveUsers();
    return this.users[index];
  }

  async findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  getAllUsers(): User[] {
    return this.users;
  }
}
