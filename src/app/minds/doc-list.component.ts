import { 
    Component,
    OnInit
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { Doc } from '../shared/doc';
import { AppStore } from '../shared/reducers';
import { IdeasLinesService } from '../shared/ideas-lines.service';

@Component({
    selector: "sym-doc-list",
    templateUrl: "./doc-list.component.html",
    styleUrls: ["./doc-list.component.css"]
})
export class DocListComponent implements OnInit {
    docs: Observable<Doc[]>;

    constructor(
        private store: Store<AppStore>,
        private ideasLinesService: IdeasLinesService) {}

    ngOnInit() {
        this.docs = this.store.select("docs");
        this.ideasLinesService.loadDocs();
    }
}