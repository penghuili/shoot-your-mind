import {
    AfterViewInit,
    Component, 
    ElementRef,
    EventEmitter,
    Input, 
    OnInit, 
    Output, 
    ViewChild 
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { EventAndIdea } from '../shared/event-and-idea';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';
import { Position } from '../shared/position';
import { UtilsService } from '../shared/utils.service';
import {
    INIT_POSITION,
    INIT_IDEA,
    INIT_LINE
} from '../shared/init-data';

@Component({
    selector: "sym-mind-map",
    templateUrl: "./mind-map.component.html",
    styleUrls: ["./mind-map.component.css"]
})
export class MindMapComponent implements OnInit {
    private mousedownPosition: Position;
    private startIdea: Idea;
    private stopIdea: Idea;

    private isMovingIdea: boolean = false;
    private isAddingNewLine: boolean = false;
    private isDeletingLine: boolean = false;

    private containerLeft: number;
    private containerTop: number;

    private mousedownOnIdea$: Subject<EventAndIdea> = new Subject();
    private mousemoveOnContainer$: Subject<MouseEvent> = new Subject();
    private mouseupOnIdea$: Subject<EventAndIdea> = new Subject();
    private mousedownOnCanvas$: Subject<MouseEvent> = new Subject();
    private mouseupOnCanvas$: Subject<MouseEvent> = new Subject();

    isAddingNewIdea = false;
    newIdeaPosition: Position;

    @ViewChild("mapWrapper") mapWrapper: ElementRef;
    canvasWidth: number;
    canvasHeight: number;

    @Input() ideas: Idea[];
    @Input() lines: Line[];
    @Input() isMindDeleted: boolean;
    @Output() lineCreated = new EventEmitter<Line>();
    @Output() lineMoving = new EventEmitter<Line>();
    @Output() movingLineDeleted = new EventEmitter<Line>();
    @Output() linesDeleted = new EventEmitter<Line[]>();
    @Output() ideaMoving = new EventEmitter<Idea>();
    @Output() ideaUpdated = new EventEmitter<Idea>();
    @Output() ideaCreated = new EventEmitter<Idea>();
    @Output() ideaDeleted = new EventEmitter<Idea>();
    @Output() ideaSelected = new EventEmitter<Idea>();
    @Output() centerAdded = new EventEmitter<Idea>();

    constructor(private utils: UtilsService) {}

    ngOnInit() {
        this.initState();

        this.mousedownOnIdea$.subscribe((ei: EventAndIdea) => {
            this.recordMousedownState(ei);
        });
        this.mousedownOnIdea$
            .switchMap(() => 
                this.mousemoveOnContainer$.takeUntil(this.mouseupOnIdea$))
            .subscribe((e: MouseEvent) => {
                if(e.button === 0) {
                    this.isMovingIdea = true;
                    this.moveIdea(e);
                } else if(e.button === 2) {
                    this.isAddingNewLine = true;
                    this.drawMovingLine(e);
                }   
        });
        this.mouseupOnIdea$.subscribe((ei: EventAndIdea) => {              
            if(ei.event.button === 0) {
                if(this.isMovingIdea) {
                    this.onIdeaUpdated(ei.idea);
                } else {
                    this.selectIdea();
                }
            } else if(ei.event.button === 2) {
                if(this.isAddingNewLine) {
                    this.createLine(ei);
                }
            }
        });

        this.mousedownOnCanvas$.subscribe(e => {
            this.startIdea = Object.assign(
                {}, 
                INIT_IDEA, 
                {
                    centerX: e.pageX - this.containerLeft,
                    centerY: e.pageY - this.containerTop
                }
            );
        });
        this.mousedownOnCanvas$
            .switchMap(() => this.mousemoveOnContainer$.takeUntil(this.mouseupOnCanvas$))
            .subscribe(e => {
                if(e.button === 0) {
                    this.isDeletingLine = true;
                    this.drawMovingLine(e);
                }
        });
        this.mouseupOnCanvas$.subscribe(e => {
            if(e.button === 0) {
                if(this.isDeletingLine) {
                    this.deleteLine();
                } else if(this.isAddingNewIdea) {
                    this.isAddingNewIdea = false;
                } else {
                    this.createIdea(e);
                }
            } else if(e.button === 2) {
                if(this.isAddingNewLine) {
                    this.clearFailedMovingLine(e);
                }
            }
        });
    }
    
    onMousedownOnIdea(e: MouseEvent, idea: Idea) {
        e.stopPropagation();
        let data: EventAndIdea = {
            event: e,
            idea: idea
        };
        this.mousedownOnIdea$.next(data);
    }
    onMousemoveOnContainer(e: MouseEvent) {
        this.mousemoveOnContainer$.next(e);
    }
    onMouseupOnIdea(e: MouseEvent, idea: Idea) {
        e.stopPropagation();
        let data = {event: e, idea: idea};
        this.mouseupOnIdea$.next(data);
    }
    onMousedownOnCanvas(e: MouseEvent) {
        e.stopPropagation();
        this.mousedownOnCanvas$.next(e);
    }
    onMouseupOnCanvas(e: MouseEvent) {
        e.stopPropagation();
        this.mouseupOnCanvas$.next(e);
    }
    onContextmenu(e: MouseEvent) {
        e.preventDefault();
    }

    onNewIdea(idea: Idea) {
        let centerX = this.newIdeaPosition.left + idea.centerX / 2;
        let centerY = this.newIdeaPosition.top + idea.centerY / 2;
        let newIdea = Object.assign(
            {}, 
            idea, 
            this.newIdeaPosition,
            {centerX: centerX, centerY: centerY}
        );
        this.ideaCreated.next(newIdea);
        this.initHelpData();
    }
    onIdeaDeleted(idea: Idea) {
        this.ideaDeleted.next(idea);
        this.initHelpData();
    }
    onIdeaUpdated(idea: Idea) {
        this.ideaUpdated.next(idea);
        this.initHelpData();
    }
    onCenterAdded(idea: Idea) {
        this.centerAdded.next(idea);
    }

    private initState() {
        Observable.fromEvent(document, 'keyup')
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 27;
            }).subscribe((e: KeyboardEvent) => {
                this.isAddingNewIdea = false;
            });
        this.canvasWidth = window.innerWidth * 0.95;
        this.canvasHeight = window.innerHeight * 0.85;
        this.containerLeft = this.getContainerPosition(this.mapWrapper.nativeElement, "offsetLeft");
        this.containerTop = this.getContainerPosition(this.mapWrapper.nativeElement, "offsetTop");
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
        let idea = {
            id: this.startIdea.id,
            text: this.startIdea.text,
            left: left, 
            top: top
        };
        this.ideaMoving.next(idea);
    }

    private createIdea(e: MouseEvent) {
        this.newIdeaPosition = {
            left: e.pageX - this.containerLeft,
            top: e.pageY - this.containerTop
        };
        this.isAddingNewIdea = true;
    }

    private selectIdea() {
        this.ideaSelected.next(this.startIdea);
    }

    private drawMovingLine(e: MouseEvent){
        this.stopIdea = Object.assign({}, INIT_IDEA, 
            {
                centerX: e.pageX - this.containerLeft,
                centerY: e.pageY - this.containerTop
            }
        );
        let line = {
            id: "addMovingLine",
            ideaA: Object.assign({}, this.startIdea),
            ideaB: Object.assign({}, this.stopIdea)
        };
        this.lineMoving.next(line);
    }



    private createLine(ei: EventAndIdea) {
        this.stopIdea = Object.assign({}, ei.idea);
        if(this.stopIdea.id === "createNewLineFailed") {
            this.movingLineDeleted.next(INIT_LINE);
        } else {
            let newLine = {
                id: "line" + new Date().getTime(),
                ideaA: Object.assign({}, this.startIdea),
                ideaB: Object.assign({}, this.stopIdea)
            };
            let isRepeated = this.lines.filter(line => {
                return (line.ideaA.id === newLine.ideaA.id && line.ideaB.id === newLine.ideaB.id) || 
                    (line.ideaA.id === newLine.ideaB.id && line.ideaB.id === newLine.ideaA.id);
            }).length > 0;
            if(isRepeated) {
                this.movingLineDeleted.next(INIT_LINE);
            } else {
                this.lineCreated.next(newLine);
            }
        }
        this.initHelpData();
    }

    private clearFailedMovingLine(e: MouseEvent) {
        this.mouseupOnIdea$.next({
            event: e, 
            idea: Object.assign({}, INIT_IDEA, {id: "createNewLineFailed"})
        });
    }

    private deleteLine() {
        let toolLine: Line = {
            id: "",
            ideaA: this.startIdea,
            ideaB: this.stopIdea
        };
        let crossedLines = this.lines.filter(line => {
            return this.isCrossed(toolLine, line);
        });
        if(crossedLines.length > 0) {
            this.linesDeleted.next(crossedLines);
        }
        this.movingLineDeleted.next(INIT_LINE);
        this.initHelpData();
    }

    private isCrossed(line1: Line, line2: Line) {
        let l1x1 = line1.ideaA.centerX;
        let l1y1 = line1.ideaA.centerY;
        let l1x2 = line1.ideaB.centerX;
        let l1y2 = line1.ideaB.centerY;
        let l2x1 = line2.ideaA.centerX;
        let l2y1 = line2.ideaA.centerY;
        let l2x2 = line2.ideaB.centerX;
        let l2y2 = line2.ideaB.centerY;
        let line1CrossLine2: boolean = 
            this.lineFunctionFromMath(line2, l1x1, l1y1) *
            this.lineFunctionFromMath(line2, l1x2, l1y2) < 0;
        let line2CrossLine1: boolean = 
            this.lineFunctionFromMath(line1, l2x1, l2y1) *
            this.lineFunctionFromMath(line1, l2x2, l2y2) < 0;
        return line1CrossLine2 && line2CrossLine1;
    }

    private lineFunctionFromMath(line: Line, x: number, y: number) {
        return (y - line.ideaB.centerY) * (line.ideaA.centerX - line.ideaB.centerX) - 
            (x - line.ideaB.centerX) * (line.ideaA.centerY - line.ideaB.centerY);
    }

    private initHelpData() {
        this.mousedownPosition = Object.assign({}, INIT_POSITION);
        this.startIdea = Object.assign({}, INIT_IDEA);
        this.stopIdea = Object.assign({}, INIT_IDEA);
        this.newIdeaPosition = Object.assign({}, INIT_POSITION);
        this.isAddingNewIdea = false;
        this.isMovingIdea = false;
        this.isAddingNewLine = false;
        this.isDeletingLine = false;
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