import { ActionReducer, Action } from '@ngrx/store';

import { Idea } from './idea';
import { Line } from './line';
import { Mind } from './mind';

export const LOAD_MINDS = "LOAD_MINDS";
export const ADD_MIND = "ADD_MIND";
export const DELETE_MIND = "DELETE_MIND";
export const UPDATE_MIND = "UPDATE_MIND";
export const DELETE_MIND_FOREVER = "DELETE_MIND_FOREVER";
export const CLEAR_MIND_TRASH = "CLEAR_MIND_TRASH";

export const LOAD_IDEAS = "LOAD_IDEAS";
export const UPDATE_IDEA = "UPDATE_IDEA";
export const ADD_IDEA = "ADD_IDEA";
export const DELETE_IDEA = "DELETE_IDEA";
export const RECOVER_IDEA = "RECOVER_IDEA";
export const DELETE_IDEA_FOREVER = "DELETE_IDEA_FOREVER";

export const LOAD_LINES = "LOAD_LINES";
export const UPDATE_LINES = "UPDATE_LINES";
export const ADD_LINE = "ADD_LINE";
export const DELETE_LINES_WHEN_DELETE_IDEA = "DELETE_LINES_WHEN_DELETE_IDEA";
export const DELETE_MOVING_LINE = "DELETE_MOVING_LINE";
export const DELETE_LINES = "DELETE_LINES";
export const SELECT_IDEA = "SELECT_IDEA";

export const LOAD_SELECTED_IDEA_HISTORY = "LOAD_SELECTED_IDEA_HISTORY";
export const ADD_SELECTED_IDEA_HISTORY = "ADD_SELECTED_IDEA_HISTORY";
export const DELETE_SELECTED_IDEA_HISTORY = "DELETE_HISTORY";
export const RECOVER_IDEA_IN_HISTORY = "RECOVER_IDEA_IN_HISTORY";
export const DELETE_ONE_IDEA_IN_HISTORY = "DELETE_ONE_IDEA_IN_HISTORY";

export interface AppStore {
    ideas: Idea[];
    lines: Line[];
    minds: Mind[];
    selectedIdeaHistory: Idea[];
}

export const mindsReducer: ActionReducer<Mind[]> = (state: Mind[] = [], action: Action) => {
    switch(action.type) {
        case LOAD_MINDS:
            return action.payload;
        case ADD_MIND:
            return [action.payload, ...state];
            // This should be a update
        case DELETE_MIND:
            return state.map(mind => {
                if(mind.id === action.payload.id) {
                    return Object.assign({}, mind, {deleted: true});
                } else {
                    return mind;
                }
            });
        case UPDATE_MIND:
            return state.map(mind => {
                if(mind.id === action.payload.id) {
                    return Object.assign({}, action.payload);
                } else {
                    return mind;
                }
            });
        case DELETE_MIND_FOREVER:
            return state.filter(mind => {
                return mind.id !== action.payload.id;
            });
        case CLEAR_MIND_TRASH:
            return state.filter(mind => {
                return !mind.deleted;
            });
        default:
            return state;
    }
};


export const ideasReducer: ActionReducer<Idea[]> = 
    (state: Idea[] = [], action: Action) => {
        switch(action.type) {
            case LOAD_IDEAS:
                return action.payload;
            case UPDATE_IDEA:
                return state.map(idea => {
                    if(idea.id === action.payload.id) {
                        return Object.assign({}, idea, action.payload);
                    } else {
                        return idea;
                    }
                });
            case ADD_IDEA:
                return [ action.payload, ...state];
            case DELETE_IDEA:
                return state.map(idea => {
                    if(idea.id === action.payload.id) {
                        return Object.assign({}, idea, {isDeleted: true});
                    } else {
                        return idea;
                    }
                });
            case SELECT_IDEA:
                return state.map(idea => {
                    if(!idea.isDeleted && idea.id === action.payload.id) {
                        return Object.assign({}, action.payload); 
                    } else {
                        return Object.assign({}, idea, {isSelected: false});
                    }
                });
            case RECOVER_IDEA:
                let filtered = state.filter(i => {
                    return i.id !== action.payload.id;
                });
                return [...filtered, action.payload];
            case DELETE_IDEA_FOREVER:
                return state.filter(idea => {
                    return idea.id !== action.payload.id;
                });
            default:
                return state;
        }
}

export const linesReducer: ActionReducer<Line[]> = (state: Line[] = [], action: Action) => {
    switch(action.type) {
        case LOAD_LINES:
            return action.payload;
        case UPDATE_LINES:
            return state.map(line => {
                if(line.ideaA.id === action.payload.id) {
                    return Object.assign({}, line, {
                        ideaA: Object.assign({}, action.payload)
                    });
                } else if(line.ideaB.id === action.payload.id) {
                    return Object.assign({}, line, {
                        ideaB: Object.assign({}, action.payload)
                    });
                } else {
                    return line;
                }
            });
        case ADD_LINE:
            return [...state, action.payload];
        case DELETE_LINES_WHEN_DELETE_IDEA:
            return state.filter(line => {
                return line.ideaA.id !== action.payload.id && 
                    line.ideaB.id !== action.payload.id;
            });
        case DELETE_MOVING_LINE:
            return state.filter(line => {
                return line.id !== "addMovingLine";
            });
        case DELETE_LINES:
            return state.filter(line => {
                let deleteLine: boolean;
                action.payload.forEach(l => {
                    if(l.id === line.id) {
                        deleteLine = true;
                    }
                });
                return !deleteLine;
            });
        default:
            return state;
    }
}

export const selectedIdeaHistoryReducer: ActionReducer<Idea[]> = 
    (state: Idea[] = [], action: Action) => {
        switch(action.type) {
            case LOAD_SELECTED_IDEA_HISTORY:
                return action.payload;
            case ADD_SELECTED_IDEA_HISTORY:
                return [action.payload, ...state];
            case DELETE_SELECTED_IDEA_HISTORY:
                return [];
            case RECOVER_IDEA_IN_HISTORY:
                let filtered = state.filter(h => {
                    return h.historyId !== action.payload.recoverIdea.historyId;
                });
                let currentIdea = Object.assign({}, action.payload.currentIdea);
                return [currentIdea, ...filtered];
            case DELETE_ONE_IDEA_IN_HISTORY:
                return state.filter(i => {
                    return i.historyId !== action.payload.historyId;
                });
            default:
                return state;
        }
    }

