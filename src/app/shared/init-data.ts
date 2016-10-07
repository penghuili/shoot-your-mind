import { Position } from './position';
import { Mind } from './mind';
import { Line } from './line';
import { Idea } from './idea';

export const INIT_POSITION: Position = {
    left: 0,
    top: 0
};

export const INIT_MIND: Mind = {
    id: "",
    title: "",
    description: ""
};

export const INIT_IDEA: Idea = {
    id: "",
    text: "",
    left: 0,
    top: 0
};

export const INIT_LINE: Line = {
    id: "",
    ideaA: INIT_IDEA,
    ideaB: INIT_IDEA
};