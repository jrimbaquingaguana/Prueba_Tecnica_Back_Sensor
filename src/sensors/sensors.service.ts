import { Injectable, Logger } from '@nestjs/common';
import { Sensor, Reading } from './sensor.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SensorsService {
  private readonly logger = new Logger(SensorsService.name);

  private sensors: Sensor[] = [];
  private readings: Reading[] = [];
  private regions = ['Region 1', 'Region 2', 'Region 3'];

  constructor() {
    // Sensores iniciales de ejemplo por región
    this.regions.forEach(region => {
      this.createSensor({ name: `Sensor-Estufa-${region}`, type: 'temperature' });
      this.createSensor({ name: `Sensor-Ambiente-${region}`, type: 'combo' });
    });

    // Crear historial inicial
    this.generateInitialHistory();

    // 🕒 Generar lecturas automáticas cada 10 s
    setInterval(() => this.generatePeriodicReadings(), 10_000);
  }

  createSensor({ name, type }: { name: string; type?: Sensor['type'] }) {
    const s: Sensor = { id: uuidv4(), name, type: type || 'combo', lastSeen: new Date() };
    this.sensors.push(s);
    return s;
  }

  listSensors() {
    return this.sensors;
  }

  findSensor(id: string) {
    return this.sensors.find(s => s.id === id);
  }

  removeSensor(id: string) {
    this.sensors = this.sensors.filter(s => s.id !== id);
    this.readings = this.readings.filter(r => r.sensorId !== id);
    return true;
  }

  saveReading(reading: Reading) {
    this.readings.push(reading);
    const s = this.findSensor(reading.sensorId);
    if (s) s.lastSeen = reading.timestamp;
    this.readings = this.readings.slice(-1000); // limitar historial
  }

  listReadingsForSensor(sensorId: string, limit = 50) {
    return this.readings
      .filter(r => r.sensorId === sensorId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // -------------------- GENERACIÓN DE DATOS --------------------
  private randomTemperature(base = 22, variance = 5) {
    const v = base + (Math.random() * variance * 2 - variance);
    return Math.round(v * 10) / 10;
  }

  private randomHumidity(base = 55, variance = 20) {
    const v = base + (Math.random() * variance * 2 - variance);
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  private getTimeMetadata(date: Date) {
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      weekday: date.toLocaleDateString('es-ES', { weekday: 'long' }),
    };
  }

  generateReadingFor(sensor: Sensor): Reading {
    const now = new Date();
    const { date, time, weekday } = this.getTimeMetadata(now);

    const tBase = sensor.type === 'temperature' ? 25 : 22;
    const hBase = sensor.type === 'humidity' ? 60 : 55;

    const reading: Reading = {
      sensorId: sensor.id,
      timestamp: now,
      date,
      time,
      weekday,
      temperature: Math.round(this.randomTemperature(tBase, 6) * 10) / 10,
      humidity: this.randomHumidity(hBase, 25),
      note: 'Simulated reading (auto-update every 10s)',
    };

    this.saveReading(reading);
    this.logger.log(`Nueva lectura generada para ${sensor.name}: ${reading.temperature}°C / ${reading.humidity}%`);
    return reading;
  }

  private generateInitialHistory() {
    const now = Date.now();
    this.sensors.forEach(sensor => {
      for (let i = 60; i >= 0; i -= 5) {
        const ts = new Date(now - i * 60 * 1000);
        const { date, time, weekday } = this.getTimeMetadata(ts);
        const reading: Reading = {
          sensorId: sensor.id,
          timestamp: ts,
          date,
          time,
          weekday,
          temperature: Math.round(this.randomTemperature(22, 6) * 10) / 10,
          humidity: this.randomHumidity(55, 25),
          note: 'historic simulated',
        };
        this.readings.push(reading);
      }
    });
  }

  private generatePeriodicReadings() {
    this.sensors.forEach(sensor => this.generateReadingFor(sensor));
  }

  async simulateCalibration(sensorId: string, iterations = 6, delayMs = 0) {
    const sensor = this.findSensor(sensorId);
    if (!sensor) throw new Error('Sensor not found');
    const sequence: Reading[] = [];
    for (let i = 0; i < iterations; i++) {
      const r = this.generateReadingFor(sensor);
      r.temperature = Math.round((r.temperature + (Math.random() - 0.5) * 2) * 10) / 10;
      sequence.push(r);
      if (delayMs > 0) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    return sequence;
  }

  // -------------------- NUEVO MÉTODO PÚBLICO --------------------
  public generateSensorData() {
    // Devuelve array con lectura más reciente de cada sensor, incluyendo región
    return this.sensors.map(sensor => {
      const lastReading = this.listReadingsForSensor(sensor.id, 1)[0];
      return {
        region: this.regions.find(r => sensor.name.includes(r)) || 'Unknown',
        name: sensor.name,
        temp: lastReading?.temperature || 0,
        hum: lastReading?.humidity || 0,
      };
    });
  }
}
