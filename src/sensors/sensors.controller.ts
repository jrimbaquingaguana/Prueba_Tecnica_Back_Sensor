import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dtos';
import { AuthGuard } from '@nestjs/passport';

@Controller('sensors')
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}

  @Get()
  list() {
    return this.sensorsService.listSensors();
  }

  @Post()
  // Para demo, no protegemos; en producción usar AuthGuard('jwt')
  create(@Body() dto: CreateSensorDto) {
    return this.sensorsService.createSensor(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sensorsService.removeSensor(id);
  }

  @Get(':id/readings')
  readings(@Param('id') id: string) {
    return this.sensorsService.listReadingsForSensor(id, 200);
  }

  @Post(':id/calibrate')
  async calibrate(@Param('id') id: string) {
    // Simula un proceso de calibración y retorna secuencia
    const seq = await this.sensorsService.simulateCalibration(id, 8, 500);
    return { result: seq };
  }
}
