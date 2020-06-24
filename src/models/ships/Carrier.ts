import { Ship } from './Ship';

export class Carrier extends Ship {
  protected name = 'Carrier';
  protected value = 5;
  protected width = 0.2;
  protected height = 0.05;
}