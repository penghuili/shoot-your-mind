import { Component, Input } from '@angular/core';

import { Idea } from '../shared/idea';

@Component({
    selector: "sym-idea",
    templateUrl: "./idea.component.html",
    styleUrls: ["./idea.component.css"]
})
export class IdeaComponent {
    @Input() idea: Idea;
}