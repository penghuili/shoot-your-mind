import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';

import { Position } from '../shared/position';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';
import { IDEAS } from '../shared/ideas.mock';
import { LINES } from '../shared/lines.mock';
import { EventAndIdea } from '../shared/event-and-idea';

@Component({
    selector: "sym-minds-content",
    templateUrl: "./minds-content.component.html",
    styleUrls: ["./minds-content.component.css"]
})
export class MindsContentComponent implements OnInit {
    mousedownPosition: Position = {left: 0, top: 0};
    startIdea: Idea = {id: "", text: "", left: 0, top: 0};
    movingIdea: Idea;
    stopIdea: Idea = {id: "", text: "", left: 0, top: 0};
    containerLeft: number;
    containerTop: number;
    isRightClick: boolean = false;
    leftMousedownOnIdea$: Subject<EventAndIdea> = new Subject();
    leftMousemoveOnContainer$: Subject<MouseEvent> = new Subject();
    leftMouseupOnContainer$: Subject<EventAndIdea> = new Subject();
    @ViewChild("canvas") canvas: ElementRef;
    @ViewChild("container") container: ElementRef;
    ideas: Idea[];
    lines: Line[] = [];

    ngOnInit() {
        this.ideas = IDEAS;
        this.containerLeft = this.getContainerPosition(this.container.nativeElement, "offsetLeft");
        this.containerTop = this.getContainerPosition(this.container.nativeElement, "offsetTop");
        this.leftMousedownOnIdea$.subscribe((ei: EventAndIdea) => {
            if(ei.event.button === 2) {
                this.isRightClick = true;
            }
            this.startIdea = Object.assign({}, ei.idea);
            this.mousedownPosition = {
                left: ei.event.pageX,
                top: ei.event.pageY
            };
        });
        this.leftMouseupOnContainer$.subscribe((ei: EventAndIdea) => {
            if(this.isRightClick) {
                this.stopIdea = Object.assign({}, ei.idea);
                let newLine = {
                    ideaA: Object.assign({}, this.startIdea),
                    ideaB: Object.assign({}, this.stopIdea)
                };
                this.lines = [...this.lines, newLine];
                this.drawLines(this.lines);
                this.isRightClick = false;
            }
            
        });
        this.leftMousedownOnIdea$
            .switchMap((ei: EventAndIdea) => 
                this.leftMousemoveOnContainer$.takeUntil(this.leftMouseupOnContainer$))
            .subscribe((e: MouseEvent) => {
                let deltaX = e.pageX - this.mousedownPosition.left;
                let deltaY = e.pageY - this.mousedownPosition.top;
                let left = this.startIdea.left + deltaX;
                let top = this.startIdea.top + deltaY;
                if(e.button === 0) {
                    this.ideas = this.ideas.map(idea => {
                        if(idea.id === this.startIdea.id) {
                            return Object.assign({}, idea, {left: left, top: top});
                        } else {
                            return idea;
                        }
                    });
                } else if(e.button === 2) {
                    this.drawLine(this.startIdea.centerX, this.startIdea.centerY, 
                        e.pageX - this.containerLeft - 9, e.pageY - this.containerTop);
                }
                
            });
    }
    
    onMousedown(e: MouseEvent, idea: Idea) {
        e.preventDefault();
        let data: EventAndIdea = {
            event: e,
            idea: idea
        };
        this.leftMousedownOnIdea$.next(data);
    }
    onMousemove(e: MouseEvent) {
        this.leftMousemoveOnContainer$.next(e);
    }
    onMouseup(e: MouseEvent, idea: Idea) {
        let data = {event: e, idea: idea};
        this.leftMouseupOnContainer$.next(data);
    }
    onContextmenu(e: MouseEvent) {
        e.preventDefault();
    }

    onAddWidthAndHeight(e: Idea) {
        this.ideas = this.ideas.map(idea => {
            if(idea.id === e.id) {
                return Object.assign({}, e);
            } else{
                return idea;
            }
        });
    }

    private drawLine(x1: number, y1: number, x2: number, y2:number) {
        let ctx = this.canvas.nativeElement.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    private drawLines(lines: Line[]) {
        let linesClone = lines.slice();
        let ctx = this.canvas.nativeElement.getContext("2d");
        ctx.clearRect(0, 0, 480, 600);
        linesClone.forEach(line => {
            this.drawLine(
                line.ideaA.centerX,
                line.ideaA.centerY,
                line.ideaB.centerX,
                line.ideaB.centerY);
        });
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