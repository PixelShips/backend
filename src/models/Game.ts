import { WsException } from '@nestjs/websockets';
import { Player } from './Player';

export class Game {
  public players: Player[] = [];

  constructor(private id: string) { }

  public join(player: Player) {
    if (this.players.length > 1) {
      throw new WsException('Ta gra ma juz za dużo graczy');
    }
    this.players.push(player);
    player.socket.join(this.id, () => {
      player.gameId = this.id;
    });

  }

  public getId(): string {
    return this.id;
  }
}