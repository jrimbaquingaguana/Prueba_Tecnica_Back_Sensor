import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    NestMailerModule.forRoot({
      transport: {
        host: 'sandbox.smtp.mailtrap.io', // como dice Mailtrap
        port: 2525, 
        secure: false,                       // el puerto de Mailtrap
        auth: {
          user: '8036b8d5e0e438',        // tu usuario Mailtrap
          pass: '0595a9822793f7',        // tu contraseña Mailtrap
        },
      },
      defaults: {
        from: '"Soporte App" <ricardoimbaquinga@gmail.com>', // el correo que verá el usuario
      },
    }),
  ],
  providers: [MailerService],
  exports: [NestMailerModule, MailerService],
})
export class MailerModule {}
