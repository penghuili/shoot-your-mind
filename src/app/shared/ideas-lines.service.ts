import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Idea } from './idea';
import { Line } from './line';
import { Doc } from './doc';
import { AppStore } from './reducers';

import {
    initialIdeas,

    LOAD_DOCS,

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

    loadDocs() {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        let docsInfo: Doc[] = [];
        docs.forEach(doc => {
            let info = {
                id: doc.id,
                title: doc.title,
                description: doc.description
            };
            docsInfo.push(info);
        });
        this.store.dispatch({type: LOAD_DOCS, payload: docsInfo});
    }

    loadIdeasAndLines(docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        let doc = docs.filter(doc => {
            return doc.id === docId;
        })[0];
        let ideas = doc.ideas;
        let lines = doc.lines;
        this.store.dispatch({type: LOAD_IDEAS, payload: ideas});
        this.store.dispatch({type: LOAD_LINES, payload: lines});
    }

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
        this.updateIdeasInServer(idea, "doc1");
        this.updateLinesInServer(idea, "doc1");
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
        this.store.dispatch({type: UPDATE_LINES, payload: idea});
    }

    addIdea(idea: Idea) {
        this.addIdeaToServer(idea, "doc1");
        this.store.dispatch({type: ADD_IDEA, payload: idea});
    }

    deleteIdea(idea: Idea) {
        this.deleteIdeaFromServer(idea, "doc1");
        this.deleteLinesWhenDeleteIdeaFromServer(idea, "doc1");
        this.store.dispatch({type: DELETE_IDEA, payload: idea});
        this.store.dispatch({type: DELETE_LINES_WHEN_DELETE_IDEA, payload: idea});
    }

    moveIdea(idea: Idea) {
        this.store.dispatch({type: UPDATE_IDEA, payload: idea});
    }

    selectIdea(idea: Idea) {
        this.selectIdeaFromServer(idea, "doc1");
        this.store.dispatch({type: SELECT_IDEA, payload: idea});
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
        this.addLineToServer(line, "doc1");
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
        this.deleteLinesFromServer(lines, "doc1");
        this.store.dispatch({type: DELETE_LINES, payload: lines});
    }

    private updateIdeasInServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.ideas = doc.ideas.map(i => {
                    if(i.id === idea.id) {
                        return Object.assign({}, idea);
                    } else {
                        return i;
                    }
                });
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private addIdeaToServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.ideas = [...doc.ideas, idea];
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private deleteIdeaFromServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.ideas = doc.ideas.filter(i => {
                    return i.id !== idea.id;
                });
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private selectIdeaFromServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.ideas = doc.ideas.map(i => {
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
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private updateLinesInServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.lines = doc.lines.map(line => {
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
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private deleteLinesWhenDeleteIdeaFromServer(idea: Idea, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.lines = doc.lines.filter(line => {
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
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private deleteLinesFromServer(ls: Line[], docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.lines = doc.lines.filter(line => {
                    let deleteLine: boolean = false;
                    ls.forEach(l => {
                        if(l.id === line.id) {
                            deleteLine = true;
                        }
                    });
                    return !deleteLine;
                });
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }

    private addLineToServer(line: Line, docId: string) {
        let docs = JSON.parse(localStorage.getItem("sym-docs"));
        docs = docs.map(doc => {
            if(doc.id === docId) {
                doc.lines = [...doc.lines, line];
                return doc;
            } else {
                return doc;
            }
        });        
        localStorage.setItem("sym-docs", JSON.stringify(docs));
    }
}
