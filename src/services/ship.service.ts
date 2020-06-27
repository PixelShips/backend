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
    console.group('CHECKING VALIDATION');
    console.log('SHIP: ', ship.getName(), ship.getCoordinates());

    const isValidShipLocation: boolean = ship.isValidLocation();
    console.log('IS VALID LOCATION (MIN, MAX)', isValidShipLocation);
    if (!isValidShipLocation) {
      return false;
    }

    const currentShips: Ship[] = game.ships.get(player.id);
    console.log('CURRENT SHIPS', currentShips.map(s => {
      return {
        name: s.getName(), c: s.getCoordinates()
      }
    }));

    const isValidLocationSpace: boolean = this.locationValidator(ship, currentShips);

    // @TODO: valid limits
    return isValidShipLocation && isValidLocationSpace;
  }

  private locationValidator(ship: Ship, currentShips: Ship[]): boolean {
    let isValid = true;
    for (const s of currentShips) {
      if (ship.isIntersect(s)) {
        console.log('INTERSECTION FOUND!');
        console.log('\tShip 1: ', ship.getName(), ship.getCoordinates());
        console.log('\tShip 2: ', s.getName(), s.getCoordinates());
        console.log('\n');
        isValid = false;
        break;
      }
      console.log('\n');
    }
    return isValid;
  }
}