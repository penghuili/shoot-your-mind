import { Idea } from './idea';
import { Line } from './line';

export class Mind {
    id: string;
    title: string;
    description?: string;
    deleted?: boolean;
    ideas?: any;
    lines?: any;
}