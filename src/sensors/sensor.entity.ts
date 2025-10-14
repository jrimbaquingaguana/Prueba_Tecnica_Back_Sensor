// src/sensors/sensor.entity.ts

export interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'combo';
  lastSeen: Date;
}

export interface Reading {
  sensorId: string;
  timestamp: Date;          // fecha completa
  date: string;             // yyyy-mm-dd
  time: string;             // hh:mm:ss
  weekday: string;          // nombre del día (lunes, martes, etc.)
  temperature: number;      // °C
  humidity: number;         // %
  note?: string;
}
