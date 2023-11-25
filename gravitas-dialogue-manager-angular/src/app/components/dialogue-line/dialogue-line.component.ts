import { Component, Input } from '@angular/core';
import { DialogueFileService } from 'src/app/shared/dialogue-file.service';
import { DialogueExchange, DialogueLine } from 'src/app/shared/shared-classes';
import { DIALOGUE_BUBBLE_OPTIONS, NEW_CONVERSATION, NEW_LINE, NO_FLAGS } from 'src/app/shared/shared-constants';

@Component({
  selector: 'app-dialogue-line',
  templateUrl: './dialogue-line.component.html',
  styleUrls: ['./dialogue-line.component.css']
})
export class DialogueLineComponent {
  @Input()
  public line: DialogueLine = new DialogueLine(NEW_LINE);

  @Input()
  public conversation: DialogueExchange = new DialogueExchange(NEW_CONVERSATION);

  public dialogueOptions = DIALOGUE_BUBBLE_OPTIONS;

  public noFlags = NO_FLAGS;

  constructor(
    public state: DialogueFileService
  ) {}

  public moveUpDisabled() {
    let indexOfCurrent = this.conversation.lines.findIndex((value) => {value === this.line});
    return indexOfCurrent <= 0;
  }

  public moveDownDisabled() {
    let indexOfCurrent = this.conversation.lines.findIndex((value) => {value === this.line});
    return indexOfCurrent >= this.conversation.lines.length - 1;
  }
}
