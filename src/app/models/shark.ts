import { Animal } from "./animal";

export class Shark extends Animal{
  ciclesToDeath!: number;

  constructor(x:number,y:number,cicles:number, circlesDeath:number) {
    super();
    this.xCoordinate = x;
    this.yCoordinate = y;
    this.ciclesToBreed = cicles;
    this.ciclesToDeath = circlesDeath;
    this.idetifier = 2;
  }
}
