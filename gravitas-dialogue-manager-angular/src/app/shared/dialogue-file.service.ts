import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogueBranch, DialogueCondition, DialogueExchange, DialogueLine, DialogueSubCondition, StateFlag } from './shared-classes';
import { NEW_BRANCH, NEW_CONVERSATION, NEW_LINE } from './shared-constants';
import { NodeIdService } from './node-id-service';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class DialogueFileService {

  currentMenu = "upload";
  errorMessage = '';
  conversations: DialogueExchange[] = [
    new DialogueExchange(NEW_CONVERSATION.replace('{ID}', NodeIdService.getUniqueId()))
  ];

  characterName: FormControl = new FormControl('');
  fileUploader: FormControl = new FormControl(null);

  fileName: string = '';

  constructor(public validation: ValidationService) {}

  public onFileUpload(event: Event) {
    if (event !== null) {
      // @ts-ignore: throws error due to potentially null event, even though event can't be null when reaching this point
      const file = (event.target as HTMLInputElement).files[0];
      this.parseFileUpload(file);
    }
  }

  public createNewDialogue() {
    NodeIdService.reset();
    this.conversations = [];
    this.conversations.push(new DialogueExchange(NEW_CONVERSATION.replace('{ID}', NodeIdService.getUniqueId())));
    this.characterName.patchValue("New Character");
    this.currentMenu = 'edit';
  }

  public parseFileUpload(event: any) {
    this.conversations = [];
    let file = event.target.files[0];
    console.log(event);
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
    this.currentMenu = 'mode';
  }

  public exportDialogueFile() {
    this.errorMessage = this.validation.fileIsValid(this.conversations) ? 'no-error' : 'Some components contain errors. Please resolve before exporting.';
    if (this.errorMessage === "no-error") {
        const link = document.createElement("a");
        const content = this.formatForExport();
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

  // validates that a given id will chain into a real dialogue entry (i.e. has not been deleted)
  public checkTargetIsValid(id: string) {
    for (let c = 0; c < this.conversations.length; c++) {
      for (let l = 0; l < this.conversations[c].lines.length; l++) {
        if (this.conversations[c].lines[l].id === id) { return true; }
      }
    }
    return false;
  }

  // CONVERSATION OPERATIONS
  public addConversation() {
    this.conversations.push(new DialogueExchange(NEW_CONVERSATION.replace('{CHARACTER}', this.characterName.value.toLowerCase()).replace('{ID}', NodeIdService.getUniqueId())));
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
    let oldLastLine = conversation.lines[conversation.lines.length - 1];
    let newLen = conversation.lines.push(new DialogueLine(NEW_LINE.replace('{CHARACTER}', this.characterName.value.toLowerCase()), true));
    let newLine = conversation.lines[newLen - 1];
    if (oldLastLine.branches.length === 0) {
      this.addDialogueBranch(oldLastLine);
    }
    if (oldLastLine.branches.length === 1) {
      oldLastLine.branches[0].nextLine.patchValue(newLine.id);
    }
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
  public addDialogueCondition(condition: DialogueCondition) {
    condition.conditions.push(new DialogueSubCondition('New Flag'));
  }

  public removeDialogueCondition(condition: DialogueCondition, flag: DialogueSubCondition) {
    let indexToRemove = condition.conditions.findIndex((value) => {value.toString() === flag.toString()});
    condition.conditions.splice(indexToRemove, 1);
  }

  // DIALOGUE BRANCH OPTIONS
  public addDialogueBranch(line: DialogueLine) {
    line.branches.push(new DialogueBranch(NEW_BRANCH.replace('{ID}', '')));
  }

  public removeDialogueBranch(line: DialogueLine, branch: DialogueBranch) {
    let indexToRemove = line.branches.findIndex((value) => {value.toString() === branch.toString()});
    line.branches.splice(indexToRemove, 1);
  }
}
