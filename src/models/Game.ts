import { WsException } from '@nestjs/websockets';
import { Player } from './Player';

export class Game {
  public players: Map<string, Player> = new Map<string, Player>();

  constructor(private id: string, private name: string) {
    console.log('New game created', id, name);
  }

  public join(player: Player) {
    if (this.players.size > 1) {
      console.log(`Player ${player.id} wants to join to game "${this.name}" (${this.id}) but game is already full`);
      throw new WsException(`This game "${this.name}" is already full`);
    }
    this.players.set(player.id, player);
    player.socket.join(this.id, () => {
      console.log(`Player ${player.id} joined to game "${this.name}" (${this.id})`);
      player.gameId = this.id;
    });
  }

  public exit(player: Player) {
    this.players.has(player.id) ? this.players.delete(player.id) : null;
    console.log(`Player ${player.id} exited from game "${this.name}" (${this.id})`);
    if (this.players.size > 0) {
      for (const player of this.players.values()) {
        player.socket.disconnect()
      }
    }
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getPlayerIds(): string[] {
    const playerIds = [];
    for (const id of this.players.keys()) {
      playerIds.push(id)
    }
    return playerIds;
  }
}