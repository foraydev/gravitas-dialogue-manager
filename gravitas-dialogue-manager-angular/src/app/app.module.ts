import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DialogueExchangeComponent } from './components/dialogue-exchange/dialogue-exchange.component';
import { DialogueLineComponent } from './components/dialogue-line/dialogue-line.component';
import { DialogueBranchComponent } from './components/dialogue-branch/dialogue-branch.component';
import { DialogueConditionComponent } from './components/dialogue-condition/dialogue-condition.component';
import { DialogueSubconditionComponent } from './components/dialogue-subcondition/dialogue-subcondition.component';
import { StateFlagComponent } from './components/state-flag/state-flag.component';
import { EditMenuComponent } from './screens/edit-menu/edit-menu.component';
import { FileUploadComponent } from './screens/file-upload/file-upload.component';
import { TranslateMenuComponent } from './screens/translate-menu/translate-menu.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModeMenuComponent } from './screens/mode-menu/mode-menu.component';

@NgModule({
    declarations: [
        AppComponent,
        FileUploadComponent,
        TranslateMenuComponent,
        DialogueConditionComponent,
        ModeMenuComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        EditMenuComponent
    ]
})
export class AppModule { }
