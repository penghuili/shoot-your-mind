import { Idea } from './idea';

export interface Line {
    id: string;
    ideaAId?: string;
    ideaBId?: string;
    deleted?: boolean;
    ideaA?: Idea;
    ideaB?: Idea;
}