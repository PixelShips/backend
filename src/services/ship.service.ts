import { Injectable } from '@nestjs/common';
import { Ship } from '../models/ships/Ship';
import { SetShipMessage } from '../events/messages/SetShip.message';
import { Carrier } from '../models/ships/Carrier';
import { Battleship } from '../models/ships/Battleship';
import { Destroyer } from '../models/ships/Destroyer';
import { Submarine } from '../models/ships/Submarine';
import { PatrolBoat } from '../models/ships/PatrolBoat';
import { Game } from '../models/Game';
import { Player } from '../models/Player';
import { WsException } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@Injectable()
export class ShipService {
  public createShip(data: SetShipMessage): Ship {
    let ship: Ship;

    switch (data.shipType) {
      case 'carrier':
        ship = new Carrier(data.location_x, data.location_y);
        break;
      case 'battleship':
        ship = new Battleship(data.location_x, data.location_y);
        break;
      case 'destroyer':
        ship = new Destroyer(data.location_x, data.location_y);
        break;
      case 'submarine':
        ship = new Submarine(data.location_x, data.location_y);
        break;
      case 'patrol-boat':
        ship = new PatrolBoat(data.location_x, data.location_y);
        break;
    }
    return ship;
  }

  public isValid(ship: Ship, game: Game, player: Player): boolean {
    const isValidShipLocation: boolean = ship.isValidLocation();
    if (!isValidShipLocation) {
      Logger.error(`Statek ${ship.getName()} nie mieści się na planszy gry`);
      console.error(ship.getCoordinates());
      throw new WsException('Statek nie mieści się na planszy gry');
    }

    const currentShips: Ship[] = game.ships.get(player.id);

    const isValidLocationSpace: boolean = this.locationValidator(ship, currentShips);
    if (!isValidLocationSpace) {
      throw new WsException('W tym miejscu jest już inny statek');
    }

    return isValidShipLocation && isValidLocationSpace;
  }

  private locationValidator(ship: Ship, currentShips: Ship[]): boolean {
    let isValid = true;
    for (const s of currentShips) {
      if (ship.isIntersect(s) && s.getName() !== ship.getName()) {
        Logger.error('W tym miejscu jest już inny statek');
        console.error('Ship 1: ', ship.getName(), ship.getCoordinates());
        console.error('Ship 2: ', s.getName(), s.getCoordinates());
        isValid = false;
        break;
      }
    }
    return isValid;
  }

}