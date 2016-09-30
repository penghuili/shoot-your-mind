import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
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

    constructor(
        private ideasLinesService: IdeasLinesService,
        private utils: UtilsService,
        private store: Store<AppStore>
    ) {}

    ngOnInit() {
        this.ideas = this.store.select("ideas");
        this.lines = this.store.select("lines");
        this.ideasLinesService.loadIdeas();
        this.ideasLinesService.loadLines();
    }

    onNewLineCreated(line: Line) {
        this.ideasLinesService.addLine(line);
    }

    onIdeaMoved(idea: Idea) {
        this.ideasLinesService.updateIdea(idea);
    } 

    onNewIdeaCreated(idea: Idea) {
        this.ideasLinesService.addIdea(idea);
    }
}