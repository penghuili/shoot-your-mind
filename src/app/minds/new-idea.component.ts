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

@Component({
    selector: "sym-new-idea",
    templateUrl: "./new-idea.component.html",
    styleUrls: ["./new-idea.component.css"]
})
export class NewIdeaComponent implements OnInit {
    @Input() newIdeaPosition: Position;
    @Output() newIdea = new EventEmitter<Idea>();

    constructor(
        private er: ElementRef
    ) {}

    ngOnInit() {
        let node = this.er.nativeElement.querySelector("#newText");
        window.getSelection().selectAllChildren(node);
    }

    onSave(e: KeyboardEvent) {
        e.preventDefault();
        let node = <HTMLParagraphElement>e.target;
        let newIdea = {
            id: "idea" + new Date().getTime(),
            text: node.innerText,
            left: 0,
            top: 0,
            width: this.er.nativeElement.offsetWidth,
            height: this.er.nativeElement.offsetHeight
        }
        this.newIdea.next(newIdea);
        node.innerText = "New Idea";
    }
}