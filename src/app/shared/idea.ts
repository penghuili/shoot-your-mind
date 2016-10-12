export class Idea {
    id: string;
    text: string;
    left: number;
    top: number;
    note?: string;
    width?: number;
    height?: number;
    centerX?: number;
    centerY?: number;
    isEditing?: boolean;
    isSelected?: boolean;
    backgroundColor?: string;
    historyId?: string;
    isDeleted?: boolean;
}