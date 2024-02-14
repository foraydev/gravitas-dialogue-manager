import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueCondition, DialogueExchange, StateFlag } from 'src/app/shared/shared-classes';
import { NEW_CONDITION, NEW_CONVERSATION, NEW_FLAG } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-dialogue-subcondition',
  templateUrl: './dialogue-subcondition.component.html',
  styleUrls: ['./dialogue-subcondition.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class DialogueSubconditionComponent {
  @Input()
  public condition: DialogueCondition;

  @Input()
  public subcondition: StateFlag;

  constructor(
    public state: DialogueFileService
  ) {
    this.condition = new DialogueCondition(NEW_CONDITION);
    this.subcondition = new StateFlag(NEW_FLAG);
  }
}
