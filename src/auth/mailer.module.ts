// mailer.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.GMAIL_USER}>`,
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailerConfigModule {}
