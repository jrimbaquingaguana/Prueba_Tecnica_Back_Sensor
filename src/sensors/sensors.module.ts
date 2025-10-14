// src/sensors/sensors.module.ts
import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsGateway } from './sensors.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module'; // <-- Importar UsersModule

@Module({
  imports: [
    JwtModule.register({
      secret: 'SOME_SUPER_SECRET_FOR_DEMO',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule, // <-- Importar módulo que contiene UsersService
  ],
  providers: [SensorsService, SensorsGateway],
})
export class SensorsModule {}
