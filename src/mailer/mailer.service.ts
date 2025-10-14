import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    // SMTP Gmail (producción) o Mailtrap (pruebas)
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io', // cambiar a smtp.gmail.com en producción
      port: 2525,
      secure: false,
      auth: {
        user: '8036b8d5e0e438', // Mailtrap
        pass: '0595a9822793f7',
      },
    });
  }

  async sendMail(to: string, resetLink: string) {
    // En el correo solo mostramos un mensaje genérico
    const htmlMessage = `
      <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
      <a href="${resetLink}">Restablecer contraseña</a>
      <p>Si no solicitó este cambio, puede ignorar este correo.</p>
    `;

    const info = await this.transporter.sendMail({
      from: '"Soporte App" <ricardoimbaquinga@gmail.com>',
      to,
      subject: 'Recuperación de contraseña',
      html: htmlMessage,
    });

    console.log(`📧 Correo enviado a ${to} desde "Soporte App" <ricardoimbaquinga@gmail.com>`);
  }
}
