import { Idea } from './idea';
import { Line } from './line';
import { AppConfig } from './app-config';

export interface Mind {
    id: string;
    title: string;
    description?: string;
    deleted?: boolean;
    ideas?: any;
    lines?: any;
    done?: boolean;
    config?: AppConfig;
}