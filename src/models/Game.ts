import { WsException } from '@nestjs/websockets';
import { Player } from './Player';
import { Ship, ShipStatus } from './ships/Ship';
import { EventTypes } from '../events/event.types';
import { SetShipResponse } from '../events/responses/SetShip.response';
import { Shoot } from './Shoot';
import { ShootResponse } from '../events/responses/Shoot.response';
import { Logger } from '@nestjs/common';

export class Game {
  public players: Map<string, Player> = new Map<string, Player>();
  public ships: Map<string, Ship[]> = new Map<string, Ship[]>();

  constructor(private id: string, private name: string) {
    Logger.log(`Utworzono nową gre "${name}" (${id})`, 'GAME');
  }

  public join(player: Player) {
    if (this.players.size > 1) {
      Logger.error(`Gracz ${player.id} chce dołączyć do gry "${this.name}" (${this.id}) ale nie ma juz miejsc`);
      throw new WsException(`W grze "${this.name}" nie ma już miejsc`);
    }
    this.players.set(player.id, player);
    this.ships.set(player.id, []);
    player.socket.join(this.id, () => {
      Logger.log(`Gracz ${player.id} dołączył do gry "${this.name}" (${this.id})`, 'GAME');
      player.gameId = this.id;
    });
  }

  public exit(player: Player) {
    this.players.has(player.id) ? this.players.delete(player.id) : null;
    this.ships.has(player.id) ? this.ships.delete(player.id) : null;
    Logger.warn(`Gracz ${player.id} wyszedł z gry "${this.name}" (${this.id})`, 'GAME');
    if (this.players.size > 0) {
      for (const player of this.players.values()) {
        player.socket.disconnect()
      }
    }
  }

  public setShip(player: Player, ship: Ship) {
    const currentPlayerShip: Ship[] = this.ships.get(player.id);
    const idx = currentPlayerShip.findIndex((s => s.getName() === ship.getName()));
    if (idx >= 0) {
      currentPlayerShip[idx] = ship;
      this.ships.set(player.id, [...currentPlayerShip]);
    } else {
      this.ships.set(player.id, [...currentPlayerShip, ship]);
    }

    const message: SetShipResponse = {
      message: `Statek (${ship.getName()}) utworzony!`,
      currentShips: this.ships.get(player.id).map(s => {
        return {
          name: s.getName(),
          x: s.getX(),
          y: s.getY()
        }
      })
    };
    Logger.log(`Statek (${ship.getName()}) postawiony!`, 'GAME')
    console.log(ship.getCoordinates());
    player.socket.emit(EventTypes.MESSAGE, message)
  }

  public shoot(player: Player, shoot: Shoot) {
    const enemyShips: Ship[] = this.getEnemyShips(player);
    const enemy: Player = this.getEnemy(player);

    for (const ship of enemyShips) {
      if (ship.getStatus() === ShipStatus.SUNK) {
        continue
      }
      const isInRange: boolean = ship.isInShootRange(shoot);
      if (isInRange) {
        const damage: number = ship.calculateDamage(shoot);
        ship.hit(damage);

        Logger.log(`Gracz ${player.id} trafił statek ${ship.getName()} zadając obrażenia ${damage}`);
        const playerMessage: ShootResponse = {
          message: 'Strzał udany!',
          ship: ship.getName(),
          shipStatus: ship.getStatus(),
          damage: damage
        };

        const enemyMessage: ShootResponse = {
          message: 'Przeciwnik uszkodził twój statek',
          ship: ship.getName(),
          shipStatus: ship.getStatus(),
          damage: damage
        };

        if (ship.getStatus() === ShipStatus.SUNK) {
          Logger.log(`Gracz ${player.id} zatopił statek ${ship.getName()}`);
          playerMessage.message = 'Zatopiłeś statek przeciwnika!';
          enemyMessage.message = 'Twój statek został zatopiony!';
        }

        player.socket.emit(EventTypes.MESSAGE, playerMessage);
        enemy.socket.emit(EventTypes.MESSAGE, enemyMessage);
        return
      }
    }
    const playerMessage: ShootResponse = {
      message: 'Strzał chybiony!',
      ship: null,
      shipStatus: null,
      damage: null
    };
    player.socket.emit(EventTypes.MESSAGE, playerMessage);
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

  private getEnemyShips(player: Player): Ship[] {
    const enemy: Player = this.getEnemy(player);
    return this.ships.get(enemy.id);
  }

  private getEnemy(player: Player): Player {
    const playerIds: string[] = this.getPlayerIds();
    const enemy: string[] = playerIds.filter(pid => pid !== player.id);
    return this.players.get(enemy[0]);
  }
}