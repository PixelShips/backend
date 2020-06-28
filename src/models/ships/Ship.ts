import { Shoot } from '../Shoot';

export enum ShipStatus {
  LIVE = 'live',
  SUNK = 'sunk'
}

export interface Coordinates {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export abstract class Ship {
  protected abstract readonly name: string;
  protected abstract readonly value: number;
  protected abstract readonly width: number;
  protected abstract readonly height: number;
  
  protected health = 100;
  protected status: ShipStatus = ShipStatus.LIVE;
  protected x: number;
  protected y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  protected minX(): number {
    return this.width / 2.0
  }

  protected maxX(): number {
    return 1.0 - (this.width / 2.0);
  }

  protected minY(): number {
    return this.height / 2.0
  }

  protected maxY(): number {
    return 1.0 - (this.height / 2.0);
  }

  public isValidLocation(): boolean {
    return this.x > this.minX() && this.x < this.maxX() && this.y > this.minY() && this.y < this.maxY();
  }

  public getArea(): number {
    return this.width * this.height;
  }

  public getName(): string {
    return this.name;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public hit(value: number) {
    this.health = this.health - value;
    if (this.health <= 0) {
      this.health = 0;
      this.status = ShipStatus.SUNK;
    }
  }

  public isInShootRange(shoot: Shoot): boolean {
    const shootCoordinates: Coordinates = shoot.getCoordinates();
    const shipCoordinates: Coordinates = this.getCoordinates();
    return this._isIntersect(shootCoordinates, shipCoordinates);
  }

  public calculateDamage(shoot: Shoot): number {
    const shootCoordinates: Coordinates = shoot.getCoordinates();
    const shipCoordinates: Coordinates = this.getCoordinates();

    const left = Math.max(shipCoordinates.left, shootCoordinates.left);
    const right = Math.min(shipCoordinates.right, shootCoordinates.right);
    const bottom = Math.min(shipCoordinates.bottom, shootCoordinates.bottom);
    const top = Math.max(shipCoordinates.top, shootCoordinates.top);

    const width = right - left;
    const height = bottom - top;
    const area = width * height;

    return area / this.getArea() * 100;
  }

  //   (left, top).  .  .  .  .  .  .  .  (right, top)
  //       .                                   .
  //       .                                   .
  //       .               (x, y)              .
  //       .                                   .
  //       .                                   .
  //   (left, bottom).  .  .  .  .  .  .(right, bottom)

  public getCoordinates(): Coordinates {
    const left = this.x - (this.width / 2.0);
    const right = this.x + (this.width / 2.0);
    const top = this.y - (this.height / 2.0);
    const bottom = this.y + (this.height / 2.0);
    return { left, right, top, bottom } as Coordinates;
  }

  public isIntersect(otherShip: Ship): boolean {
    console.log('\n');
    console.log('CHECKING INTERSECT');
    console.log('EXISTING SHIP', otherShip.getName(), otherShip.getCoordinates());
    console.log('NEW SHIP', this.getName(), this.getCoordinates());
    const s1: Coordinates = this.getCoordinates();
    const s2: Coordinates = otherShip.getCoordinates();
    return this._isIntersect(s1, s2);
  }

  private _isIntersect(c1: Coordinates, c2: Coordinates): boolean {
    return !(
      c2.left > c1.right ||
      c2.right < c1.left ||
      c2.top > c1.bottom ||
      c2.bottom < c1.top
    )
  }

  public getStatus(): ShipStatus {
    return this.status;
  }
}

export const SHIP_TYPE_NAMES = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrol-boat'];