import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueExchange } from 'src/app/shared/shared-classes';
import { NEW_CONVERSATION, NO_CONDITIONS } from 'src/app/shared/shared-constants';
import { ValidationService } from 'src/app/shared/validation.service';
import { DialogueSubconditionComponent } from '../dialogue-subcondition/dialogue-subcondition.component';
import { DialogueLineComponent } from '../dialogue-line/dialogue-line.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialogue-exchange',
  templateUrl: './dialogue-exchange.component.html',
  styleUrls: ['./dialogue-exchange.component.css'],
  standalone: true,
  imports: [
    DialogueSubconditionComponent,
    DialogueLineComponent,
    CommonModule
  ]
})
export class DialogueExchangeComponent {
  @Input()
  public conversation: DialogueExchange = new DialogueExchange(NEW_CONVERSATION);

  public noConditions = NO_CONDITIONS;

  constructor(
    public state: DialogueFileService,
    public validation: ValidationService
  ) {
  }

  moveUpDisabled() {
    return this.conversation.index <= 1;
  }

  moveDownDisabled() {
    return this.conversation.index >= this.state.conversations.length;
  }
}
