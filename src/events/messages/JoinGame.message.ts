import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class JoinGameMessage {
  @IsNotEmpty()
  @IsString()
  id: string;
}
