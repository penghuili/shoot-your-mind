import { 
    Component, 
    OnInit,
    OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../shared/reducers';
import { IdeasLinesService } from '../shared/ideas-lines.service';
import { Idea } from '../shared/idea';
import { Line } from '../shared/line';

@Component({
    selector: "sym-minds",
    templateUrl: "./minds.component.html",
    styleUrls: ["./minds.component.css"]
})
export class MindsComponent implements OnInit, OnDestroy {
    ideas: Observable<Idea[]>;
    lines: Observable<Line[]>;
    isMindDeleted: boolean;
    linesWithIdea: Line[];

    private routeSub: any;
    private linesSub: any;
    private ideasSub: any;
    private mindId: string;
    private linesWithoutIdea: Line[];

    constructor(
        private ideasLinesService: IdeasLinesService,
        private route: ActivatedRoute,
        private store: Store<AppStore>
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.mindId = params["mindId"];
        });
        this.ideas = this.store.select("ideas");
        this.lines = this.store.select("lines");
        this.linesSub = this.lines.subscribe(ls => {
            this.linesWithoutIdea = ls;
        });
        this.ideasSub = this.ideas.subscribe(is => {
            this.linesWithIdea = this.linesWithoutIdea.map(l => {
                
            });
        });
        this.isMindDeleted = this.ideasLinesService.loadIdeasAndLines(this.mindId);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }

    onLineCreated(line: Line) {
        this.ideasLinesService.addLine(line, this.mindId);
    }

    onLineMoving(line: Line) {
        this.ideasLinesService.addMovingLine(line);
    }

    onMovingLineDeleted(line: Line) {
        this.ideasLinesService.deleteMovingLine(line);
    }

    onLinesDeleted(lines: Line[]) {
        this.ideasLinesService.deleteLines(lines, this.mindId);
    }

    onIdeaMoving(idea: Idea) {
        this.ideasLinesService.moveIdea(idea);
    }

    onIdeaUpdated(idea: Idea) {
        this.ideasLinesService.updateIdea(idea, this.mindId);
    } 

    onIdeaDeleted(idea: Idea) {
        this.ideasLinesService.deleteIdea(idea, this.mindId);
    }

    onIdeaCreated(idea: Idea) {
        this.ideasLinesService.addIdea(idea, this.mindId);
    }

    onIdeaSelected(idea: Idea) {
        this.ideasLinesService.selectIdea(idea, this.mindId);
    }

    onCenterAdded(idea: Idea) {
        this.ideasLinesService.addIdeaCenter(idea);
    }
}