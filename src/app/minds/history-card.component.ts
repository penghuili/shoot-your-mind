import { 
  Component, 
  EventEmitter,
  Input,
  Output } from '@angular/core';

import { Idea } from '../shared/idea';

@Component({
  selector: 'sym-history-card',
  templateUrl: './history-card.component.html',
  styleUrls: ['./history-card.component.css']
})
export class HistoryCardComponent {
  @Input() idea: Idea;
  @Output() ideaRecover = new EventEmitter<Idea>();
  @Output() ideaDeletedFromHistory = new EventEmitter<Idea>();

  recoverIdea(e: MouseEvent) {
    this.stopPropagationPlease(e);
    this.ideaRecover.next(this.idea);
  }
  deleteIdeaFromHistory(e: MouseEvent) {
    this.stopPropagationPlease(e);
    this.ideaDeletedFromHistory.next(this.idea);
  }
  stopPropagationPlease(e: MouseEvent) {
      // e.preventDefault();
      e.stopPropagation();
  }
}
