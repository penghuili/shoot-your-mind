import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';

import { Position } from '../shared/position';
import { Idea } from '../shared/idea';
import { IDEAS } from '../shared/ideas.mock';
import { EventAndIdea } from '../shared/event-and-idea';

@Component({
    selector: "sym-minds-content",
    templateUrl: "./minds-content.component.html",
    styleUrls: ["./minds-content.component.css"]
})
export class MindsContentComponent implements OnInit {
    mousedownPosition: Position = {left: 0, top: 0};
    tmpPosition: Position = {left: 0, top: 0};
    tmpIdea: Idea;
    mouseupPosition: Position = {left: 50, top: 10};
    leftMousedownOnIdea$: Subject<EventAndIdea> = new Subject();
    leftMousemoveOnContainer$: Subject<Position> = new Subject();
    leftMouseupOnContainer$: Subject<MouseEvent> = new Subject();
    ideas: Idea[];

    ngOnInit() {
        this.ideas = IDEAS;
        this.leftMousedownOnIdea$.subscribe((ei: EventAndIdea) => {
            this.tmpPosition = {left: ei.idea.left, top: ei.idea.top};
            this.tmpIdea = Object.assign({}, ei.idea);
            this.mousedownPosition = {
                left: ei.event.clientX,
                top: ei.event.clientY
            };
        });
        this.leftMouseupOnContainer$.subscribe((e: MouseEvent) => {
            this.mouseupPosition = {left: this.tmpIdea.left, top: this.tmpIdea.top};
        });
        this.leftMousedownOnIdea$
            .switchMap((ei: EventAndIdea) => 
                this.leftMousemoveOnContainer$.takeUntil(this.leftMouseupOnContainer$))
            .startWith(this.mousedownPosition)
            .subscribe((p: Position) => {
                let left = this.tmpPosition.left + p.left - this.mousedownPosition.left;
                let top = this.tmpPosition.top + p.top - this.mousedownPosition.top;
                this.tmpIdea = Object.assign({}, this.tmpIdea, {left: left, top: top});
                this.ideas = this.ideas.map(idea => {
                    if(idea.id === this.tmpIdea.id) {
                        return Object.assign({}, this.tmpIdea);
                    } else {
                        return idea;
                    }
                });
            });
    }
    
    onMousedown(e: MouseEvent, idea: Idea) {
        let data: EventAndIdea = {
            event: e,
            idea: idea
        };
        this.leftMousedownOnIdea$.next(data);
    }
    onMousemove(e: MouseEvent) {
        let position = {left: e.clientX, top: e.clientY};
        this.leftMousemoveOnContainer$.next(position);
    }
    onMouseup(e: MouseEvent) {
        this.leftMouseupOnContainer$.next(e);
    }
}