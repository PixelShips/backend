import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class ShootMessage {
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
