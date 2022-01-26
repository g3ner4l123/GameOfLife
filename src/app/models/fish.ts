import { Animal } from "./animal";

export class Fish extends Animal{

  constructor(x:number,y:number,cicles:number) {
    super();
    this.xCoordinate = x;
    this.yCoordinate = y;
    this.ciclesToBreed = cicles;
    this.idetifier = 1;
  }

}

