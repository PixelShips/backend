import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ShipDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}