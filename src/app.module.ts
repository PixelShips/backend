import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';

@Module({
  providers: [
    SocketGateway,
    GameService,
    PlayerService
  ]
})
export class AppModule {}
