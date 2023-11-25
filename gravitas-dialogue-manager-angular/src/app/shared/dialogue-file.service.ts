import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogueExchange, DialogueLine, DialogueSubCondition, StateFlag } from './shared-classes';
import { NEW_CONVERSATION, NEW_LINE } from './shared-constants';

@Injectable({
  providedIn: 'root'
})
export class DialogueFileService {

  currentMenu = "edit";
  errorMessage = '';
  conversations: DialogueExchange[] = [
    new DialogueExchange(NEW_CONVERSATION)
  ];

  characterName: FormControl = new FormControl('');
  fileUploader: FormControl = new FormControl(null);

  fileName: string = '';

  constructor() { }

  public onFileUpload(event: Event) {
    if (event !== null) {
      // @ts-ignore: throws error due to potentially null event, even though event can't be null when reaching this point
      const file = (event.target as HTMLInputElement).files[0];
      this.parseFileUpload(file);
    }
  }

  private parseFileUpload(file: File) {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (reader.result && typeof reader.result === 'string') {
        reader.result.replace("\n", "").split("{[interaction]}").forEach(element => {
          this.conversations.push(new DialogueExchange(element));
        });
      }
    }, false);

    if (file) {
      this.fileName = file.name;
      this.characterName.patchValue(file.name.replace("dialogue-", "").replace(".txt", ""));
      reader.readAsText(file);
    }
    this.goToMenu("mode-page");
  }

  private checkDialogueFile() {
    let numOfDefaults = 0;
    this.conversations.forEach(element => {
        if (element.condition.conditions.length == 0) {
            numOfDefaults++;
        }
    });
    if (numOfDefaults == 0) {
        return "You don't have a default conversation. Make sure you add one before exporting.";
    }
    if (numOfDefaults > 1) {
        return 'You have '+numOfDefaults+' default conversations, but you should only have one.';
    }
    if (this.conversations[this.conversations.length-1].condition.conditions.length != 0) {
        return 'Your default conversation is not at the bottom. Make sure that the default conversation is at the bottom before exporting.';
    }
    return 'no-error';
  }

  public exportDialogueFile() {
    this.errorMessage = this.checkDialogueFile();
    if (this.errorMessage === "no-error") {
        const link = document.createElement("a");
        const content = this.formatForExport();
        console.log(content);
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = 'dialogue-'+this.characterName.value.toLowerCase().replace(" ", "-")+'.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }
  }

  private formatForExport() {
    let retStr = "";
    for (let exchange = 0; exchange < this.conversations.length; exchange++) {
        retStr += this.conversations[exchange].toString();
        if (exchange < this.conversations.length - 1) {
            retStr += "{[interaction]}";
        }
    }
    return retStr;
  }

  private formatDialogueForTranslation(dialogueLine: string) {
    let retStr = dialogueLine;
    retStr.match(/<link.*\/link>/)?.forEach(element => {
        let insideText = element.substring(element.indexOf('">')+2, element.indexOf('</link>'));
        retStr = retStr.replace(element, insideText);
    });
    return retStr;
  }

  public goToMenu(menuName: string) {
    this.currentMenu = menuName;
  }

  // CONVERSATION OPERATIONS
  public addConversation() {
    this.conversations.push(new DialogueExchange(NEW_CONVERSATION.replace('{CHARACTER}', this.characterName.value.toLowerCase())));
  }

  public removeConversation(conversation: DialogueExchange) {
    let indexToRemove = this.conversations.findIndex((value) => {return value.toString() === conversation.toString();});
    this.conversations.splice(indexToRemove, 1);
  }

  public moveConversationUp(conversation: DialogueExchange) {
    let indexOfCurrent = this.conversations.findIndex((value) => {return value.toString() === conversation.toString();});
    if (indexOfCurrent > 0) {
      this.conversations.splice(indexOfCurrent, 1);
      this.conversations.splice(indexOfCurrent-1, 0, conversation);
    }
  }

  public moveConversationDown(conversation: DialogueExchange) {
    let indexOfCurrent = this.conversations.findIndex((value) => {value.toString() === conversation.toString(); });
    if (indexOfCurrent < this.conversations.length - 1) {
      this.conversations.splice(indexOfCurrent, 1);
      this.conversations.splice(indexOfCurrent+1, 0, conversation);
    }
  }

  public duplicateConversation(conversation: DialogueExchange) {
    let indexOfCurrent = this.conversations.findIndex((value) => {return value.toString() === conversation.toString(); });
    this.conversations.splice(indexOfCurrent, 0, conversation.duplicate());
  }

  public setExpanded(conversation: DialogueExchange, value: boolean) {
    conversation.expanded = value;
  }

  // LINE OPTIONS
  public addLine(conversation: DialogueExchange) {
    conversation.lines.push(new DialogueLine(NEW_LINE.replace('{CHARACTER}', this.characterName.value.toLowerCase())));
  }

  public removeLine(conversation: DialogueExchange, line: DialogueLine) {
    let indexToRemove = conversation.lines.findIndex((value) => {return value.toString() === line.toString(); });
    conversation.lines.splice(indexToRemove, 1);
  }

  public moveLineUp(conversation: DialogueExchange, line: DialogueLine) {
    let indexOfCurrent = conversation.lines.findIndex((value) => {return value.toString() === line.toString(); });
    if (indexOfCurrent > 0) {
      conversation.lines.splice(indexOfCurrent, 1);
      conversation.lines.splice(indexOfCurrent-1, 0, line);
    }
  }

  public moveLineDown(conversation: DialogueExchange, line: DialogueLine) {
    let indexOfCurrent = conversation.lines.findIndex((value) => {return value.toString() === line.toString(); });
    if (indexOfCurrent > 0) {
      conversation.lines.splice(indexOfCurrent, 1);
      conversation.lines.splice(indexOfCurrent+1, 0, line);
    }
  }

  public duplicateLine(conversation: DialogueExchange, line: DialogueLine) {
    let indexOfCurrent = conversation.lines.findIndex((value) => {value.toString() === line.toString()});
    conversation.lines.splice(indexOfCurrent, 0, line.duplicate());
  }

  // STATE FLAG OPTIONS
  public addStateFlag(line: DialogueLine) {
    line.flags.push(new StateFlag('New Flag'));
  }

  public removeStateFlag(line: DialogueLine, flag: StateFlag) {
    let indexToRemove = line.flags.findIndex((value) => {value.toString() === flag.toString()});
    line.flags.splice(indexToRemove, 1);
  }

  // DIALOGUE CONDITION OPTIONS
  public addDialogueCondition(conversation: DialogueExchange) {
    conversation.condition.conditions.push(new DialogueSubCondition('New Flag'));
  }

  public removeDialogueCondition(conversation: DialogueExchange, flag: DialogueSubCondition) {
    let indexToRemove = conversation.condition.conditions.findIndex((value) => {value.toString() === flag.toString()});
    conversation.condition.conditions.splice(indexToRemove, 1);
  }
}
