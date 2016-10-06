import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../shared/reducers';
import { IdeasLinesService } from '../shared/ideas-lines.service';
import { UtilsService } from '../shared/utils.service';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';

@Component({
    selector: "sym-minds",
    templateUrl: "./minds.component.html"
})
export class MindsComponent implements OnInit{
    ideas: Observable<Idea[]>;
    lines: Observable<Line[]>;

    private routeSub: any;
    private docId: string;

    constructor(
        private ideasLinesService: IdeasLinesService,
        private utils: UtilsService,
        private route: ActivatedRoute,
        private store: Store<AppStore>
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.docId = params["docId"];
        });
        this.ideas = this.store.select("ideas");
        this.lines = this.store.select("lines");
        this.ideasLinesService.loadIdeasAndLines(this.docId);
    }

    onLineCreated(line: Line) {
        this.ideasLinesService.addLine(line);
    }

    onLineMoving(line: Line) {
        this.ideasLinesService.addMovingLine(line);
    }

    onMovingLineDeleted(line: Line) {
        this.ideasLinesService.deleteMovingLine(line);
    }

    onLinesDeleted(lines: Line[]) {
        this.ideasLinesService.deleteLines(lines);
    }

    onIdeaMoving(idea: Idea) {
        this.ideasLinesService.moveIdea(idea);
    }

    onIdeaUpdated(idea: Idea) {
        this.ideasLinesService.updateIdea(idea);
    } 

    onIdeaDeleted(idea: Idea) {
        this.ideasLinesService.deleteIdea(idea);
    }

    onIdeaCreated(idea: Idea) {
        this.ideasLinesService.addIdea(idea);
    }

    onIdeaSelected(idea: Idea) {
        this.ideasLinesService.selectIdea(idea);
    }

    onCenterAdded(idea: Idea) {
        this.ideasLinesService.addIdeaCenter(idea);
    }
}