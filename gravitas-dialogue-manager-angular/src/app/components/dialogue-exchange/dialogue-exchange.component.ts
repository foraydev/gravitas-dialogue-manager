import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueExchange } from 'src/app/shared/shared-classes';
import { NEW_CONVERSATION, NO_CONDITIONS } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-dialogue-exchange',
  templateUrl: './dialogue-exchange.component.html',
  styleUrls: ['./dialogue-exchange.component.css']
})
export class DialogueExchangeComponent {
  @Input()
  public conversation: DialogueExchange = new DialogueExchange(NEW_CONVERSATION);

  public index = 0;

  public noConditions = NO_CONDITIONS;

  constructor(
    public state: DialogueFileService
  ) {
    this.index = state.conversations.findIndex((value) => { return value.toString() === this.conversation.toString(); }) + 1;
  }

  moveUpDisabled() {
    return this.index <= 1;
  }

  moveDownDisabled() {
    return this.index >= this.state.conversations.length;
  }
}
