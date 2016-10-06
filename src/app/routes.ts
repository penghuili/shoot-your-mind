import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { MindsComponent } from './minds/minds.component';
import { DocListComponent } from './minds/doc-list.component';

export const routes: Routes = [
    {
        path: "", 
        component: HomeComponent, 
        pathMatch: "full"},
    {
        path: "docs",
        children: [
            {path: "", component: DocListComponent},
            {path: ":docId", component: MindsComponent}
        ]
    }
];