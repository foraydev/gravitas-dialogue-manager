import { FormControl } from "@angular/forms";
import { NodeIdService } from "./node-id-service";
import { DialogueCondition, DialogueExchange, DialogueBranch, DialogueLine, StateFlag } from "./shared-classes";

export class DialogueConditionParseable {
    public conditions: StateFlagParseable[];

    constructor(condition: DialogueCondition) {
        this.conditions = condition.conditions.map(f => f.toParseable());
    }

    toStandard(): DialogueCondition {
        return new DialogueCondition(this);
    }
}

export class DialogueExchangeParseable {
    public condition: DialogueConditionParseable;
    public lines: DialogueLineParseable[];

    constructor(exc: DialogueExchange) {
        this.condition = exc.condition.toParseable();
        this.lines = exc.lines.map(l => l.toParseable());
    }

    toStandard(): DialogueExchange {
        return new DialogueExchange(this);
    }
}

export class DialogueLineParseable {
    public speakerPicture: string;
    public dialogueBox: string;
    public dialogue: string;
    public useRightSide: boolean;
    public flags: StateFlagParseable[];
    public id: string;
    public useManualSelectionForBranches: boolean;
    public branches: DialogueBranchParseable[];

    constructor(line: DialogueLine) {
        this.speakerPicture = line.speakerPicture.value;
        this.dialogueBox = line.dialogueBox.value;
        this.dialogue = line.dialogue.value;
        this.useRightSide = line.useRightSide.value;
        this.flags = line.flags.map(f => f.toParseable());
        this.id = line.id;
        this.useManualSelectionForBranches = line.useManualSelectionForBranches.value;
        this.branches = line.branches.map(b => b.toParseable());
    }

    toStandard(): DialogueLine {
        return new DialogueLine(this);
    }
}

export class StateFlagParseable {
    public sceneFlag: string;
    public activeValue: boolean;

    constructor(f: StateFlag) {
        this.sceneFlag = f.flag.value;
        this.activeValue = f.value.value;
    }

    toStandard(): StateFlag {
        return new StateFlag(this);
    }
}

export class DialogueBranchParseable {
    public optionText: string;
    public condition: DialogueConditionParseable;
    public nextLine: string;

    constructor(b: DialogueBranch) {
        this.optionText = b.optionText.value;
        this.condition = b.condition.toParseable();
        this.nextLine = b.nextLine.value;
    }

    toStandard(): DialogueBranch {
        return new DialogueBranch(this);
    }
}