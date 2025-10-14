import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service'; // tu servicio de correo
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService, // MailerService personalizado
  ) {}

  // ======================
  // Validar usuario
  // ======================
  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Comparación plaintext (solo para pruebas, no recomendable en producción)
    if (user.password !== password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Retornar usuario sin contraseña
    const { password: _, ...result } = user;
    return result;
  }

  // ======================
  // Login
  // ======================
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // ======================
  // Enviar correo de recuperación
  // ======================
  async sendResetPasswordEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600_000; // 1 hora
    await this.usersService.update(user.id, user);

    // Link para el frontend (token oculto en el enlace)
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://tu-app.com'
        : 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    try {
      // Enviamos solo un mensaje genérico con el link clickeable
      await this.mailerService.sendMail(email, resetLink);
    } catch (err) {
      console.error('Error enviando correo de recuperación:', err?.message || err);
      throw new BadRequestException(
        'Error enviando correo. Revisa la configuración SMTP o utiliza Mailtrap para pruebas.',
      );
    }

    // Log de prueba con token (solo en backend)
    console.log(`🔗 Link de prueba (localhost): ${resetLink}`);

    return { message: 'Correo de recuperación enviado' };
  }

  // ======================
  // Restablecer contraseña
  // ======================
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Guardar contraseña como plaintext (solo para pruebas)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.usersService.update(user.id, user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
