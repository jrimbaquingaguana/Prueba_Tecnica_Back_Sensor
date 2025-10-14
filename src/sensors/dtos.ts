import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateSensorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  // only allow the three valid sensor types
  type?: 'temperature' | 'humidity' | 'combo';
}
