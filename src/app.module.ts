import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';
import { SocketService } from './services/socket.service';

@Module({
  providers: [
    SocketGateway,
    GameService,
    PlayerService,
    SocketService
  ]
})
export class AppModule {}
