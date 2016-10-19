import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { MindDetailComponent } from './minds/mind-detail.component';
import { MindListComponent } from './minds/mind-list.component';
import { AboutMeComponent } from './about/about-me.component';

export const routes: Routes = [
    {
        path: "about",
        component: AboutMeComponent
    },
    {
        path: "minds",
        children: [
            {path: "", component: MindListComponent},
            {path: ":mindId", component: MindDetailComponent}
        ]
    },
    {
        path: "", 
        component: HomeComponent, 
        pathMatch: "full"
    },
];