import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueLine, StateFlag } from 'src/app/shared/shared-classes';
import { NEW_LINE } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-state-flag',
  templateUrl: './state-flag.component.html',
  styleUrls: ['./state-flag.component.css']
})
export class StateFlagComponent {

  @Input()
  public flag: StateFlag = new StateFlag('');

  @Input()
  public line: DialogueLine = new DialogueLine(NEW_LINE, false);

  constructor(
    public state: DialogueFileService
  ) {}
}
