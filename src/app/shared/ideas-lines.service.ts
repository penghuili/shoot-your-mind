import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Idea } from './idea';
import { Line } from './line';
import { AppStore } from './reducers';

import {
    initialIdeas,

    LOAD_IDEAS,
    UPDATE_IDEA,
    ADD_IDEA,

    LOAD_LINES,
    UPDATE_LINES,
    ADD_LINE
} from './reducers';

@Injectable()
export class IdeasLinesService {

    constructor(private store: Store<AppStore>) {}

    loadIdeas() {
        if(localStorage.getItem("ideas")) {
            let ideas = JSON.parse(localStorage.getItem("ideas"));
            this.store.dispatch({type: LOAD_IDEAS, payload: ideas});
        } else {
            console.log("use default ideas");
            localStorage.setItem("ideas", JSON.stringify(initialIdeas));
        }
    }

    updateIdea(idea: Idea) {
        this.updateIdeasInServer(idea);
        this.updateLinesInServer(idea);
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
    }

    addIdea(idea: Idea) {
        this.addIdeaToServer(idea);
        this.store.dispatch({type: ADD_IDEA, payload: idea});
    }

    loadLines() {
        if(localStorage.getItem("lines")) {
            let lines = JSON.parse(localStorage.getItem("lines"));
            this.store.dispatch({type: LOAD_LINES, payload: lines});
        } else {
            console.log("use default lines");
            localStorage.setItem("lines", JSON.stringify([]));
        }
    }  

    addLine(line: Line) {
        this.addLineToServer(line);
        this.store.dispatch({type: ADD_LINE, payload: line});
    }

    private updateIdeasInServer(idea: Idea) {
        let ideas = JSON.parse(localStorage.getItem("ideas"));
        ideas = ideas.map(i => {
            if(i.id === idea.id) {
                return Object.assign({}, idea);
            } else {
                return i;
            }
        });
        localStorage.setItem("ideas", JSON.stringify(ideas));
    }

    private addIdeaToServer(idea: Idea) {
        let ideas = JSON.parse(localStorage.getItem("ideas"));
        ideas = [...ideas, idea];
        localStorage.setItem("ideas", JSON.stringify(ideas));
    }

    private updateLinesInServer(idea: Idea) {
        let lines = JSON.parse(localStorage.getItem("lines"));
        lines = lines.map(line => {
            if(line.ideaA.id === idea.id) {
                return {
                    ideaA: Object.assign({}, idea),
                    ideaB: Object.assign({}, line.ideaB)
                }
            } else if(line.ideaB.id === idea.id) {
                return {
                    ideaA: Object.assign({}, line.ideaA),
                    ideaB: Object.assign({}, idea)
                }
            } else {
                return line;
            }
        });
        localStorage.setItem("lines", JSON.stringify(lines));
    }

    private addLineToServer(line: Line) {
        let lines = JSON.parse(localStorage.getItem("lines"));
        lines = [...lines, line];
        localStorage.setItem("lines", JSON.stringify(lines));
    }
}
