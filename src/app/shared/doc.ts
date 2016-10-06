import { Idea } from './idea';
import { Line } from './line';

export class Doc {
    id: string;
    title: string;
    description: string;
    ideas?: Idea[];
    lines?: Line[];
}