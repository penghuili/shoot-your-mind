import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store'; 
import { RouterModule } from '@angular/router';

import { routes } from './routes';

import { 
  ideasReducer, 
  linesReducer,
  docsReducer
} from './shared/reducers';
import { IdeasLinesService } from './shared/ideas-lines.service';
import { UtilsService } from './shared/utils.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MindsComponent } from './minds/minds.component';
import { DocListComponent } from './minds/doc-list.component';
import { MindMapComponent } from './minds/mind-map.component';
import { IdeaComponent } from './minds/idea.component';
import { NewIdeaComponent } from './minds/new-idea.component';
import { CanvasComponent } from './minds/canvas.component';
import { DocCardComponent } from './minds/doc-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MindsComponent,
    DocListComponent,
    MindMapComponent,
    IdeaComponent,
    NewIdeaComponent,
    CanvasComponent,
    DocCardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    StoreModule.provideStore({
      ideas: ideasReducer, 
      lines: linesReducer,
      docs: docsReducer
    })
  ],
  providers: [
    IdeasLinesService,
    UtilsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
