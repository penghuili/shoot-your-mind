import { 
    Component, Input, Output, 
    AfterViewInit, ElementRef,
    EventEmitter
} from '@angular/core';

import { Idea } from '../shared/idea';

@Component({
    selector: "sym-idea",
    templateUrl: "./idea.component.html",
    styleUrls: ["./idea.component.css"]
})
export class IdeaComponent implements AfterViewInit {
    @Input() idea: Idea;
    @Output() addWidthAndHeight = new EventEmitter<Idea>();
    @Output() deleteIdea = new EventEmitter<Idea>();

    constructor(private er: ElementRef) {}

    ngAfterViewInit() {
        let width = this.er.nativeElement.offsetWidth;
        let height = this.er.nativeElement.offsetHeight;
        let centerX = this.idea.left + width / 2;
        let centerY = this.idea.top + height / 2;
        if(centerX !== this.idea.centerX || centerY !== this.idea.centerY) {
            let data = Object.assign({}, this.idea, {centerX: centerX, centerY: centerY});
            this.addWidthAndHeight.next(data);
        }
    }

    onClick(e: MouseEvent) {
        e.stopPropagation();
        this.deleteIdea.next(this.idea);
    }
}