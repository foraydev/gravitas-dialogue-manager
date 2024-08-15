import { FormControl } from "@angular/forms";
import { NodeIdService } from "./node-id-service";
import { DialogueBranchParseable, DialogueConditionParseable, DialogueExchangeParseable, DialogueLineParseable, StateFlagParseable } from "./shared-classes-parsing";

export class DialogueCondition {
    public conditions: StateFlag[];

    constructor(cond: DialogueConditionParseable) {
        this.conditions = cond.conditions.map(c => c.toStandard());
    }

    toParseable(): DialogueConditionParseable{
        return new DialogueConditionParseable(this);
    }
}

export class DialogueExchange {
    public condition: DialogueCondition;
    public lines: DialogueLine[];
    public expanded: boolean;
    public index: number;

    constructor(exc: DialogueExchangeParseable) {
        this.condition = exc.condition.toStandard();
        this.lines = exc.lines.map(l => l.toStandard());
        this.expanded = true;
        this.index = 0;
    }

    toParseable(): DialogueExchangeParseable {
        return new DialogueExchangeParseable(this);
    }

    duplicate() {
        const newConversation = new DialogueExchange(this.toParseable());
        let idMap: string[][] = [];
        let currentId: string = '';
        // work backwards through the list
        // as we pass each node, if we find a target id that we've already updated, update it to the new one
        for (let i = newConversation.lines.length - 1; i >= 0; i--) {
            let previousId = newConversation.lines[i].id;
            currentId = NodeIdService.getUniqueId();
            idMap.push([previousId, currentId]);
            newConversation.lines[i].id = currentId;
            newConversation.lines[i].branches.forEach((b) => {
                idMap.forEach((id) => {
                    if (b.nextLine.value == id[0]) {
                        b.nextLine.patchValue(id[1]);
                    }
                });
            });
        }
        return newConversation;
    }
}

export class DialogueLine {
    public speakerPicture: FormControl;
    public dialogueBox: FormControl;
    public dialogue: FormControl;
    public useRightSide: FormControl;
    public flags: StateFlag[];
    public id: string;
    public useManualSelectionForBranches: FormControl;
    public branches: DialogueBranch[];
    public index: number;

    constructor(line: DialogueLineParseable) {
        this.speakerPicture = new FormControl(line.speakerPicture);
        this.dialogueBox = new FormControl(line.dialogueBox);
        this.dialogue = new FormControl(line.dialogue);
        this.useRightSide = new FormControl(line.useRightSide);
        this.flags = line.flags.map(f => f.toStandard());
        this.id = line.id === 'NULL' ? NodeIdService.getUniqueId() : line.id;
        this.useManualSelectionForBranches = new FormControl(line.useManualSelectionForBranches);
        this.branches = line.branches.map(b => b.toStandard());
        this.index = 0;
    }


    toParseable(): DialogueLineParseable {
        return new DialogueLineParseable(this);
    }

    duplicate() {
        const newLine = new DialogueLine(this.toParseable());
        let newId: string = NodeIdService.getUniqueId();
        newLine.id = newId;
        return newLine;
    }
}

export class StateFlag {
    public flag: FormControl;
    public value: FormControl;
    public index: number;

    constructor(f: StateFlagParseable) {
        this.flag = new FormControl(f.sceneFlag);
        this.value = new FormControl(f.activeValue);
        this.index = 0;
    }

    toParseable() {
        return new StateFlagParseable(this);
    }
}

export class DialogueBranch {
    public optionText: FormControl;
    public condition: DialogueCondition;
    public nextLine: FormControl;
    public index: number;

    constructor(b: DialogueBranchParseable) {
        this.optionText = new FormControl(b.optionText);
        this.condition = new DialogueCondition(b.condition);
        this.nextLine = new FormControl(b.nextLine);
        this.index = 0;
    }

    toParseable(): DialogueBranchParseable {
        return new DialogueBranchParseable(this);
    }
}