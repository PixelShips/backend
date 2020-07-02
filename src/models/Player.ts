import { Socket } from 'socket.io';

export class Player {
  public id: string;
  public gameId: string = null;
  public isReady = false;

  constructor(public socket: Socket) {
    this.id = socket.id;
  }
}