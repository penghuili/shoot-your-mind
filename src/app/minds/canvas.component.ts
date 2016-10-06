import { 
  ChangeDetectionStrategy,
  Component, 
  ElementRef,
  Input,
  OnChanges,
  ViewChild 
  } from '@angular/core';

import { Line } from '../shared/line';

@Component({
  selector: 'sym-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements OnChanges {
  @Input() lines: Line[];
  @Input() width: number;
  @ViewChild("canvas") canvas: ElementRef;
  ctx: CanvasRenderingContext2D;

  ngOnChanges() {
    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.ctx.clearRect(0, 0, this.width, 600);
    this.drawLines();
  }

  private drawLine(x1: number, y1: number, x2: number, y2:number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  private drawLines() {
    this.lines.forEach(line => {
      this.drawLine(
        line.ideaA.centerX,
        line.ideaA.centerY,
        line.ideaB.centerX,
        line.ideaB.centerY);
    });
  }
}
