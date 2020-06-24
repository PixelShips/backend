import { Injectable } from '@nestjs/common';
import { Game } from '../models/Game';
import { v4 as uuidv4 } from 'uuid';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class GameService {
  private games: Game[] = [];

  public create(): Game {
    const id = uuidv4();
    const game = new Game(id);
    this.games.push(game);
    return game;
  }

  public getGameById(id: string): Game {
    const game =  this.games.find(game => game.getId() === id);
    if (!game) {
      throw new WsException('Nie ma gry z takim ID');
    }
    return game;
  }
}
