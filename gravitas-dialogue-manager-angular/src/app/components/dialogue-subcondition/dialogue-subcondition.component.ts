import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueCondition, DialogueExchange, DialogueSubCondition } from 'src/app/shared/shared-classes';
import { NEW_CONVERSATION } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-dialogue-subcondition',
  templateUrl: './dialogue-subcondition.component.html',
  styleUrls: ['./dialogue-subcondition.component.css']
})
export class DialogueSubconditionComponent {
  @Input()
  public condition: DialogueCondition;

  @Input()
  public subcondition: DialogueSubCondition;

  constructor(
    public state: DialogueFileService
  ) {
    this.condition = new DialogueCondition('New Flag');
    this.subcondition = new DialogueSubCondition('New Flag');
  }
}
