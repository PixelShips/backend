import { IsIn, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { SHIP_TYPE_NAMES } from '../../models/ships/Ship';

export class SetShipMessage {
  @IsNotEmpty()
  @IsIn(SHIP_TYPE_NAMES)
  shipType: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  location_x: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  location_y: number;
}
