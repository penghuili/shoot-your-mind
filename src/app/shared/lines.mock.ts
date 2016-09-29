import { IDEAS } from './ideas.mock';
import { Line } from './line';

export const LINES: Line[] = [
    {
        ideaA: Object.assign({}, IDEAS[0]),
        ideaB: Object.assign({}, IDEAS[1])
    },
    {
        ideaA: Object.assign({}, IDEAS[1]),
        ideaB: Object.assign({}, IDEAS[2])
    }
];