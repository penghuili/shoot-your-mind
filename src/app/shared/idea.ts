export interface Idea {
    id: string;
    text: string;
    left: number;
    top: number;
    note?: string;
    width?: number;
    height?: number;
    centerX?: number;
    centerY?: number;
    backgroundColor?: string;
    historyId?: string;
    isEditing?: boolean;
    isSelected?: boolean;
    isDeleted?: boolean;
    isDone?: boolean;
}