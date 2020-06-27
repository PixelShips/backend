import { WsException } from '@nestjs/websockets';
import { Player } from './Player';
import { SetShipMessage } from '../events/messages/SetShip.message';
import { Ship } from './ships/Ship';
import { Destroyer } from './ships/Destroyer';
import { Carrier } from './ships/Carrier';
import { Battleship } from './ships/Battleship';
import { Submarine } from './ships/Submarine';
import { PatrolBoat } from './ships/PatrolBoat';
import { EventTypes } from '../events/event.types';
import { SetShipResponse } from '../events/responses/SetShip.response';

export class Game {
  public players: Map<string, Player> = new Map<string, Player>();
  public ships: Map<string, Ship[]> = new Map<string, Ship[]>();

  constructor(private id: string, private name: string) {
    console.log('New game created', id, name);
  }

  public join(player: Player) {
    if (this.players.size > 1) {
      console.log(`Player ${player.id} wants to join to game "${this.name}" (${this.id}) but game is already full`);
      throw new WsException(`This game "${this.name}" is already full`);
    }
    this.players.set(player.id, player);
    this.ships.set(player.id, []);
    player.socket.join(this.id, () => {
      console.log(`Player ${player.id} joined to game "${this.name}" (${this.id})`);
      player.gameId = this.id;
    });
  }

  public exit(player: Player) {
    this.players.has(player.id) ? this.players.delete(player.id) : null;
    this.ships.has(player.id) ? this.ships.delete(player.id) : null;
    console.log(`Player ${player.id} exited from game "${this.name}" (${this.id})`);
    if (this.players.size > 0) {
      for (const player of this.players.values()) {
        player.socket.disconnect()
      }
    }
  }

  public setShip(player: Player, ship: Ship) {
    const currentPlayerShip: Ship[] = this.ships.get(player.id);
    this.ships.set(player.id, [...currentPlayerShip, ship]);

    const message: SetShipResponse = {
      message: `Ship (${ship.getName()}) created!`,
      currentShips: this.ships.get(player.id).map(s => {
        return {
          name: s.getName(),
          x: s.getX(),
          y: s.getY()
        }
      })
    };
    player.socket.emit(EventTypes.MESSAGE, message)
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