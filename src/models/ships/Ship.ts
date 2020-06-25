export enum SHIP_STATUS {
  LIVE = 'live',
  SUNK = 'sunk'
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
    // console.log(`x = ${x}, y = ${y}`);
    // console.log(`minX = ${this.minX()}, maxX = ${this.maxX()}, minY = ${this.minY()}, maxY = ${this.maxY()}`);
    // if (x < this.minX() || x > this.maxX() || y < this.minY() || y > this.maxY()) {
    //   throw new Error('ZLA LOKALIZACJA')
    // }
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

  public isValidLocation() {
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
}

export const SHIP_TYPE_NAMES = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrol-boat'];