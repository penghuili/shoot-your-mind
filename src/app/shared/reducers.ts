import { ActionReducer, Action } from '@ngrx/store';

import { Idea } from './idea';
import { Line } from './line';

export const LOAD_IDEAS = "LOAD_IDEAS";
export const UPDATE_IDEA = "UPDATE_IDEA";
export const ADD_IDEA = "ADD_IDEA";

export const LOAD_LINES = "LOAD_LINES";
export const UPDATE_LINES = "UPDATE_LINES";
export const ADD_LINE = "ADD_LINE";

export interface AppStore {
    ideas: Idea[];
    lines: Line[];
}

export const initialIdeas: Idea[] = [
    {
        id: "skjfhiuewieriueriy8743",
        text: "PWA",
        left: 40,
        top: 39
    },
    {
        id: "ieu9er7tdjlkfg",
        text: "Component",
        left: 120,
        top: 46
    },
    {
        id: "slauefyew78e478sdfn",
        text: "ngrx",
        left: 20,
        top: 150
    }
];


export const ideasReducer: ActionReducer<Idea[]> = 
    (state: Idea[] = initialIdeas, action: Action) => {
        switch(action.type){
            case LOAD_IDEAS:
                return action.payload;
            case UPDATE_IDEA:
                return state.map(idea => {
                    if(idea.id === action.payload.id) {
                        return Object.assign({}, action.payload);
                    } else {
                        return idea;
                    }
                });
            case ADD_IDEA:
                return [...state, action.payload];
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
                    return {
                        ideaA: Object.assign({}, action.payload),
                        ideaB: Object.assign({}, line.ideaB)
                    }
                } else if(line.ideaB.id === action.payload.id) {
                    return {
                        ideaA: Object.assign({}, line.ideaA),
                        ideaB: Object.assign({}, action.payload)
                    }
                } else {
                    return line;
                }
            });
        case ADD_LINE:
            return [...state, action.payload];
        default:
            return state;
    }
}

