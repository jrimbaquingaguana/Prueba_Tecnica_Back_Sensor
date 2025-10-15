import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // para generar IDs únicas
// import * as usersData from '../mailer/users.json';

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
  // preferir archivo relativo al código compilado, pero soportar otras rutas
  private filePath: string;
  private users: User[] = [];

  // Usuarios por defecto (se usarán para crear el JSON si no existe)
  private readonly DEFAULT_USERS: User[] = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: 'Jose Imbaquinga',
      role: 'admin',
      email: 'ricardoimbaquinga@gmail.com',
      photo: 'https://i.pravatar.cc/150?img=12',
      resetToken: null,
      resetTokenExpiry: null,
    },
    {
      id: '2',
      username: 'jose1',
      password: 'jose123',
      name: 'María Técnica',
      role: 'technician',
      email: 'maria.tecnica@example.com',
      photo: 'https://i.pravatar.cc/150?img=5',
      resetToken: null,
      resetTokenExpiry: null,
    },
  ];

  constructor() {
    this.initFilePath();
    this.loadUsers();
  }

  private initFilePath() {
    const candidates = [
      path.resolve(__dirname, '../mailer/users.json'), // usual relative to compiled code
      path.resolve(process.cwd(), 'src/mailer/users.json'), // when running from project root
      path.resolve(process.cwd(), 'mailer/users.json'),
    ];

    const found = candidates.find(p => fs.existsSync(p));
    if (found) {
      this.filePath = found;
      return;
    }

    // si no existe, elegimos la primera ruta candidate para crear el archivo
    this.filePath = candidates[0];
  }

  private loadUsers() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.users = JSON.parse(data);
        console.log('Usuarios cargados desde', this.filePath);
        return;
      } catch (err) {
        console.error('Error leyendo/parsing users.json:', err?.message || err);
      }
    }

    // Si no existe o falló el parseo, creamos el archivo con usuarios por defecto
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.DEFAULT_USERS, null, 2));
      this.users = JSON.parse(JSON.stringify(this.DEFAULT_USERS));
      console.log('users.json no encontrado: creado archivo por defecto en', this.filePath);
    } catch (err) {
      console.error('No se pudo crear users.json:', err?.message || err);
      this.users = [];
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

  async findAll() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  async getOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password, ...rest } = user;
    return rest;
  }

  async create(data: Partial<User>) {
    // validar duplicados
    if (!data.username || !data.password || !data.email || !data.name) {
      throw new NotFoundException('Faltan campos requeridos');
    }

    const existsUsername = this.users.find(u => u.username === data.username);
    if (existsUsername) throw new NotFoundException('Username ya existe');

    const existsEmail = this.users.find(u => u.email === data.email);
    if (existsEmail) throw new NotFoundException('Email ya existe');

    // Encontrar el máximo ID actual y sumar 1
    const maxId = this.users.reduce((max, user) => {
      const currentId = parseInt(user.id);
      return currentId > max ? currentId : max;
    }, 0);
    
    const newUser: User = {
      id: (maxId + 1).toString(), // ID secuencial
      username: data.username!,
      password: data.password!,
      name: data.name!,
      email: data.email!,
      role: (data.role as UserRole) || 'viewer',
      photo: data.photo || '',
      resetToken: null,
      resetTokenExpiry: null,
    };
    this.users.push(newUser);
    this.saveUsers();
    const { password, ...rest } = newUser;
    return rest;
  }


  async update(id: string, data: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new NotFoundException('Usuario no encontrado');

    this.users[index] = { ...this.users[index], ...data };
    this.saveUsers();
    const { password, ...rest } = this.users[index];
    return rest;
  }

  async remove(id: string) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new NotFoundException('Usuario no encontrado');

    const removedUser = this.users.splice(index, 1)[0];
    this.saveUsers();
    const { password, ...rest } = removedUser;
    return rest;
  }

  // Método requerido por SensorsGateway
  getAllUsers(): User[] {
    return this.users;
  }
}
