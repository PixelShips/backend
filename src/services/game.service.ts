import { Injectable } from '@nestjs/common';
import { Game } from '../models/Game';
import { v4 as uuidv4 } from 'uuid';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PlayerService } from './player.service';
import { CreateGameResponse } from '../events/responses/CreateGame.response';
import { EventTypes } from '../events/event.types';
import { JoinGameResponse } from '../events/responses/JoinGame.response';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private playerService: PlayerService) {
    setInterval(() => {
      this.deleteEmptyGames();
    }, 2000);
  }

  public createGame(client: Socket): Game {
    const id = uuidv4();
    const game = new Game(id);
    this.games.set(id, game);

    const player = this.playerService.getPlayer(client.id);
    game.join(player);

    const message: CreateGameResponse = {
      message: 'Game created!',
      gameId: game.getId()
    };
    client.emit(EventTypes.MESSAGE, message);

    return game;
  }

  public joinToGame(client: Socket, gameId: string) {
    const game = this.getGameById(gameId);

    const player = this.playerService.getPlayer(client.id);
    game.join(player);

    const newPlayerMessage: JoinGameResponse = {
      message: `Joined to game!`,
      gameId: game.getId(),
      players: game.getPlayerIds()
    };

    const otherPlayersMessage: JoinGameResponse = {
      message: `Player ${player.id} joined to game!`,
      gameId: game.getId(),
      players: game.getPlayerIds()
    };

    client.emit(EventTypes.MESSAGE, newPlayerMessage);
    client.to(game.getId()).emit(EventTypes.MESSAGE, otherPlayersMessage);
  }

  public getGameById(id: string): Game {
    return this.games.get(id);
  }

  public deleteGame(id: string) {
    this.games.has(id) ? this.games.delete(id) : null;
  }

  public debug(client: Socket) {
    const gameInfos = [];
    for (const [id, game] of this.games) {
      gameInfos.push({
        gameId: id,
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
        this.games.delete(game.getId());
      }
    }
  }
}
