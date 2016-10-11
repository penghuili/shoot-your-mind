import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { MindDetailComponent } from './minds/mind-detail.component';
import { MindsListComponent } from './minds/minds-list.component';

export const routes: Routes = [
    {
        path: "", 
        component: HomeComponent, 
        pathMatch: "full"},
    {
        path: "minds",
        children: [
            {path: "", component: MindsListComponent},
            {path: ":mindId", component: MindDetailComponent}
        ]
    }
];