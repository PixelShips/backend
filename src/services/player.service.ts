import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Player } from '../models/Player';
import { Socket } from 'socket.io';

@Injectable()
export class PlayerService {
  private players: Player[] = [];

  public create(socket: Socket): Player {
    const player = new Player(socket);
    this.players.push(player);
    return player;
  }

  public getPlayer(socket: Socket): Player {
    const player =  this.players.find(player => player.id === socket.id);
    if (!player) {
      throw new WsException('Nie ma takiego gracza');
    }
    return player;
  }
}
