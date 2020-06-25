import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGameMessage {
  @IsNotEmpty()
  @IsString()
  name: string;
}
