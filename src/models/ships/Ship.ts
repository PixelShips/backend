export enum SHIP_STATUS {
  LIVE = 'live',
  SUNK = 'sunk'
}

export interface ShipCoordinates {
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

  protected status: SHIP_STATUS = SHIP_STATUS.LIVE;
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

  public getName(): string {
    return this.name;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }


  //   (left, top).  .  .  .  .  .  .  .  (right, top)
  //       .                                   .
  //       .                                   .
  //       .               (x, y)              .
  //       .                                   .
  //       .                                   .
  //   (left, bottom).  .  .  .  .  .  .(right, bottom)

  public getCoordinates(): ShipCoordinates {
    const left = this.x - (this.width / 2.0);
    const right = this.x + (this.width / 2.0);
    const top = this.y - (this.height / 2.0);
    const bottom = this.y + (this.height / 2.0);
    return { left, right, top, bottom } as ShipCoordinates;
  }

  public isIntersect(otherShip: Ship): boolean {
    console.log('\n');
    console.log('CHECKING INTERSECT')
    console.log('EXISTING SHIP', otherShip.getName(), otherShip.getCoordinates());
    console.log('NEW SHIP', this.getName(), this.getCoordinates());
    const s1: ShipCoordinates = this.getCoordinates();
    const s2: ShipCoordinates = otherShip.getCoordinates();
    return !(
        s2.left > s1.right ||
        s2.right < s1.left ||
        s2.top > s1.bottom ||
        s2.bottom < s1.top
    );
  }
}

export const SHIP_TYPE_NAMES = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrol-boat'];