import { Injectable } from '@nestjs/common';
import { Game } from '../models/Game';
import { v4 as uuidv4 } from 'uuid';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PlayerService } from './player.service';
import { CreateGameResponse } from '../events/responses/CreateGame.response';
import { EventTypes } from '../events/event.types';
import { JoinGameResponse } from '../events/responses/JoinGame.response';
import { SetShipMessage } from '../events/messages/SetShip.message';
import { Player } from '../models/Player';
import { ShipService } from './ship.service';
import { Ship } from '../models/ships/Ship';
import { ShootMessage } from '../events/messages/Shoot.message';
import { Shoot } from '../models/Shoot';
import { Logger } from '@nestjs/common';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private playerService: PlayerService, private shipService: ShipService) {
    setInterval(() => {
      this.deleteEmptyGames();
    }, 2000);
  }

  public createGame(client: Socket, gameName: string): Game {
    const player = this.playerService.getPlayer(client.id);
    if (player.gameId) {
      Logger.error(`Gracz chce dołączyć do nowej gry ale jest już w "${player.gameId}"`);
      throw new WsException(`Gracz jest już aktywny w "${player.gameId}"`)
    }

    const id = uuidv4();
    const game = new Game(id, gameName);
    this.games.set(id, game);

    game.join(player);

    const message: CreateGameResponse = {
      message: 'Utworzyłeś nową gre!',
      gameName: game.getName(),
      gameId: game.getId()
    };
    client.emit(EventTypes.MESSAGE, message);

    return game;
  }

  public joinToGame(client: Socket, gameId: string) {
    const player = this.playerService.getPlayer(client.id);

    if (player.gameId) {
      Logger.error(`Gracz chce dołączyć do nowej gry ale jest już w "${player.gameId}"`);
      throw new WsException(`Gracz jest już aktywny w "${player.gameId}"`)
    }

    const game = this.getGameById(gameId);
    if (!game) {
      Logger.error(`Gracz chce dołączyć do "${gameId}" ale taka gra nie istnieje`);
      throw new WsException('Gra nie istnieje')
    }
    game.join(player);

    const newPlayerMessage: JoinGameResponse = {
      message: `Dołączyłeś do gry!`,
      gameId: game.getId(),
      gameName: game.getName(),
      players: game.getPlayerIds()
    };

    const otherPlayersMessage: JoinGameResponse = {
      message: `Gracz ${player.id} dołączył do gry!`,
      gameId: game.getId(),
      gameName: game.getName(),
      players: game.getPlayerIds()
    };

    client.emit(EventTypes.MESSAGE, newPlayerMessage);
    client.to(game.getId()).emit(EventTypes.MESSAGE, otherPlayersMessage);
  }

  public getGameById(id: string): Game {
    return this.games.get(id);
  }

  public setShip(client: Socket, data: SetShipMessage) {
    const player: Player = this.playerService.getPlayer(client.id);
    if (!player.gameId) {
      Logger.error(`Gracz ${player.id} chce postawić statek ale nie jest podłączony do gry`);
      throw new WsException(`Nie jesteś podłączony do gry`)
    }
    const game: Game = this.getGameById(player.gameId);
    const ship: Ship = this.shipService.createShip(data);
    const isValid: boolean = this.shipService.isValid(ship, game, player);

    if (isValid) {
      game.setShip(player, ship)
    }
  }

  public shoot(client: Socket, data: ShootMessage) {
    const player: Player = this.playerService.getPlayer(client.id);
    if (!player.gameId) {
      Logger.error(`Gracz ${player.id} chce zbić statek ale nie jest podłączony do gry`);
      throw new WsException(`Nie jesteś podłączony do gry`)
    }
    const game: Game = this.getGameById(player.gameId);
    const shoot: Shoot = new Shoot(data.location_x, data.location_y);
    game.shoot(player, shoot);
  }

  public debug(client: Socket) {
    const gameInfos = [];
    for (const [id, game] of this.games) {
      gameInfos.push({
        gameId: id,
        gameName: game.getName(),
        players: game.getPlayerIds()
      })
    }

    const message = {
      message: "[GAME SERVICE] DEBUG",
      gamesCount: this.games.size,
      games: gameInfos
    };
    client.emit(EventTypes.MESSAGE, message);
  }

  private deleteEmptyGames() {
    for (const game of this.games.values()) {
      if (game.getPlayerIds().length === 0) {
        Logger.log(`Usunięto nieaktywną grę ${game.getId()}`, 'GAME');
        this.games.delete(game.getId());
      }
    }
  }
}
