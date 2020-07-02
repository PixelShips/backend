import { Injectable } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Socket } from 'socket.io';
import { EventTypes } from '../events/event.types';
import { GameService } from './game.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class SocketService {
  constructor(
    private playerService: PlayerService,
    private gameService: GameService
  ) {}
  
  public handleConnection(client: Socket): any {
    Logger.log(`Nowe połączenie: ${client.id}`, 'SOCKET');
    this.playerService.create(client);
    client.emit(EventTypes.CONNECTION_STATUS, 'Connected')
  }

  public handleDisconnect(client: Socket): any {
    const player = this.playerService.getPlayer(client.id);
    Logger.warn(`Połączenie zerwane: ${player.id}`, 'SOCKET');
    if (player) {
      const playerGame = this.gameService.getGameById(player.gameId);
      if (playerGame) {
        playerGame.exit(player);
      }
      this.playerService.deletePlayer(client.id);
    }
    client.emit(EventTypes.CONNECTION_STATUS, 'Disconnect');
  }
}