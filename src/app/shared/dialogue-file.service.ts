import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogueBranch, DialogueCondition, DialogueExchange, DialogueLine, StateFlag } from './shared-classes';
import { NEW_BRANCH, NEW_CONVERSATION, NEW_FLAG, NEW_LINE } from './shared-constants';
import { NodeIdService } from './node-id-service';
import { ValidationService } from './validation.service';
import { DialogueBranchParseable, DialogueConditionParseable, DialogueExchangeParseable, DialogueLineParseable, StateFlagParseable } from './shared-classes-parsing';

@Injectable({
  providedIn: 'root'
})
export class DialogueFileService {

  currentMenu = "upload";
  errorMessage = '';
  conversations: DialogueExchange[] = [
    new DialogueExchange(NEW_CONVERSATION)
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

  public regenerateId(currentId: string) {
    const newId: string = NodeIdService.getUniqueId();
    this.conversations.forEach((c) => {
      c.lines.forEach((l) => {
        if (l.id == currentId) {
          l.id = newId;
        }
        l.branches.forEach((b) => {
          if (b.nextLine.value == currentId) {
            b.nextLine.patchValue(newId);
          }
        });
      });
    });
    NodeIdService.deregister(currentId);
  }

  public createNewDialogue() {
    NodeIdService.reset();
    this.conversations = [];
    this.conversations.push(new DialogueExchange(NEW_CONVERSATION));
    this.characterName.patchValue("New Character");
    this.currentMenu = 'edit';
  }

  correctParsedExchanges(conversations: DialogueExchangeParseable[]): DialogueExchangeParseable[] {
    let retVal: DialogueExchangeParseable[] = [];
    conversations.forEach((conversation: DialogueExchangeParseable) => {
      let correctedExchange: DialogueExchangeParseable = {
        ...NEW_CONVERSATION,
        ...conversation,
        toStandard: function (): DialogueExchange {
          return new DialogueExchange(this);
        }
      };
      let correctedCondition: DialogueConditionParseable = {
        ...conversation.condition,
        toStandard: function (): DialogueCondition {
          return new DialogueCondition(this);
        }
      };
      let correctedConditions: StateFlagParseable[] = [];
      let correctedLines: DialogueLineParseable[] = [];
      conversation.condition.conditions.forEach((flag: StateFlagParseable) => {
        let correctedFlag: StateFlagParseable = {
          ...NEW_FLAG,
          ...flag,
          toStandard: function (): StateFlag {
            return new StateFlag(this);
          }
        };
        correctedConditions.push(correctedFlag);
      });
      correctedCondition.conditions = correctedConditions;
      correctedExchange.condition = correctedCondition;
      conversation.lines.forEach((line: DialogueLineParseable) => {
        let correctedLine: DialogueLineParseable = {
          ...NEW_LINE,
          ...line,
          toStandard: function (): DialogueLine {
            return new DialogueLine(this);
          }
        };
        let correctedFlags: StateFlagParseable[] = [];
        line.flags.forEach((flag: StateFlagParseable) => {
          let correctedFlag: StateFlagParseable = {
            ...NEW_FLAG,
            ...flag,
            toStandard: function (): StateFlag {
              return new StateFlag(this);
            }
          };
          correctedFlags.push(correctedFlag);
        });
        correctedLine.flags = correctedFlags;
        let correctedBranches: DialogueBranchParseable[] = [];
        line.branches.forEach((branch: DialogueBranchParseable) => {
          let correctedBranch: DialogueBranchParseable = {
            ...NEW_BRANCH,
            ...branch,
            toStandard: function (): DialogueBranch {
              return new DialogueBranch(this);
            }
          };
          let correctedBranchCondition: DialogueConditionParseable = {
            ...conversation.condition,
            toStandard: function (): DialogueCondition {
              return new DialogueCondition(this);
            }
          };
          let correctedBranchConditions: StateFlagParseable[] = [];
          branch.condition.conditions.forEach((flag: StateFlagParseable) => {
            let correctedBranchCondition: StateFlagParseable = {
              ...NEW_FLAG,
              ...flag,
              toStandard: function (): StateFlag {
                return new StateFlag(this);
              }
            };
            correctedBranchConditions.push(correctedBranchCondition);
          });
          correctedBranchCondition.conditions = correctedBranchConditions;
          correctedBranch.condition = correctedBranchCondition;
          correctedBranches.push(correctedBranch);
        });
        correctedLine.branches = correctedBranches;
        correctedLines.push(correctedLine);
      });
      correctedExchange.lines = correctedLines;
      retVal.push(correctedExchange);
    });
    return retVal;
  }

  public parseFileUpload(event: any) {
    this.conversations = [];
    let file = event.target.files[0];
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (reader.result && typeof reader.result === 'string') {
        let temp: DialogueExchangeParseable[] = JSON.parse(reader.result);
        let temp2: DialogueExchangeParseable[] = this.correctParsedExchanges(temp);
        this.conversations = temp2.map(c => c.toStandard());
        // update the indeces for easy and accurate updates
        this.reindex();
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
    return JSON.stringify(this.conversations.map(c => c.toParseable()));
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

  private reindex() {
    for (let c = 0; c < this.conversations.length; c++) {
      this.conversations[c].index = c;
      for (let cf = 0; cf < this.conversations[c].condition.conditions.length; cf++) {
        this.conversations[c].condition.conditions[cf].index = cf;
      }
      for (let l = 0; l < this.conversations[c].lines.length; l++) {
        this.conversations[c].lines[l].index = l;
        for (let sf = 0; sf < this.conversations[c].lines[l].flags.length; sf++) {
          this.conversations[c].lines[l].flags[sf].index = sf;
        }
        for (let b = 0; b < this.conversations[c].lines[l].branches.length; b++) {
          this.conversations[c].lines[l].branches[b].index = b;
          for (let bf = 0; bf < this.conversations[c].lines[l].branches[b].condition.conditions.length; bf++) {
            this.conversations[c].lines[l].branches[b].condition.conditions[bf].index = bf;
          }
        }
      }
    }
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
    const exc = new DialogueExchange(NEW_CONVERSATION);
    exc.lines[0].speakerPicture.patchValue(exc.lines[0].speakerPicture.value.replace("{DEFAULT}", this.characterName.value));
    this.conversations.push(exc);
    this.reindex();
  }

  public removeConversation(conversation: DialogueExchange) {
    let indexToRemove = conversation.index;
    this.conversations.splice(conversation.index, 1);
    this.reindex();
  }

  public moveConversationUp(conversation: DialogueExchange) {
    let i = conversation.index;
    if (i > 0) {
      this.conversations.splice(i, 1);
      this.conversations.splice(i-1, 0, conversation);
    }
    this.reindex();
  }

  public moveConversationDown(conversation: DialogueExchange) {
    let i = conversation.index;
    if (i < this.conversations.length - 1) {
      this.conversations.splice(i, 1);
      this.conversations.splice(i+1, 0, conversation);
    }
    this.reindex();
  }

  public duplicateConversation(conversation: DialogueExchange) {
    let i = conversation.index;
    this.conversations.splice(i+1, 0, conversation.duplicate());
    this.reindex();
  }

  public setExpanded(conversation: DialogueExchange, value: boolean) {
    conversation.expanded = value;
  }

  // LINE OPTIONS
  public addLine(conversation: DialogueExchange) {
    let oldLastLine = conversation.lines[conversation.lines.length - 1];
    const line = new DialogueLine(NEW_LINE);
    line.speakerPicture.patchValue(line.speakerPicture.value.replace("{DEFAULT}", this.characterName.value));
    let newLen = conversation.lines.push(line);
    let newLine = conversation.lines[newLen - 1];
    if (oldLastLine.branches.length === 0) {
      this.addDialogueBranch(oldLastLine);
    }
    if (oldLastLine.branches.length === 1) {
      oldLastLine.branches[0].nextLine.patchValue(newLine.id);
    }
    this.reindex();
  }

  public removeLine(conversation: DialogueExchange, line: DialogueLine) {
    let indexToRemove = line.index;
    NodeIdService.deregister(conversation.lines[indexToRemove].id);
    conversation.lines.splice(indexToRemove, 1);
    this.reindex();
  }

  public moveLineUp(conversation: DialogueExchange, line: DialogueLine) {
    let i = line.index;
    if (i > 0) {
      conversation.lines.splice(i, 1);
      conversation.lines.splice(i-1, 0, line);
    }
    this.reindex();
  }

  public moveLineDown(conversation: DialogueExchange, line: DialogueLine) {
    let i = line.index;
    if (i < conversation.lines.length - 1) {
      conversation.lines.splice(i, 1);
      conversation.lines.splice(i+1, 0, line);
    }
    this.reindex();
  }

  public duplicateLine(conversation: DialogueExchange, line: DialogueLine) {
    let indexOfCurrent = line.index;
    conversation.lines.splice(indexOfCurrent+1, 0, line.duplicate());
    this.reindex();
  }

  // STATE FLAG OPTIONS
  public addStateFlag(line: DialogueLine) {
    line.flags.push(new StateFlag(NEW_FLAG));
    this.reindex();
  }

  public removeStateFlag(line: DialogueLine, flag: StateFlag) {
    let indexToRemove = line.flags.findIndex((value) => {value.toString() === flag.toString()});
    line.flags.splice(indexToRemove, 1);
    this.reindex();
  }

  // DIALOGUE CONDITION OPTIONS
  public addDialogueCondition(condition: DialogueCondition) {
    condition.conditions.push(new StateFlag(NEW_FLAG));
    this.reindex();
  }

  public removeDialogueCondition(condition: DialogueCondition, flag: StateFlag) {
    let indexToRemove = condition.conditions.findIndex((value) => {value.toString() === flag.toString()});
    condition.conditions.splice(indexToRemove, 1);
    this.reindex();
  }

  // DIALOGUE BRANCH OPTIONS
  public addDialogueBranch(line: DialogueLine) {
    line.branches.push(new DialogueBranch(NEW_BRANCH));
    this.reindex();
  }

  public removeDialogueBranch(line: DialogueLine, branch: DialogueBranch) {
    let indexToRemove = line.branches.findIndex((value) => {value.toString() === branch.toString()});
    line.branches.splice(indexToRemove, 1);
    this.reindex();
  }
}
