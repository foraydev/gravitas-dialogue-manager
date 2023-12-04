import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogueBranch, DialogueCondition, DialogueExchange, DialogueLine, DialogueSubCondition, StateFlag } from './shared-classes';
import { NEW_BRANCH, NEW_CONVERSATION, NEW_LINE } from './shared-constants';
import { NodeIdService } from './node-id-service';
import { DialogueFileService } from './dialogue-file.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  public fileIsValid(conversations: DialogueExchange[]) {
    let fileValid = true;
    conversations.forEach((conversation) => {
        if (this.exchangeErrorMessage(conversation) !== '') {
            fileValid = false;
        }
        conversation.lines.forEach((line) => {
            if (this.lineErrorMessage(line) !== '') {
                fileValid = false;
            }
            line.branches.forEach((branch) => {
                if (this.branchErrorMessage(branch, line, conversations) !== '') {
                    fileValid = false;
                }
            });
        });
    });
    return fileValid;
  }

  public exchangeErrorMessage(exchange: DialogueExchange): string {
    let numOfEnds = 0;
    exchange.lines.forEach((line) => {
        if (line.branches.length === 0) {
            numOfEnds++;
        }
    });
    if (numOfEnds === 0) {
        return 'This conversation has no ending node.';
    }
    return '';
  }

  public lineErrorMessage(line: DialogueLine): string {
    if (line.useManualSelectionForBranches.value && line.branches.length < 2) {
        return line.branches.length === 0 ? 'No options given for user input.' : 'Only one option given for user input.';
    }
    if (line.branches.length > 0) {
        let branchesValid = false;
        for (let i = 0; i < line.branches.length; i++) {
            if (line.branches[i].condition.conditions.length === 0) { branchesValid = true; }
        }
        if (!branchesValid) { return 'No default branch.'; }
    }
    return '';
  }

  public branchErrorMessage(branch: DialogueBranch, line: DialogueLine, conversations: DialogueExchange[]): string {
    let id = branch.nextLine.value;
    if (id === line.id) {
      return 'This branch leads to its own dialogue line.';
    }
    if (!this.idLeadsToValidNode(conversations, id)) {
      return 'ID ' + id + ' is not valid.';
    }
    return '';
  }

  private idLeadsToValidNode(conversations: DialogueExchange[], id: string) {
    for (let c = 0; c < conversations.length; c++) {
        for (let l = 0; l < conversations[c].lines.length; l++) {
          if (conversations[c].lines[l].id === id) { return true; }
        }
      }
      return false;
  }
}