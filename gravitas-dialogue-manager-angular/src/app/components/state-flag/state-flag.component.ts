import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueLine, StateFlag } from 'src/app/shared/shared-classes';
import { NEW_FLAG, NEW_LINE } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-state-flag',
  templateUrl: './state-flag.component.html',
  styleUrls: ['./state-flag.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class StateFlagComponent {

  @Input()
  public flag: StateFlag = new StateFlag(NEW_FLAG);

  @Input()
  public line: DialogueLine = new DialogueLine(NEW_LINE);

  constructor(
    public state: DialogueFileService
  ) {}
}
