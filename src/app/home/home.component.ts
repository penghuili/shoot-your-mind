import { Component } from '@angular/core';

@Component({
    selector: "sym-home",
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    onSet() {
        let minds = JSON.parse(localStorage.getItem("sym-minds"));
        let newMinds = {};
        minds = minds.map(m => {
            let newIdeas = {};
            let newLines = {};
            m.ideas.forEach(i => {
                newIdeas[i.id] = {history: [i], deleted: false};
            });
            m.lines.forEach(l => {
                newLines[l.id] = {history: [l], deleted: false, ideaAId: l.ideaA.id, ideaBId: l.ideaB.id};
            });
            return Object.assign({}, m, {ideas: newIdeas, lines: newLines});
        });
        minds.forEach(m => {
            newMinds[m.id] = m;
        });
        localStorage.setItem("sym-minds", JSON.stringify(newMinds));
    }
}