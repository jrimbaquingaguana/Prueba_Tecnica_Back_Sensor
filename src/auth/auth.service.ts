import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password === pass) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const payload = { username: (user as any).username, sub: (user as any).id, role: (user as any).role , email: (user as any).email};
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // Recuperar contraseña
  async sendResetPasswordEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hora
    await this.usersService.update(user.id, user);

    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://tu-app.com' : 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail(email, resetLink);
    } catch (err) {
      console.error('Error enviando correo de recuperación:', err?.message || err);
      throw new BadRequestException('Error enviando correo. Revisa la configuración SMTP.');
    }

    console.log(`Link de prueba (localhost): ${resetLink}`);

    return { message: 'Correo de recuperación enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now())
      throw new BadRequestException('Token inválido o expirado');

    // Guardar como plaintext (según petición)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.usersService.update(user.id, user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
