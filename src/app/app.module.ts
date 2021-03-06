import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store'; 
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { routes } from './routes';

import { 
  ideasReducer, 
  linesReducer,
  mindsReducer,
  selectedIdeaHistoryReducer,
  appConfigReducer
} from './shared/reducers';
import { IdeasLinesService } from './shared/ideas-lines.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MindDetailComponent } from './minds/mind-detail.component';
import { MindListComponent } from './minds/mind-list.component';
import { MindMapComponent } from './minds/mind-map.component';
import { IdeaComponent } from './minds/idea.component';
import { NewIdeaComponent } from './minds/new-idea.component';
import { CanvasComponent } from './minds/canvas.component';
import { SymFooterComponent } from './shared/sym-footer/sym-footer.component';
import { HistoryCardComponent } from './minds/history-card.component';
import { HistoryListComponent } from './minds/history-list.component';
import { AboutMeComponent } from './about/about-me.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MindDetailComponent,
    MindListComponent,
    MindMapComponent,
    IdeaComponent,
    NewIdeaComponent,
    CanvasComponent,
    SymFooterComponent,
    HistoryCardComponent,
    HistoryListComponent,
    AboutMeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    StoreModule.provideStore({
      ideas: ideasReducer, 
      lines: linesReducer,
      minds: mindsReducer,
      selectedIdeaHistory: selectedIdeaHistoryReducer,
      appConfig: appConfigReducer
    })
  ],
  providers: [
    IdeasLinesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
