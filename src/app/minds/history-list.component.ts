import { 
  ChangeDetectionStrategy,
  Component, 
  EventEmitter,
  Input,
  Output } from '@angular/core';

import { Idea } from  '../shared/idea';

@Component({
  selector: 'sym-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryListComponent {
  @Input() ideas: Idea[];
  @Input() listHeight: number;
  @Output() ideaRecover = new EventEmitter();
  @Output() ideaDeletedFromHistory = new EventEmitter<Idea>();
  hasHistory: boolean;
  emptyMessage = {
    text: "No history.",
    backgroundColor: "white"
  };

  onIdeaRecover(idea: Idea) {
    this.ideaRecover.next(idea);
  }
  onIdeaDeletedFromHistory(idea: Idea) {
    this.ideaDeletedFromHistory.next(idea);
  }
}
