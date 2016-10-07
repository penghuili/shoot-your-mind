import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Idea } from './idea';
import { Line } from './line';
import { Mind } from './mind';
import { AppStore } from './reducers';

import {
    initialIdeas,

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

    loadMinds() {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mindsInfo: Mind[] = [];
        minds.forEach(mind => {
            let info = {
                id: mind.id,
                title: mind.title,
                description: mind.description,
                deleted: mind.deleted
            };
            mindsInfo.push(info);
        });
        this.store.dispatch({type: LOAD_MINDS, payload: mindsInfo});
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
        let mind = minds.filter(mind => {
            return mind.id === mindId;
        })[0];
        let ideas = mind.ideas;
        let lines = mind.lines;
        this.store.dispatch({type: LOAD_IDEAS, payload: ideas});
        this.store.dispatch({type: LOAD_LINES, payload: lines});
        return mind.deleted;
    }

    updateIdea(idea: Idea, mindId: string) {
        this.updateIdeasInServer(idea, mindId);
        this.updateLinesInServer(idea, mindId);
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
    }

    moveIdea(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
    }

    selectIdea(idea: Idea, mindId: string) {
        this.selectIdeaFromServer(idea, mindId);
        this.store.dispatch({type: SELECT_IDEA, payload: idea});
    }

    addIdeaCenter(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        //TODO: if no line on this idea, donot run UPDATE_LINES
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
    }

    addLine(line: Line, mindId: string) {
        this.addLineToServer(line, mindId);
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

    deleteLines(lines: Line[], mindId: string) {
        this.deleteLinesFromServer(lines, mindId);
        this.store.dispatch({type: DELETE_LINES, payload: lines});
    }

    private addMindToServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds.unshift(mind);
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteMindFromServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(m => {
            if(m.id === mind.id) {
                return Object.assign({}, m, {deleted: true});
            } else {
                return m;
            }
        });
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private updateMindInServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(m => {
            if(m.id === mind.id) {
                return Object.assign({}, mind);
            } else {
                return m;
            }
        });
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteMindForeverFromServer(mind: Mind) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.filter(m => {
            return m.id !== mind.id;
        });
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private clearMindTrashFromServer() {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.filter(m => {
            return !m.deleted;
        });
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private updateIdeasInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.ideas = mind.ideas.map(i => {
                    if(i.id === idea.id) {
                        return Object.assign({}, idea);
                    } else {
                        return i;
                    }
                });
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private addIdeaToServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.ideas = [...mind.ideas, idea];
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteIdeaFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.ideas = mind.ideas.filter(i => {
                    return i.id !== idea.id;
                });
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private selectIdeaFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.ideas = mind.ideas.map(i => {
                    if(i.id === idea.id) {
                        if(i.isSelected) {
                            return Object.assign({}, i, {isSelected: false});
                        } else {
                            return Object.assign({}, i, {isSelected: true});
                        }
                    } else {
                        return Object.assign({}, i, {isSelected: false});
                    }
                });
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private updateLinesInServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.lines = mind.lines.map(line => {
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
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteLinesWhenDeleteIdeaFromServer(idea: Idea, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.lines = mind.lines.filter(line => {
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
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private deleteLinesFromServer(ls: Line[], mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.lines = mind.lines.filter(line => {
                    let deleteLine: boolean = false;
                    ls.forEach(l => {
                        if(l.id === line.id) {
                            deleteLine = true;
                        }
                    });
                    return !deleteLine;
                });
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }

    private addLineToServer(line: Line, mindId: string) {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        minds = minds.map(mind => {
            if(mind.id === mindId) {
                mind.lines = [...mind.lines, line];
                return mind;
            } else {
                return mind;
            }
        });        
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }
}
