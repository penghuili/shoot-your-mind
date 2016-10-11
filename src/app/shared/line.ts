import { Idea } from './idea';

export class Line {
    id: string;
    ideaAId?: string;
    ideaBId?: string;
    deleted?: boolean;
    ideaA?: Idea;
    ideaB?: Idea;
}