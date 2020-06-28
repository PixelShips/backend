import { Coordinates } from './ships/Ship';

export class Shoot {
  public range = 0.1;
  constructor(public x: number, public y: number) {}

  public getCoordinates(): Coordinates {
    const left = this.x - (this.range / 2.0);
    const right = this.x + (this.range / 2.0);
    const top = this.y - (this.range / 2.0);
    const bottom = this.y + (this.range / 2.0);
    return { left, right, top, bottom } as Coordinates;
  }
}