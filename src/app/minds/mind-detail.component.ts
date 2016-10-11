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
import { Mind } from '../shared/mind';

@Component({
    selector: "sym-minds",
    templateUrl: "./mind-detail.component.html",
    styleUrls: ["./mind-detail.component.css"]
})
export class MindDetailComponent implements OnInit, OnDestroy {
    ideas: Observable<Idea[]>;
    lines: Observable<Line[]>;
    selectedIdeaHistory: Observable<Idea[]>;
    activeIdeas: Idea[];
    deletedIdeas: Idea[];
    mind: Mind;

    private routeSub: any;
    private ideasSub: any;
    private mindId: string;

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
        this.selectedIdeaHistory = this.store.select("selectedIdeaHistory");
        this.mind = this.ideasLinesService.loadIdeasAndLines(this.mindId);
        this.ideasSub = this.ideas.subscribe(ideas => {
            this.activeIdeas = ideas.filter(idea => {
                return !idea.isDeleted;
            });
            this.deletedIdeas = ideas.filter(idea => {
                return idea.isDeleted;
            });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.ideasSub.unsubscribe();
    }


    onLineAdded(line: Line) {
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

    onIdeaContentUpdated(data) {
        this.ideasLinesService.addUpdatedIdeaToHistory(data, this.mindId);
    } 

    onIdeaDeleted(idea: Idea) {
        this.ideasLinesService.deleteIdea(idea, this.mindId);
    }

    onIdeaAdded(idea: Idea) {
        this.ideasLinesService.addIdea(idea, this.mindId);
    }

    onIdeaMetadataUpdated(idea: Idea) {
        this.ideasLinesService.updateTheLatestIdeaInHistory(idea, this.mindId);
    }

    onIdeaSelected(idea: Idea) {
        this.ideasLinesService.selectIdea(idea, this.mindId);
    }

    onShowHistory(idea: Idea) {
        this.ideasLinesService.loadSelectedIdeaHistory(idea, this.mindId);
    }

    onHistoryIdeaRecover(data) {
        this.ideasLinesService.recoverHistoryIdea(data, this.mindId);
    }

    onHistoryIdeaDelete(idea: Idea) {
        this.ideasLinesService.deleteHistoryIdea(idea, this.mindId);
    }

    onDeletedIdeaRecover(idea: Idea) {
        this.ideasLinesService.recoverDeletedIdea(idea, this.mindId);
    }

    onDeletedIdeaDelete(idea: Idea) {
        this.ideasLinesService.deleteDeletedIdea(idea, this.mindId);
    }
}