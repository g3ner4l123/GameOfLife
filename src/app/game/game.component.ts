import { Component, OnInit } from '@angular/core';
import { Animal } from '../models/animal';
import { Fish } from '../models/fish';

import { Shark } from '../models/shark';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  public rowSize = 20;
  public colSize = 20;
  public gird: number[][] | undefined;
  public animals: Animal[] = [];
  public ready:boolean = false;
  private timeToBreed = 10;
  private timeToDeath = 5;
  private isRunning = false;
  private intervalId!: number;
  private data: Map<number,number> = new Map();
  private counter:number = 0;

  constructor() { }

  ngOnInit(): void {
    this.gird = new Array(this.rowSize).fill(0).map(() => new Array(this.colSize).fill(0));
    this.generateSharks(20);
    this.generateFish(200);
    this.draw();
    this.ready = true;
  }

  private generateSharks(number:number) {
    let counter = 0;
    while (counter < number) {
      let x = Math.floor(Math.random() * this.rowSize);
      let y = Math.floor(Math.random() * this.colSize);
      if (!this.animals.some(a => a.xCoordinate == x && a.yCoordinate == y)) {
        this.animals.push(new Shark(x,y,0,0));
        counter++;
      }
    }
  }

  private generateFish(number:number) {
    let counter = 0;
    while (counter < number) {
      let x = Math.floor(Math.random() * this.rowSize);
      let y = Math.floor(Math.random() * this.colSize);
      if (!this.animals.some(a => a.xCoordinate == x && a.yCoordinate == y)) {
        this.animals.push(new Fish(x,y,0));
        counter++;
      }
    }
  }

  public tick() {
    this.animals.sort((a1,a2) => {
      return a1.idetifier - a2.idetifier;
    })
    if (!this.animals.some(a => a.idetifier == 2)) {
      this.stop();
    } else {
      this.counter++;
    for (var i = 0;i<this.animals!.length;i++) {
      this.calculateMove(this.animals![i]);
    }
    this.draw();
  }
  }

  private draw() {
    this.gird = new Array(this.rowSize).fill(0).map(() => new Array(this.colSize).fill(0));
    for (var i = 0;i<this.animals!.length;i++) {
      if (this.animals![i] instanceof Fish) {
        this.gird[this.animals![i].xCoordinate][this.animals![i].yCoordinate] = 1;
      } else if (this.animals![i] instanceof Shark) {
        this.gird[this.animals![i].xCoordinate][this.animals![i].yCoordinate] = 2;
      }
    }
  }

  private calculateMoveFish(fish: Fish) {
    let index = this.animals?.indexOf(fish);
    let neighbours = this.getNeighbours(fish);
    let nextField = this.getNextField(neighbours); //HERE
    if ( nextField != undefined) {
      if (fish.ciclesToBreed < this.timeToBreed) {
        fish.ciclesToBreed++;
      } else {
        fish.ciclesToBreed = 0;
        this.animals.push(new Fish(fish.xCoordinate,fish.yCoordinate,0));
      }
      fish.xCoordinate = nextField[0];
      fish.yCoordinate = nextField[1];
    } else {
      if (fish.ciclesToBreed < this.timeToBreed ) {
        fish.ciclesToBreed++;
      }
    }
    this.animals[index] = fish;
    this.gird![fish.xCoordinate][fish.yCoordinate] = 1;
  }

  private calculateMoveShark(shark: Shark) {
    let index = this.animals?.indexOf(shark);
    let neighbours = this.getNeighbours(shark);
    let nextfield = this.getNextFieldShark(neighbours); //HERE
    if ( nextfield != undefined) {
      if (this.animals.some(a => a.xCoordinate == nextfield[0] && a.yCoordinate == nextfield[1])) {
        shark.ciclesToDeath = 0;
        let killed = this.animals.filter(x => x.xCoordinate == nextfield[0] && x.yCoordinate == nextfield[1])[0]
        let killedIndex = this.animals.indexOf(killed);
        delete this.animals[killedIndex];
      } else {
        if ( shark.ciclesToDeath < this.timeToDeath) {
          shark.ciclesToDeath++;
        } else {
          delete this.animals[index];
          return
        }
      }
      if ( shark.ciclesToBreed < this.timeToBreed ) {
        shark.ciclesToBreed++;
      } else {
        shark.ciclesToBreed = 0;
        this.animals?.push( new Shark(shark.xCoordinate,shark.yCoordinate,0,0));
      }
      shark.xCoordinate = nextfield[0];
      shark.yCoordinate = nextfield[1];
    } else {
      if ( shark.ciclesToDeath < this.timeToDeath) {
        shark.ciclesToDeath++;
      } else {
        delete this.animals[index];
        return
      }
      if (shark.ciclesToBreed < this.timeToBreed  ) {
        shark.ciclesToBreed++;
      }
    }
    this.animals[index] = shark;
    this.gird![shark.xCoordinate][shark.yCoordinate] = 2;
  }

  private calculateMove(animal: Animal) {
    if (animal instanceof Fish) {
      this.calculateMoveFish(animal);
    } else if ( animal instanceof Shark) {
      this.calculateMoveShark(animal);
    }
  }

  private getNextFieldShark(neighbours:[number,number][]):[number,number]  {
    let fishneigbours: [number,number][] = [];
    for (var i = 0; i < neighbours.length;i++) {
      if ( this.gird![neighbours[i][0]][neighbours[i][1]] == 1 ) {
        fishneigbours.push(neighbours[i]);
      }
    }
    if (fishneigbours.length>0) {
      let index = Math.floor(Math.random() * fishneigbours.length);
      return fishneigbours[index];
    }
    return this.getNextField(neighbours);
  }

  private getNextField(neighbours:[number,number][]):[number,number] {
    neighbours = neighbours.filter(x => !this.animals.some(y => y.xCoordinate == x[0] && y.yCoordinate == x[1]))
    let index = Math.floor(Math.random() * neighbours.length);
    return neighbours[index];
  }

  private getNeighbours(animal: Animal) {
    let neighbours: [number,number][] = [];
    neighbours.push([(animal.xCoordinate + 1 + this.rowSize) % this.rowSize, animal.yCoordinate])
    neighbours.push([(animal.xCoordinate - 1 + this.rowSize) % this.rowSize, animal.yCoordinate])
    neighbours.push([animal.xCoordinate, (animal.yCoordinate - 1 + this.colSize) % this.colSize])
    neighbours.push([animal.xCoordinate, (animal.yCoordinate + this.colSize + 1) % this.colSize])
    return neighbours
  }




  public getColor(animal:number): any {
    if (animal == 1) {
      return {
        "background-color": "yellow"
      }
    }
    return {
      "background-color": "red"
    }
  }

  public start() {
    this.intervalId = window.setInterval(() => {
    this.tick();
    },100);
    this.isRunning = true;
  }

  public stop() {
    window.clearInterval(this.intervalId);
    this.isRunning = false;
  }
}
