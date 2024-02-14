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

    constructor(exc: DialogueExchangeParseable) {
        this.condition = exc.condition.toStandard();
        this.lines = exc.lines.map(l => l.toStandard());
        this.expanded = true;
    }

    toParseable(): DialogueExchangeParseable {
        return new DialogueExchangeParseable(this);
    }

    duplicate() {
        return new DialogueExchange(this.toParseable());
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

    constructor(line: DialogueLineParseable) {
        this.speakerPicture = new FormControl(line.speakerPicture);
        this.dialogueBox = new FormControl(line.dialogueBox);
        this.dialogue = new FormControl(line.dialogue);
        this.useRightSide = new FormControl(line.useRightSide);
        this.flags = line.flags.map(f => f.toStandard());
        this.id = line.id === 'NULL' ? NodeIdService.getUniqueId() : line.id;
        this.useManualSelectionForBranches = new FormControl(line.useManualSelectionForBranches);
        this.branches = line.branches.map(b => b.toStandard());
    }


    toParseable(): DialogueLineParseable {
        return new DialogueLineParseable(this);
    }

    duplicate() {
        return new DialogueLine(this.toParseable());
    }
}

export class StateFlag {
    public flag: FormControl;
    public value: FormControl;

    constructor(f: StateFlagParseable) {
        this.flag = new FormControl(f.sceneFlag);
        this.value = new FormControl(f.activeValue);
    }

    toParseable() {
        return new StateFlagParseable(this);
    }
}

export class DialogueBranch {
    public optionText: FormControl;
    public condition: DialogueCondition;
    public nextLine: FormControl;

    constructor(b: DialogueBranchParseable) {
        this.optionText = new FormControl(b.optionText);
        this.condition = new DialogueCondition(b.condition);
        this.nextLine = new FormControl(b.nextLine);
    }

    toParseable(): DialogueBranchParseable {
        return new DialogueBranchParseable(this);
    }
}