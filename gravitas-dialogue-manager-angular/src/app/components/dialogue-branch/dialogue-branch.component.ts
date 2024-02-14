import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueBranch, DialogueLine } from 'src/app/shared/shared-classes';
import { NEW_BRANCH, NEW_LINE } from 'src/app/shared/shared-constants';
import { ValidationService } from 'src/app/shared/validation.service';
import { StateFlagComponent } from '../state-flag/state-flag.component';
import { DialogueSubconditionComponent } from "../dialogue-subcondition/dialogue-subcondition.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-dialogue-branch',
    templateUrl: './dialogue-branch.component.html',
    styleUrls: ['./dialogue-branch.component.css'],
    standalone: true,
    imports: [
        StateFlagComponent,
        DialogueSubconditionComponent,
        CommonModule,
        ReactiveFormsModule
    ]
})
export class DialogueBranchComponent {
  @Input()
  public branch: DialogueBranch;

  @Input()
  public line: DialogueLine;

  constructor(
    public state: DialogueFileService,
    public validation: ValidationService
  ) {
    this.branch = new DialogueBranch(NEW_BRANCH);
    this.line = new DialogueLine(NEW_LINE);
  }
}
