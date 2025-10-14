// src/sensors/sensors.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SensorsService } from './sensors.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({ cors: true })
export class SensorsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: { id: string; username: string; name: string }[] = [];

  constructor(private readonly sensorsService: SensorsService, private readonly usersService: UsersService) {
    // Emitir datos cada 5 segundos
    setInterval(() => {
      const sensorData = this.sensorsService.generateSensorData();
      this.server.emit('sensor-data', sensorData);

      // Emitir lista de usuarios conectados
      this.server.emit('connected-users', this.connectedUsers);
    }, 5000);
  }

  afterInit() {
    console.log('WebSocket iniciado');
  }

  async handleConnection(client: Socket) {
    const username = client.handshake.query.user as string;
    const user = await this.usersService.findByUsername(username);

    if (user) {
      this.connectedUsers.push({ id: client.id, username: user.username, name: user.name });
      console.log(`Usuario conectado: ${user.name}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers = this.connectedUsers.filter(u => u.id !== client.id);
    console.log(`Usuario desconectado: ${client.id}`);
  }

  @SubscribeMessage('user-action')
  handleUserAction(@ConnectedSocket() client: Socket, @MessageBody() data: { action: string }) {
    console.log(`Acción de ${client.id}: ${data.action}`);
  }
}
