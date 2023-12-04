import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueBranch, DialogueLine } from 'src/app/shared/shared-classes';
import { NEW_BRANCH, NEW_LINE } from 'src/app/shared/shared-constants';
import { ValidationService } from 'src/app/shared/validation.service';

@Component({
  selector: 'app-dialogue-branch',
  templateUrl: './dialogue-branch.component.html',
  styleUrls: ['./dialogue-branch.component.css']
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
    this.line = new DialogueLine(NEW_LINE, false);
  }
}
