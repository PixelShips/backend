import { WsException } from '@nestjs/websockets';
import { Player } from './Player';
import { Ship, SHIP_TYPE_NAMES, ShipStatus } from './ships/Ship';
import { EventTypes } from '../events/event.types';
import { SetShipResponse } from '../events/responses/SetShip.response';
import { Shoot } from './Shoot';
import { ShootResponse } from '../events/responses/Shoot.response';
import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Server } from 'socket.io';
import { GameStatusResponse } from '../events/responses/GameStatus.response';

export enum GameStatus {
  CREATED = 'CREATED',
  SETUP = 'SETUP',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

export class Game {
  public players: Map<string, Player> = new Map<string, Player>();
  public ships: Map<string, Ship[]> = new Map<string, Ship[]>();
  private gameStatus: Subject<GameStatus> = new Subject<GameStatus>();

  constructor(private id: string, private name: string, private server: Server) {
    Logger.log(`Utworzono nową gre "${name}" (${id})`, 'GAME');
    this.initSubscriptions();
    this.gameStatus.next(GameStatus.CREATED);
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


    if (this.players.size === 2) {
      this.gameStatus.next(GameStatus.SETUP);
    }
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
    Logger.log(`Statek (${ship.getName()}) postawiony!`, 'GAME');
    console.log(ship.getCoordinates());
    player.socket.emit(EventTypes.SET_SHIP, message);

    this.checkPlayersReadiness()
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

        player.socket.emit(EventTypes.SHOOT, playerMessage);
        enemy.socket.emit(EventTypes.SHOOT, enemyMessage);
        Logger.log(`Teraz kolej na gracza ${enemy.id}`, 'GAME STATUS');
        enemy.socket.emit(EventTypes.ORDER, { message: 'Teraz twoja kolej!' });
        this.checkShipsLiveness(enemy);
        return
      }
    }
    const playerMessage: ShootResponse = {
      message: 'Strzał chybiony!',
      ship: null,
      shipStatus: null,
      damage: null
    };
    player.socket.emit(EventTypes.SHOOT, playerMessage);
    Logger.log(`Teraz kolej na gracza ${enemy.id}`, 'GAME STATUS');
    enemy.socket.emit(EventTypes.ORDER, { message: 'Teraz twoja kolej!' });
    this.checkShipsLiveness(enemy);
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

  private initSubscriptions(): void {
    // this.gameStatus.pipe(filter(status => status === GameStatus.CREATED)).subscribe(() => {
    //   this.server.to(this.id).emit(EventTypes.GAME_STATUS, { message: 'Gra utworzona!' });
    // });

    this.gameStatus.pipe(filter(status => status === GameStatus.SETUP)).subscribe((status: GameStatus) => {
      Logger.log('Gra w fazie ustawiania staków', 'GAME STATUS');
      this.server.to(this.id).emit(EventTypes.GAME_STATUS, { message: 'Gra w fazie ustawiania staków', status } as GameStatusResponse);
    });

    this.gameStatus.pipe(filter(status => status === GameStatus.ACTIVE)).subscribe((status: GameStatus) => {
      Logger.log('Statki ustawione przez obu graczy, czas na grę!', 'GAME STATUS');
      this.server.to(this.id).emit(EventTypes.GAME_STATUS, { message: 'Statki ustawione przez obu graczy, czas na grę!', status } as GameStatusResponse);
    });

    this.gameStatus.pipe(filter(status => status === GameStatus.FINISHED)).subscribe((status: GameStatus) => {
      Logger.log('Gra zakończona!', 'GAME STATUS');
      this.server.to(this.id).emit(EventTypes.GAME_STATUS, { message: 'Gra zakończona!', status } as GameStatusResponse);
    });
  }

  private checkPlayersReadiness() {
    let readiness = this.players.size === 2;
    for (const player of this.players.values()) {
      if (this.ships.get(player.id).length === SHIP_TYPE_NAMES.length) {
        player.isReady = true;
      }
      readiness = readiness && player.isReady
    }

    if (readiness) {
      this.gameStatus.next(GameStatus.ACTIVE)
    }
  }

  private checkShipsLiveness(enemy: Player) {
    const ships: Ship[] = this.ships.get(enemy.id);
    const hasLiveShip: boolean = ships.some(s => s.getStatus() === ShipStatus.LIVE);
    if (!hasLiveShip) {
      const player: Player = this.getEnemy(enemy);
      Logger.log(`Gra zakończona, wygrał ${player.id}`, 'GAME STATUS');
      this.gameStatus.next(GameStatus.FINISHED);
      enemy.socket.emit(EventTypes.PLAYER_STATUS,
        {
          message: 'Przegrałeś!',
          status: 'LOSE'
        } as GameStatusResponse
      );
      player.socket.emit(EventTypes.PLAYER_STATUS,
        {
          message: 'Wygrałeś!',
          status: 'WIN'
        } as GameStatusResponse
      );
    }
  }
}
