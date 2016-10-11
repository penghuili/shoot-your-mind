import { Component } from '@angular/core';

@Component({
    selector: "sym-home",
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    onSet() {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let mind = minds["mind1"];
        let lines = mind.lines;
        let linesKeys = Object.keys(lines);
        let newLines = {};
        linesKeys.forEach(k => {
            let ll = lines[k].history[0];
            newLines[k] = {
                line: {id: ll.id, ideaAId: ll.ideaAId, ideaBId: ll.ideaBId, deleted: ll.deleted},
                deleted: ll.deleted
            };
        });
        mind.lines = newLines;
        minds["mind1"] = mind;
        localStorage.setItem("sym-minds", JSON.stringify(minds));
    }
}