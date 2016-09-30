import { 
    Component, OnInit, ViewChild, ElementRef,
    Input, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';

import { Position } from '../shared/position';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';
import { EventAndIdea } from '../shared/event-and-idea';
import { UtilsService } from '../shared/utils.service';

@Component({
    selector: "sym-minds-content",
    templateUrl: "./minds-content.component.html",
    styleUrls: ["./minds-content.component.css"]
})
export class MindsContentComponent implements OnInit {
    private mousedownPosition: Position = {left: 0, top: 0};
    private startIdea: Idea = {id: "", text: "", left: 0, top: 0};
    private movingIdea: Idea;
    private stopIdea: Idea = {id: "", text: "", left: 0, top: 0};
    private containerLeft: number;
    private containerTop: number;
    private mousedownOnIdea$: Subject<EventAndIdea> = new Subject();
    private mousemoveOnContainer$: Subject<MouseEvent> = new Subject();
    private mouseupOnIdea$: Subject<EventAndIdea> = new Subject();
    private mouseupOnContainer$: Subject<MouseEvent> = new Subject();

    private addingNewIdea = false;
    newIdeaPosition: Position;

    @ViewChild("container") container: ElementRef;
    @ViewChild("canvas") canvas: ElementRef;
    ctx: CanvasRenderingContext2D;
    @Input() ideas: Idea[];
    @Input() lines: Line[];
    @Output() newLineCreated = new EventEmitter<Line>();
    @Output() ideaMoved = new EventEmitter<Idea>();
    @Output() newIdeaCreated = new EventEmitter<Idea>();

    constructor(private utils: UtilsService) {}

    ngOnInit() {
        this.initCanvas();

        this.mousedownOnIdea$.subscribe((ei: EventAndIdea) => {
            this.recordMousedownState(ei);
        });
        this.mousedownOnIdea$
            .switchMap((ei: EventAndIdea) => 
                this.mousemoveOnContainer$.takeUntil(this.mouseupOnIdea$))
            .subscribe((e: MouseEvent) => {
                if(e.button === 0) {
                    this.moveIdea(e);
                } else if(e.button === 2) {
                    this.drawMovingLine(e);
                }   
        });
        this.mouseupOnIdea$.subscribe((ei: EventAndIdea) => {
            if((<HTMLElement>ei.event.target).nodeName !== "CANVAS") {                
                if(ei.event.button === 2) {
                    this.updateLines(ei);
                } else if(ei.event.button === 0) {
                    this.ideaMoved.next(ei.idea);
                }
            }
        });
    }
    
    onMousedown(e: MouseEvent, idea: Idea) {
        e.stopPropagation();
        let data: EventAndIdea = {
            event: e,
            idea: idea
        };
        this.mousedownOnIdea$.next(data);
    }
    onMousemove(e: MouseEvent) {
        this.mousemoveOnContainer$.next(e);
    }
    onMouseup(e: MouseEvent, idea: Idea) {
        // e.stopPropagation();
        let data = {event: e, idea: idea};
        this.mouseupOnIdea$.next(data);
    }
    onMouseupOnContainer(e: MouseEvent) {
        if((<HTMLElement>e.target).nodeName === "CANVAS") {
            this.ctx.clearRect(0, 0, 480, 600);
            this.drawLines();
            this.mousemoveOnContainer$.next(e);
        }
    }
    onContextmenu(e: MouseEvent) {
        e.preventDefault();
    }

    onMouseupOnCanvas(e: MouseEvent) {
        e.stopPropagation();
        if(e.button === 0) {
            if(this.addingNewIdea === true) {
                this.addingNewIdea = false;
            } else {
                this.newIdeaPosition = {
                    left: e.pageX - this.containerLeft - 25,
                    top: e.pageY - this.containerTop -25
                };
                this.addingNewIdea = true;
            }
        } else if(e.button === 2) {
            this.mousedownOnIdea$.next({
                event: e, 
                idea: {
                    id: "",
                    text: "",
                    left: 0,
                    top: 0
                } 
            });
        }
    }

    onNewIdea(idea: Idea) {
        let centerX = this.newIdeaPosition.left + 25 + idea.centerX / 2;
        let centerY = this.newIdeaPosition.top + 25 + idea.centerY / 2;
        let newIdea = Object.assign(
            {}, 
            idea, 
            this.newIdeaPosition,
            {centerX: centerX, centerY: centerY}
        );
        this.newIdeaCreated.next(newIdea);
        this.addingNewIdea = false;
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

    private initCanvas() {
        Observable.fromEvent(document, 'keyup')
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 27;
            }).subscribe((e: KeyboardEvent) => {
                this.addingNewIdea = false;
            });
        this.ctx = this.canvas.nativeElement.getContext("2d");
        this.containerLeft = this.getContainerPosition(this.container.nativeElement, "offsetLeft");
        this.containerTop = this.getContainerPosition(this.container.nativeElement, "offsetTop");
        this.ctx.clearRect(0, 0, 480, 600);
        this.drawLines();
    }

    private recordMousedownState(ei: EventAndIdea) {
        this.startIdea = Object.assign({}, ei.idea);
        this.mousedownPosition = {
            left: ei.event.pageX,
            top: ei.event.pageY
        };
    }

    private moveIdea(e: MouseEvent) {
        let left = this.startIdea.left + e.pageX - this.mousedownPosition.left;
        let top = this.startIdea.top + e.pageY - this.mousedownPosition.top;
        this.ideas = this.ideas.map(idea => {
            if(idea.id === this.startIdea.id) {
                return Object.assign({}, idea, {left: left, top: top});
            } else {
                return idea;
            }
        });
        this.lines = this.lines.map(line => {
            let ideaA = this.getIdea(this.ideas, line.ideaA);
            let ideaB = this.getIdea(this.ideas, line.ideaB);
            return {
                ideaA: Object.assign({}, ideaA),
                ideaB: Object.assign({}, ideaB)
            }
        });
        this.ctx.clearRect(0, 0, 480, 600);
        this.drawLines();
    }

    private drawMovingLine(e: MouseEvent){
        this.ctx.clearRect(0, 0, 480, 600);
        this.drawLine(
            this.startIdea.centerX, 
            this.startIdea.centerY, 
            e.pageX - this.containerLeft - 9, 
            e.pageY - this.containerTop);
        this.drawLines();
    }

    private updateLines(ei: EventAndIdea) {
        this.stopIdea = Object.assign({}, ei.idea);
        let newLine = {
            ideaA: Object.assign({}, this.startIdea),
            ideaB: Object.assign({}, this.stopIdea)
        };
        this.lines = [...this.lines, newLine];
        this.ctx.clearRect(0, 0, 480, 600);
        this.drawLines();
        this.newLineCreated.next(newLine);
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

    private getIdea(ideas: Idea[], idea: Idea) {
        return ideas.filter(i => {
            return i.id === idea.id;
        })[0];
    }
}