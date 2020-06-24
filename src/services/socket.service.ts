import { Injectable } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Socket } from 'socket.io';
import { EventTypes } from '../events/event.types';
import { GameService } from './game.service';

@Injectable()
export class SocketService {
  constructor(
    private playerService: PlayerService,
    private gameService: GameService
  ) {}
  
  public handleConnection(client: Socket): any {
    const player = this.playerService.create(client);
    console.log(`New client connected: ${player.id}`);
    client.emit(EventTypes.CONNECT, 'Connected')
  }

  public handleDisconnect(client: Socket): any {
    const player = this.playerService.getPlayer(client.id);
    if (player) {
      const playerGame = this.gameService.getGameById(player.gameId);
      if (playerGame) {
        playerGame.exit(player);
      }
      this.playerService.deletePlayer(client.id);
    }
    client.emit(EventTypes.DISCONNECT, "Disconnect");
  }
}