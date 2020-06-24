import { WsException } from '@nestjs/websockets';
import { Player } from './Player';

export class Game {
  public players: Map<string, Player> = new Map<string, Player>();

  constructor(private id: string) { }

  public join(player: Player) {
    if (this.players.size > 1) {
      throw new WsException('Ta gra ma juz za dużo graczy');
    }
    this.players.set(player.id, player);
    player.socket.join(this.id, () => {
      player.gameId = this.id;
    });
  }

  public exit(player: Player) {
    this.players.has(player.id) ? this.players.delete(player.id) : null;
    if (this.players.size > 0) {
      for (const player of this.players.values()) {
        player.socket.disconnect()
      }
    }
  }

  public getId(): string {
    return this.id;
  }

  public getPlayerIds(): string[] {
    const playerIds = [];
    for (const id of this.players.keys()) {
      playerIds.push(id)
    }
    return playerIds;
  }
}