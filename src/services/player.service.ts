import { Injectable } from '@nestjs/common';
import { Player } from '../models/Player';
import { Socket } from 'socket.io';
import { EventTypes } from '../events/event.types';

@Injectable()
export class PlayerService {
  private players: Map<string, Player> = new Map<string, Player>();

  public create(socket: Socket): Player {
    const player = new Player(socket);
    this.players.set(player.id, player);
    console.log('New player created', player.id);
    return player;
  }

  public getPlayer(id: string): Player {
    return this.players.get(id)
  }

  public deletePlayer(id: string) {
    console.log('Player deleted', id);
    this.players.has(id) ? this.players.delete(id) : null;
  }

  public debug(client: Socket) {
    const playerInfos = [];
    for (const [id, player] of this.players) {
      playerInfos.push({
        playerId: id,
        game: player.gameId
      })
    }

    const message = {
      message: "[PLAYER SERVICE] DEBUG",
      playersCount: this.players.size,
      players: playerInfos
    };

    client.emit(EventTypes.MESSAGE, message);
  }
}
