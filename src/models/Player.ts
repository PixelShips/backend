import { Socket } from 'socket.io';

export class Player {
  public id: string;
  public gameId: string = null;

  constructor(public socket: Socket) {
    this.id = socket.id;
  }
}