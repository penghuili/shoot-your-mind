import { 
    Component, 
    Input, 
    OnInit, 
    Output,
    ElementRef, 
    EventEmitter
} from '@angular/core';

import { Position } from '../shared/position';
import { Idea } from '../shared/idea';
import { UtilsService } from '../shared/utils.service';

@Component({
    selector: "sym-new-idea",
    templateUrl: "./new-idea.component.html",
    styleUrls: ["./new-idea.component.css"]
})
export class NewIdeaComponent implements OnInit {
    @Input() newIdeaPosition: Position;
    @Output() newIdea = new EventEmitter<Idea>();

    constructor(
        private er: ElementRef,
        private utils: UtilsService
    ) {}

    ngOnInit() {
        let node = this.er.nativeElement.children[0].children[0];
        window.getSelection().selectAllChildren(node);
    }

    onSave(e: KeyboardEvent) {
        e.preventDefault();
        let node = <HTMLParagraphElement>e.target;
        let newIdea = {
            id: this.utils.createUUID(),
            text: node.innerText,
            left: 0,
            top: 0,
            centerX: this.er.nativeElement.offsetWidth,
            centerY: this.er.nativeElement.offsetHeight
        }
        this.newIdea.next(newIdea);
        node.innerText = "New Idea";
    }
}