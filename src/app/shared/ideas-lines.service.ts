import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Idea } from './idea';
import { Line } from './line';
import { Mind } from './mind';
import { AppStore } from './reducers';

import {
    LOAD_MINDS,
    ADD_MIND,
    DELETE_MIND,
    UPDATE_MIND,
    DELETE_MIND_FOREVER,
    CLEAR_MIND_TRASH,

    LOAD_IDEAS,
    UPDATE_IDEA,
    ADD_IDEA,
    DELETE_IDEA,
    SELECT_IDEA,
    RECOVER_IDEA,
    DELETE_IDEA_FOREVER,

    LOAD_LINES,
    UPDATE_LINES,
    ADD_LINE,
    DELETE_LINES_WHEN_DELETE_IDEA,
    DELETE_MOVING_LINE,
    DELETE_LINES,

    LOAD_SELECTED_IDEA_HISTORY,
    ADD_SELECTED_IDEA_HISTORY,
    DELETE_SELECTED_IDEA_HISTORY,
    RECOVER_IDEA_IN_HISTORY,
    DELETE_ONE_IDEA_IN_HISTORY
} from './reducers';

@Injectable()
export class IdeasLinesService {

    constructor(private store: Store<AppStore>) {}

    loadMinds() {
        if(!localStorage.getItem("sym-minds")) {
            localStorage.setItem("sym-minds", JSON.stringify({}));
            this.store.dispatch({type: LOAD_MINDS, payload: []});
        } else {
            let minds = JSON.parse(localStorage.getItem("sym-minds"));
            let mindsKeys = Object.keys(minds);
            let mindsInfo: Mind[] = [];
            mindsKeys.forEach(k => {
                let info = {
                    id: k,
                    title: minds[k].title,
                    description: minds[k].description,
                    deleted: minds[k].deleted
                };
                mindsInfo.push(info);
            });
            this.store.dispatch({type: LOAD_MINDS, payload: mindsInfo});
        }
    }

    addMind(mind: Mind) {
        this.addMindToServer(mind);
        let newMind = {
            id: mind.id,
            title: mind.title,
            description: mind.description,
            deleted: mind.deleted
        };
        this.store.dispatch({type: ADD_MIND, payload: newMind});
    }

    deleteMind(mind: Mind) {
        this.deleteMindFromServer(mind);
        this.store.dispatch({type: DELETE_MIND, payload: mind});
    }

    updateMind(mind: Mind) {
        this.updateMindInServer(mind);
        this.store.dispatch({type: UPDATE_MIND, payload: mind});
    }

    deleteMindForever(mind: Mind) {
        this.deleteMindForeverFromServer(mind);
        this.store.dispatch({type: DELETE_MIND_FOREVER, payload: mind});
    }

    clearMindTrash() {
        this.clearMindTrashFromServer();
        this.store.dispatch({type: CLEAR_MIND_TRASH, payload: ""});
    }

    loadIdeasAndLines(mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds[mindId];
        let ideas = mind.ideas;
        let lines = mind.lines;
        let ideasKeys = Object.keys(ideas);
        let linesKeys = Object.keys(lines);
        let ideasForStore = [];
        ideasKeys.forEach(k => {
                let idea = Object.assign({}, ideas[k].history[0], {isDeleted: ideas[k].deleted});
                ideasForStore.push(idea);
            });
        let linesForStore = [];
        linesKeys.forEach(k => {
            if(!lines[k].deleted) {
                let ll = lines[k].line;
                let ideaA = this.getIdea(ideasForStore, ll.ideaAId);
                let ideaB = this.getIdea(ideasForStore, ll.ideaBId);
                linesForStore.push(Object.assign({}, ll, {ideaA, ideaB}));
            }
        });
        this.store.dispatch({type: LOAD_IDEAS, payload: ideasForStore});
        this.store.dispatch({type: LOAD_LINES, payload: linesForStore});
        return mind.deleted;
    }

    addUpdatedIdeaToHistory(data, mindId: string) {
        this.addUpdatedIdeaToHistoryInServer(data.newIdea, mindId);
        this.store.dispatch({type: UPDATE_IDEA, payload: data.newIdea});
        this.store.dispatch({type: UPDATE_LINES, payload: data.newIdea});
        this.store.dispatch({type: ADD_SELECTED_IDEA_HISTORY, payload: data.oldIdea});
    }

    updateTheLatestIdeaInHistory(idea: Idea, mindId: string) {
        this.updateTheLatestIdeaInHistoryInServer(idea, mindId);
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
    }

    addIdea(idea: Idea, mindId: string) {
        this.addIdeaToServer(idea, mindId);
        this.store.dispatch({type: ADD_IDEA, payload: idea});
    }

    deleteIdea(idea: Idea, mindId: string) {
        this.deleteIdeaFromServer(idea, mindId);
        this.deleteLinesWhenDeleteIdeaFromServer(idea, mindId);
        this.store.dispatch({type: DELETE_IDEA, payload: idea});
        this.store.dispatch({type: DELETE_LINES_WHEN_DELETE_IDEA, payload: idea});
        this.store.dispatch({type: DELETE_SELECTED_IDEA_HISTORY, payload: []});
    }

    moveIdea(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
    }

    selectIdea(idea: Idea, mindId: string) {
        this.updateTheLatestIdeaInHistory(idea, mindId);
        this.store.dispatch({type: SELECT_IDEA, payload: idea});
    }

    recoverHistoryIdea(data, mindId: string) {
        this.recoverHistoryIdeaInServer(data, mindId);
        this.store.dispatch({type: RECOVER_IDEA_IN_HISTORY, payload: data});
        this.store.dispatch({type: RECOVER_IDEA, payload: data.recoverIdea});
    }

    deleteHistoryIdea(idea: Idea, mindId: string) {
        this.deleteHistoryIdeaInServer(idea, mindId);
        this.store.dispatch({type: DELETE_ONE_IDEA_IN_HISTORY, payload: idea});
    }

    recoverDeletedIdea(idea: Idea, mindId: string) {
        this.recoverDeletedIdeaInServer(idea, mindId);
        let newIdea = Object.assign({}, idea, {isDeleted: false});
        this.store.dispatch({type: UPDATE_IDEA, payload: newIdea});
    }

    deleteDeletedIdea(idea: Idea, mindId: string) {
        this.deleteIdeaForeverFromServer(idea, mindId);
        this.store.dispatch({type: DELETE_IDEA_FOREVER, payload: idea});
    }

    addLine(line: Line, mindId: string) {
        this.addLineToServer(line, mindId);
        let movingLine = Object.assign({}, line, {id: "addMovingLine"});
        this.deleteMovingLine(movingLine);
        let lineForStore = {
            id: line.id,
            ideaA: line.ideaA,
            ideaB: line.ideaB
        }
        this.store.dispatch({type: ADD_LINE, payload: lineForStore});
    }

    addMovingLine(line: Line) {
        this.deleteMovingLine(line);
        this.store.dispatch({type: ADD_LINE, payload: line});
    }

    deleteMovingLine(line: Line) {
        this.store.dispatch({type: DELETE_MOVING_LINE, payload: line});
    }

    deleteLines(lines: Line[], mindId: string) {
        this.deleteLinesFromServer(lines, mindId);
        this.store.dispatch({type: DELETE_LINES, payload: lines});
    }

    loadSelectedIdeaHistory(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds[mindId];
        let selectedIdea = mind.ideas[idea.id];
        let history = [];
        if(selectedIdea.deleted) {
            this.store.dispatch({type: LOAD_SELECTED_IDEA_HISTORY, payload: history});
        } else {
            history = selectedIdea.history.slice(1);
            this.store.dispatch({type: LOAD_SELECTED_IDEA_HISTORY, payload: history});
        }
    }

    private addMindToServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mind.id] = mind;
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteMindFromServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mind.id].deleted = true;
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private updateMindInServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mind.id] = Object.assign({}, minds[mind.id], mind);
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteMindForeverFromServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        delete minds[mind.id];
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private clearMindTrashFromServer() {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let keys = Object.keys(minds);
        keys.forEach(k => {
            if(minds[k].deleted) {
                delete minds[k];
            }
        });
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private addUpdatedIdeaToHistoryInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mindId].ideas[idea.id].history[0].isEditing = false;
        minds[mindId].ideas[idea.id].history.unshift(idea);       
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private updateTheLatestIdeaInHistoryInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mindId].ideas[idea.id].history[0] = idea;       
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private addIdeaToServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mindId].ideas[idea.id] = {
            history: [idea], 
            deleted: false};     
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteIdeaFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds[mindId].ideas[idea.id].deleted = true;        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteIdeaForeverFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        delete minds[mindId].ideas[idea.id];        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private recoverHistoryIdeaInServer(data, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds[mindId];
        let ideaHistory = mind.ideas[data.currentIdea.id].history;
        let filtered = ideaHistory.filter(i => {
            return data.recoverIdea.historyId !== i.historyId;
        });
        minds[mindId].ideas[data.currentIdea.id].history = [data.recoverIdea, ...filtered]; 
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteHistoryIdeaInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds[mindId];
        let ideaHistory = mind.ideas[idea.id].history;
        let filtered = ideaHistory.filter(i => {
            return idea.historyId !== i.historyId;
        });
        minds[mindId].ideas[idea.id].history = filtered;
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private recoverDeletedIdeaInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds[mindId];
        mind.ideas[idea.id].deleted = false;
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteLinesWhenDeleteIdeaFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let lines = minds[mindId].lines;
        let linesKeys = Object.keys(lines);
        linesKeys.forEach(k => {
            if(lines[k].line.ideaAId === idea.id || lines[k].line.ideaBId === idea.id) {
                lines[k].deleted = true;
            }
        });
        minds[mindId].lines = lines;        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteLinesFromServer(ls: Line[], mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let lines = minds[mindId].lines;
        let linesKeys = Object.keys(lines);
        linesKeys.forEach(k => {
            ls.forEach(l => {
                if(l.id === k) {
                    lines[k].deleted = true;
                }
            });
        });
        minds[mindId].lines = lines;        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteLinesForeverFromServer(ls: Line[], mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let lines = minds[mindId].lines;
        let linesKeys = Object.keys(lines);
        linesKeys.forEach(k => {
            ls.forEach(l => {
                if(l.id === k) {
                    delete lines[k];
                }
            });
        });
        minds[mindId].lines = lines;        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private addLineToServer(line: Line, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let lineForServer = {
            id: line.id,
            ideaAId: line.ideaAId,
            ideaBId: line.ideaBId
        };
        minds[mindId].lines[line.id] = {
            line: lineForServer,
            deleted: false
        };       
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private getIdea(ideas: Idea[], id: string) {
        return ideas.filter(i => {
            return i.id === id;
        })[0];
    }
}
