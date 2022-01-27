import { Component, OnInit } from '@angular/core';
import { Animal } from '../models/animal';
import { Fish } from '../models/fish';

import { Shark } from '../models/shark';

declare var $:any;
import * as shape from 'd3-shape'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  data: any[] = [];
  change: any[] = [];
  view: any[] = [700, 300];
  title: string = "Animals";
  xaxis = "Time";
  yaxis = "Amount"
  yaxisChange = "Change";
  curve = shape.curveBasis;

  public rowSize = 40; //30
  public colSize = 40; //30
  public gird: number[][] | undefined;
  public animals: Animal[] = [];
  public ready:boolean = false;
  public timeToBreed = 8;
  public timeToDeath = 5;
  public defaultFish = 300;
  public defaultSharks = 20;
  public isRunning = false;
  private intervalId!: number;
  public counter:number = 0;
  public lastCyleFish = this.defaultFish;
  public lastCyleShark = this.defaultSharks;

  constructor() {
   }

  ngOnInit(): void {
    this.gird = new Array(this.rowSize).fill(0).map(() => new Array(this.colSize).fill(0));

  }

  public initialiseData() {
    this.defaultFish =Number((<HTMLInputElement>document.getElementById('fishNumber')).value);
    this.defaultSharks =Number((<HTMLInputElement>document.getElementById('sharkNumber')).value);
    this.timeToDeath =Number((<HTMLInputElement>document.getElementById('deathNumber')).value);
    this.timeToBreed =Number((<HTMLInputElement>document.getElementById('repodNumber')).value);
    this.lastCyleFish = this.defaultFish;
    this.lastCyleShark = this.defaultSharks;
    this.counter = 0;
    this.data = [];
    this.change = [];
    this.gird = new Array(this.rowSize).fill(0).map(() => new Array(this.colSize).fill(0));
    this.animals = [];
    this.generateSharks(this.defaultSharks); //20
    this.generateFish(this.defaultFish); //200
    this.draw();
    this.data.push({
      "name": "Shark",
      "series": [
        {
          "name": "0",
          "value": this.defaultSharks
        }
      ]
    });
    this.data.push({
      "name": "Fish",
      "series": [
        {
          "name": "0",
          "value": this.defaultFish
        }
      ]
    });
    this.change.push({
      "name": "Shark",
      "series": [
        {
          "name": "0",
          "value": "0"
        }
      ]
    });
    this.change.push({
      "name": "Fish",
      "series": [
        {
          "name": "0",
          "value": "0"
        }
      ]
    });

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
    var currentFish = this.animals.filter(x => x.idetifier == 2).length;
    var currentShark = this.animals.filter(x => x.idetifier == 1).length;
    this.data[0].series.push({
      "name": this.counter,
      "value": currentFish
    });
    this.data[1].series.push({
      "name": this.counter,
      "value": currentShark
    });

    this.change[0].series.push({
      "name": this.counter,
      "value": currentFish - this.lastCyleFish
    });
    this.change[1].series.push({
      "name": this.counter,
      "value": currentShark - this.lastCyleShark
    });
    this.lastCyleFish = currentFish;
    this.lastCyleShark = currentShark;
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
    let updateed = this.data;
    this.data = [...updateed];
    let upchange = this.change;
    this.change = [...upchange];
    this.animals = this.animals.filter(a => a != null && a != undefined);
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
      console.log("Fish moving");
      if (fish.ciclesToBreed < this.timeToBreed) {
        fish.ciclesToBreed++;
      } else {
        console.log("Fish breeding");
        fish.ciclesToBreed = 0;
        this.animals.push(new Fish(fish.xCoordinate,fish.yCoordinate,0));
      }
      fish.xCoordinate = nextField[0];
      fish.yCoordinate = nextField[1];
    } else {
      console.log("Fish waiting");
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
        console.log("Shark killing");
        shark.ciclesToDeath = 0;
        let killed = this.animals.filter(x => x.xCoordinate == nextfield[0] && x.yCoordinate == nextfield[1])[0]
        let killedIndex = this.animals.indexOf(killed);
        delete this.animals[killedIndex]; //this.animals.splice(killedIndex,1);
      } else {
        if ( shark.ciclesToDeath < this.timeToDeath) {
          console.log("Shark moving");
          shark.ciclesToDeath++;
        } else {
          console.log("Shark starving");
           delete this.animals[index]; // this.animals.splice(index,1);
          return
        }
      }
      if ( shark.ciclesToBreed < this.timeToBreed ) {
        shark.ciclesToBreed++;
      } else {
        shark.ciclesToBreed = 0;
        console.log("Shark breeding");
        this.animals?.push( new Shark(shark.xCoordinate,shark.yCoordinate,0,0));
      }
      shark.xCoordinate = nextfield[0];
      shark.yCoordinate = nextfield[1];
    } else {
      if ( shark.ciclesToDeath < this.timeToDeath) {
        console.log("Shark waiting");
        shark.ciclesToDeath++;
      } else {
        console.log("Shark starving");
        delete this.animals[index];// this.animals.splice(index,1);
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
    this.initialiseData();
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
