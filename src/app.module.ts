import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SensorsModule } from './sensors/sensors.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, SensorsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
