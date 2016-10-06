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
    DELETE_IDEA,

    LOAD_LINES,
    UPDATE_LINES,
    ADD_LINE,
    DELETE_LINES_WHEN_DELETE_IDEA,
    DELETE_MOVING_LINE,
    DELETE_LINES
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

    deleteIdea(idea: Idea) {
        this.deleteIdeaFromServer(idea);
        this.deleteLinesWhenDeleteIdeaFromServer(idea);
        this.store.dispatch({type: DELETE_IDEA, payload: idea});
        this.store.dispatch({type: DELETE_LINES_WHEN_DELETE_IDEA, payload: idea});
    }

    moveIdea(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
    }

    addIdeaCenter(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        //TODO: if no line on this idea, donot run UPDATE_LINES
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
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
        let movingLine = Object.assign({}, line, {id: "addMovingLine"});
        this.deleteMovingLine(movingLine);
        this.store.dispatch({type: ADD_LINE, payload: line});
    }

    addMovingLine(line: Line) {
        this.deleteMovingLine(line);
        this.store.dispatch({type: ADD_LINE, payload: line});
    }

    deleteMovingLine(line: Line) {
        this.store.dispatch({type: DELETE_MOVING_LINE, payload: line});
    }

    deleteLines(lines: Line[]) {
        this.deleteLinesFromServer(lines);
        this.store.dispatch({type: DELETE_LINES, payload: lines});
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

    private deleteIdeaFromServer(idea: Idea) {
        let ideas = JSON.parse(localStorage.getItem("ideas"));
        ideas = ideas.filter(i => {
            return i.id !== idea.id;
        });
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

    private deleteLinesWhenDeleteIdeaFromServer(idea: Idea) {
        let lines = JSON.parse(localStorage.getItem("lines"));
        lines = lines.filter(line => {
            let deleteLine: boolean;
            if(line.ideaA.id === idea.id) {
                deleteLine = true;
            } else if(line.ideaB.id === idea.id) {
                deleteLine = true;
            } else {
                deleteLine = false;
            }
            return !deleteLine;
        });
        localStorage.setItem("lines", JSON.stringify(lines));
    }

    private deleteLinesFromServer(ls: Line[]) {
        let lines = JSON.parse(localStorage.getItem("lines"));
        lines = lines.filter(line => {
            let deleteLine: boolean = false;
            ls.forEach(l => {
                if(l.id === line.id) {
                    deleteLine = true;
                }
            });
            return !deleteLine;
        });
        localStorage.setItem("lines", JSON.stringify(lines));
    }

    private addLineToServer(line: Line) {
        let lines = JSON.parse(localStorage.getItem("lines"));
        lines = [...lines, line];
        localStorage.setItem("lines", JSON.stringify(lines));
    }
}
