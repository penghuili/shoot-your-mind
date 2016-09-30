import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store'; 

import { ideasReducer, linesReducer } from './shared/reducers';
import { IdeasLinesService } from './shared/ideas-lines.service';
import { UtilsService } from './shared/utils.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MindsComponent } from './minds/minds.component';
import { MindsSidebarComponent } from './minds/minds-sidebar.component';
import { MindsContentComponent } from './minds/minds-content.component';
import { IdeaComponent } from './minds/idea.component';
import { NewIdeaComponent } from './minds/new-idea.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MindsComponent,
    MindsSidebarComponent,
    MindsContentComponent,
    IdeaComponent,
    NewIdeaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    StoreModule.provideStore({ideas: ideasReducer, lines: linesReducer})
  ],
  providers: [
    IdeasLinesService,
    UtilsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
