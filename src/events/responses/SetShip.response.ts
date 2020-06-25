export interface SetShipResponse {
  message: string;
  currentShips: ShipInfo[];
}

interface ShipInfo {
  name: string;
  x: number,
  y: number
}