import { 
    Component,
    OnInit,
    OnDestroy } from '@angular/core';
import { 
    FormControl, 
    FormGroup,
    FormBuilder,
    Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { Mind } from '../shared/mind';
import { AppStore } from '../shared/reducers';
import { IdeasLinesService } from '../shared/ideas-lines.service';
import { INIT_MIND } from '../shared/init-data';

@Component({
    selector: "sym-minds-list",
    templateUrl: "./mind-list.component.html",
    styleUrls: ["./mind-list.component.css"]
})
export class MindListComponent implements OnInit, OnDestroy {
    minds: Observable<Mind[]>;
    mindsSub: any;
    activeMinds: Mind[];
    deletedMinds: Mind[];
    doneMinds: Mind[];
    noActiveMind: boolean;
    noDeletedMind: boolean;
    noDoneMind: boolean;
    showActive: boolean = true;
    showDeleted: boolean = false;
    showDone: boolean = false;
    showAddNew: boolean = false;
    isEditing: boolean = false;

    newMindForm: FormGroup;
    title: FormControl;
    description: FormControl;

    private editingMind: Mind;

    constructor(
        private store: Store<AppStore>,
        private ideasLinesService: IdeasLinesService,
        private builder: FormBuilder) {
            this.title = new FormControl("", [
                Validators.required
            ]);
            this.description = new FormControl("", []);
            this.newMindForm = this.builder.group({
                title: this.title,
                description: this.description
            });
        }

    ngOnInit() {
        this.minds = this.store.select("minds");
        this.mindsSub = this.minds.subscribe(minds => {
            this.activeMinds = minds.filter(mind =>{
                return !mind.deleted && !mind.done;
            });
            this.deletedMinds = minds.filter(mind => {
                return mind.deleted;
            });
            this.doneMinds = minds.filter(mind => {
                return !mind.deleted && mind.done;
            });
            this.noActiveMind = this.activeMinds.length === 0;
            this.noDeletedMind = this.deletedMinds.length === 0;
            this.noDoneMind = this.doneMinds.length === 0;
        });
        this.ideasLinesService.loadMinds();
    }

    ngOnDestroy() {
        this.mindsSub.unsubscribe();
    }

    onShowActive(e: MouseEvent) {
        e.preventDefault();
        this.goToActive();
    }

    onShowDeleted(e: MouseEvent) {
        e.preventDefault();
        this.goToDeleted();
    }

    onShowDone(e: MouseEvent) {
        e.preventDefault();
        this.gotoDone();
    }

    onShowAddNew(e: MouseEvent) {
        this.goToAddNew();
    }

    onSubmit() {
        if(this.isEditing) {
            let mind = Object.assign({}, this.editingMind, {
                title: this.title.value,
                description: this.description.value
            });
            this.ideasLinesService.updateMind(mind);
            this.isEditing = false;
            this.editingMind = Object.assign({}, INIT_MIND);
        } else {
            let mind = {
                id: "mind" + new Date().getTime(),
                title: this.title.value,
                description: this.description.value,
                deleted: false,
                ideas: {},
                lines: {}
            };
            this.ideasLinesService.addMind(mind);
        }
        this.resetForm();
        this.goToActive();
    }

    onClearTrash(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.ideasLinesService.clearMindTrash();
    }

    onCancel(e: MouseEvent) {
        this.title.reset();
        this.description.reset();
        this.goToActive();
    }

    onDelete(e: MouseEvent, mind: Mind) {
        e.preventDefault();
        e.stopPropagation();
        if(e.shiftKey) {
            this.ideasLinesService.deleteMindForever(mind);
        } else {
            this.ideasLinesService.deleteMind(mind);
        }
    }

    onEdit(e: MouseEvent, mind: Mind) {
        e.preventDefault();
        e.stopPropagation();
        this.isEditing = true;
        this.editingMind = mind;
        this.title.setValue(mind.title);
        this.description.setValue(mind.description);
        this.goToAddNew();
    }

    onDeleteForever(e: MouseEvent, mind: Mind) {
        e.preventDefault();
        e.stopPropagation();
        this.ideasLinesService.deleteMindForever(mind);
    }

    onRecover(e: MouseEvent, mind: Mind) {
        e.preventDefault();
        e.stopPropagation();
        let updatedMind = Object.assign({}, mind, {deleted: false});
        this.ideasLinesService.updateMind(updatedMind);
    }

    onDone(e: MouseEvent, mind: Mind) {
        e.preventDefault();
        e.stopPropagation();
        let doneMind = Object.assign({}, mind, {done: !mind.done});
        this.ideasLinesService.updateMind(doneMind);
    }

    private goToActive() {
        this.showAddNew = false;
        this.showDeleted = false;
        this.showDone = false;
        this.showActive = true;
    }
    private goToDeleted() {
        this.showAddNew = false;
        this.showActive = false;
        this.showDone = false;
        this.showDeleted = true;
    }
    private gotoDone() {
        this.showActive = false;
        this.showAddNew = false;
        this.showDeleted = false;
        this.showDone = true;
    }
    private goToAddNew() {
        this.showActive = false;
        this.showDeleted = false;
        this.showDone = false;
        this.showAddNew = true;
    }
    private resetForm() {
        this.title.reset();
        this.description.reset();
    }
}