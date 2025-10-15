import { Controller, Get, Put, Delete, Body, Param, Post, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsString, IsEmail, IsOptional } from 'class-validator';

class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: string;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    // simple validation - class-validator is not automatically applied here without ValidationPipe
    if (!body.username || !body.password || !body.name || !body.email) {
      throw new BadRequestException('Campos requeridos: username, password, name, email');
    }
    return this.usersService.create(body as any);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.usersService.getOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
