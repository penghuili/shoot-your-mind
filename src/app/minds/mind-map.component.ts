import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input, 
    OnInit, 
    Output
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { EventAndIdea } from '../shared/event-and-idea';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';
import { Mind } from '../shared/mind';
import { Position } from '../shared/position';
import {
    INIT_POSITION,
    INIT_IDEA,
    INIT_LINE
} from '../shared/init-data';

@Component({
    selector: "sym-mind-map",
    templateUrl: "./mind-map.component.html",
    styleUrls: ["./mind-map.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MindMapComponent implements OnInit {
    @Input() activeIdeas: Idea[];
    @Input() deletedIdeas: Idea[];
    @Input() lines: Line[];
    @Input() selectedIdeaHistory: Idea[];
    @Input() mind: Mind;
    @Output() lineAdded = new EventEmitter<Line>();
    @Output() lineMoving = new EventEmitter<Line>();
    @Output() movingLineDeleted = new EventEmitter<Line>();
    @Output() linesDeleted = new EventEmitter<Line[]>();
    @Output() ideaMoving = new EventEmitter<Idea>();
    @Output() ideaContentUpdated = new EventEmitter();
    @Output() ideaMetadataUpdated = new EventEmitter<Idea>();
    @Output() ideaAdded = new EventEmitter<Idea>();
    @Output() ideaDeleted = new EventEmitter<Idea>();
    @Output() ideaSelected = new EventEmitter<Idea>();
    @Output() showHistory = new EventEmitter<Idea>();
    @Output() historyIdeaRecover = new EventEmitter();
    @Output() historyIdeaDelete = new EventEmitter<Idea>();
    @Output() deletedIdeaRecover = new EventEmitter<Idea>();
    @Output() deletedIdeaDelete = new EventEmitter<Idea>();

    isAddingNewIdea = false;
    newIdeaPosition: Position;
    isShowHistory: boolean = false;
    canvasWidth: number;
    canvasHeight: number;
    historyListHeight: number;

    private mousedownPosition: Position;
    private startIdea: Idea;
    private stopIdea: Idea;
    private selectedIdea: Idea;

    private isMovingIdea: boolean = false;
    private isAddingNewLine: boolean = false;
    private isDeletingLine: boolean = false;

    private canvasOffsetLeft: number;
    private canvasOffsetTop: number;

    private mousedownOnIdea$: Subject<EventAndIdea> = new Subject();
    private mousemoveOnContainer$: Subject<MouseEvent> = new Subject();
    private mouseupOnIdea$: Subject<EventAndIdea> = new Subject();
    private mousedownOnCanvas$: Subject<MouseEvent> = new Subject();
    private mouseupOnCanvas$: Subject<MouseEvent> = new Subject();

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
                    this.onIdeaMetadataUpdated(ei.idea);
                } else if(this.isShowHistory) {
                    if(this.selectedIdea.id !== this.startIdea.id) {
                        this.isShowHistory = false;
                        this.initHelpData();
                    }
                } else {
                    this.ToggleSelectIdea(this.startIdea, !this.startIdea.isSelected);
                }
            } else if(ei.event.button === 2) {
                if(this.isAddingNewLine) {
                    this.addLine(ei);
                }
            }
        });

        this.mousedownOnCanvas$.subscribe(e => {
            this.startIdea = Object.assign(
                {}, 
                INIT_IDEA, 
                {
                    centerX: e.pageX - this.canvasOffsetLeft,
                    centerY: e.pageY - this.canvasOffsetTop
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
                } else if(this.isShowHistory) {
                    this.ToggleSelectIdea(this.selectedIdea, false);
                    this.isShowHistory = false;
                    this.initHelpData();
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
        let centerX = this.newIdeaPosition.left + idea.width / 2;
        let centerY = this.newIdeaPosition.top + idea.height / 2;
        let newIdea = Object.assign(
            {}, 
            idea, 
            this.newIdeaPosition,
            {centerX: centerX, centerY: centerY}
        );
        this.ideaAdded.next(newIdea);
        this.initHelpData();
    }
    onIdeaDeleted(idea: Idea) {
        this.ideaDeleted.next(idea);
        this.initHelpData();
    }
    onIdeaContentUpdated(data) {
        this.ideaContentUpdated.next(data);
        this.initHelpData();
    }
    onIdeaMetadataUpdated(idea: Idea) {
        this.ideaMetadataUpdated.next(idea);
    }
    onCanvasOffsetReady(e) {
        this.canvasOffsetLeft = e.canvasOffsetLeft;
        this.canvasOffsetTop = e.canvasOffsetTop;
    }
    onShowHistory(idea: Idea) {
        if(this.isShowHistory && idea.id === this.selectedIdea.id) {
            this.isShowHistory = false;
            this.ToggleSelectIdea(idea, false);
            this.initHelpData();
        } else {
            this.showHistory.next(idea);
            this.isShowHistory = true;
            this.selectedIdea = Object.assign({}, idea);
            if(!this.selectedIdea.isSelected) {
                this.ToggleSelectIdea(idea, true);
            }
        }
    }
    onHistoryIdeaRecover(recoverIdea: Idea) {
        let currentIdea = this.activeIdeas.filter(i => {
            return i.id === recoverIdea.id;
        })[0];
        let data = {
            currentIdea: Object.assign({}, currentIdea),
            recoverIdea: Object.assign({}, currentIdea, {
                historyId: recoverIdea.historyId,
                text: recoverIdea.text,
                note: recoverIdea.note,
                backgroundColor: recoverIdea.backgroundColor
            })
        };
        this.historyIdeaRecover.next(data);
    }
    onHistoryIdeaDelete(idea: Idea) {
        this.historyIdeaDelete.next(idea);
    }
    onDeletedIdeaRecover(idea: Idea) {
        this.deletedIdeaRecover.next(idea);
    }
    onDeletedIdeaDelete(idea: Idea) {
        this.deletedIdeaDelete.next(idea);
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
        this.historyListHeight = this.canvasHeight * 0.86;
    }

    private recordMousedownState(ei: EventAndIdea) {
        this.startIdea = Object.assign({}, ei.idea);
        this.mousedownPosition = {
            left: ei.event.pageX,
            top: ei.event.pageY
        };
    }

    private moveIdea(e: MouseEvent) {
        let deltaX = e.pageX - this.mousedownPosition.left;
        let deltaY = e.pageY - this.mousedownPosition.top;
        let left = this.startIdea.left + deltaX;
        let top = this.startIdea.top + deltaY;
        let centerX = this.startIdea.centerX + deltaX;
        let centerY = this.startIdea.centerY + deltaY;
        let idea = Object.assign({}, this.startIdea, { left, top, centerX, centerY });
        this.ideaMoving.next(idea);
    }

    private createIdea(e: MouseEvent) {
        this.newIdeaPosition = {
            left: e.pageX - this.canvasOffsetLeft,
            top: e.pageY - this.canvasOffsetTop
        };
        this.isAddingNewIdea = true;
    }

    private ToggleSelectIdea(idea: Idea, isSelected) {
        let selectedIdea = Object.assign({}, idea, {isSelected: isSelected});
        this.ideaSelected.next(selectedIdea);
    }

    private drawMovingLine(e: MouseEvent){
        this.stopIdea = Object.assign({}, INIT_IDEA, 
            {
                centerX: e.pageX - this.canvasOffsetLeft,
                centerY: e.pageY - this.canvasOffsetTop
            }
        );
        let line = {
            id: "addMovingLine",
            ideaA: Object.assign({}, this.startIdea),
            ideaB: Object.assign({}, this.stopIdea)
        };
        this.lineMoving.next(line);
    }

    private addLine(ei: EventAndIdea) {
        this.stopIdea = Object.assign({}, ei.idea);
        if(this.stopIdea.id === "createNewLineFailed" || 
            this.startIdea.id === this.stopIdea.id) {
            this.movingLineDeleted.next(INIT_LINE);
        } else {
            let newLine = {
                id: "line" + new Date().getTime(),
                ideaAId: this.startIdea.id,
                ideaBId: this.stopIdea.id,
                ideaA: Object.assign({}, this.startIdea),
                ideaB: Object.assign({}, this.stopIdea)
            };
            let isRepeated = this.lines.filter(line => {
                return (line.ideaA.id === this.startIdea.id && line.ideaB.id === this.stopIdea.id) || 
                    (line.ideaA.id === this.stopIdea.id && line.ideaB.id === this.startIdea.id);
            }).length > 0;
            if(isRepeated) {
                this.movingLineDeleted.next(INIT_LINE);
            } else {
                this.lineAdded.next(newLine);
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
}