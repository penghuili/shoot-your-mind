import { 
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, 
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
  } from '@angular/core';

import { Line } from '../shared/line';

@Component({
  selector: 'sym-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements AfterViewInit, OnChanges {
  @Input() canvasArr: any[];
  @Input() lines: Line[];
  @Output() canvasOffsetReady = new EventEmitter();
  @ViewChild("canvas") canvas: ElementRef;
  ctx: CanvasRenderingContext2D;


  ngAfterViewInit() {
    let node = this.canvas.nativeElement.querySelector("canvas");
    let canvasOffsetLeft = this.getContainerPosition(node, "offsetLeft");
    let canvasOffsetTop = this.getContainerPosition(node, "offsetTop");
    this.canvasOffsetReady.next({canvasOffsetLeft, canvasOffsetTop});
    this.drawLines();
  }

  ngOnChanges() {
    this.drawLines();
  }

  private drawLine(x1: number, y1: number, x2: number, y2:number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  private drawLines() {
    let node = this.canvas.nativeElement;
    if(node.children.length > 0) {
      this.ctx = node.firstElementChild.getContext("2d");
      this.ctx.clearRect(0, 0, this.canvasArr[0].canvasWidth, this.canvasArr[0].canvasHeight);

      this.lines.forEach(line => {
        this.drawLine(
          line.ideaA.centerX,
          line.ideaA.centerY,
          line.ideaB.centerX,
          line.ideaB.centerY);
      });
    }
  }

  private getContainerPosition(node: any, direction: string, isFirstTime = true) {
        if(!node.offsetParent) {
            if(isFirstTime) {
                return node[direction]
            } else {
                return 0;
            }
        }
        return node[direction] + this.getContainerPosition(node.offsetParent, direction, false);
  }
}
