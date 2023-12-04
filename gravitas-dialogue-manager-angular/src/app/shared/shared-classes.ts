import { FormControl } from "@angular/forms";
import { NodeIdService } from "./node-id-service";

export class DialogueCondition {
    public conditions: DialogueSubCondition[];

    constructor(condition: string) {
        this.conditions = [];
        condition.split("&").forEach(element => {
            if (element.trim() !== 'default' && element.trim() !== '') {
                this.conditions.push(new DialogueSubCondition(element.trim()));
            }
        });
    }

    toString() {
        if (this.conditions.length == 0) {
            return 'default';
        }
        let retStr = "";
        for (let i = 0; i < this.conditions.length; i++) {
            retStr += this.conditions[i].toString();
            if (i < this.conditions.length - 1) {
                retStr += "&";
            }
        }
        return retStr;
    }
}

export class DialogueSubCondition {
    public variable: FormControl;
    public targetValue: FormControl;

    constructor(condition: string) {
        let variable = condition;
        let targetValue = true;
        if (condition[0] == '!') {
            variable = condition.substring(1);
            targetValue = false;
        }
        this.variable = new FormControl(variable);
        this.targetValue = new FormControl(targetValue);
    }

    toString() {
        return (this.targetValue.value ? "" : "!") + this.variable.value;
    }
}

export class DialogueExchange {
    public condition: DialogueCondition;
    public lines: DialogueLine[];
    public expanded: boolean;

    constructor(setupString: string) {
        let parts = setupString.split("{[exchange]}");
        this.condition = new DialogueCondition(parts[0]);
        this.lines = [];
        parts[1].split("{[line]}").forEach(element => {
            this.lines.push(new DialogueLine(element, false));
        });
        this.expanded = true;
    }

    toString() {
        let retStr = "";
        retStr += this.condition.toString();
        retStr += "{[exchange]}";
        for (let i = 0; i < this.lines.length; i++) {
            retStr += this.lines[i].toString();
            if (i < this.lines.length - 1) {
                retStr += "{[line]}";
            }
        }
        return retStr;
    }

    duplicate() {
        return new DialogueExchange(this.toString());
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

    constructor(setupString: string, useNewId: boolean) {
        let parts = setupString.split("{[text]}");
        if (useNewId || !NodeIdService.idIsValid(parts[0].trim())) {
            this.id = NodeIdService.getUniqueId();
        } else {
            this.id = parts[0].trim();
            NodeIdService.register(this.id);
        }
        let speakerPicture = parts[1].trim();
        let dialogueBox = parts[2].trim();
        let dialogue = '';
        let useRightSide = false;
        dialogue = parts[3].trim();
        this.useManualSelectionForBranches = new FormControl(parts[4].toUpperCase() === 'Y');
        this.branches = [];
        parts[5].split('{[branches]}').forEach((branch) => {
            if (branch !== '') {
                this.branches.push(new DialogueBranch(branch));
            }
        });
        if (speakerPicture.includes('[(rightside)]')) {
            speakerPicture = speakerPicture.replace('[(rightside)]', '');
            useRightSide = true;
        }
        this.flags = [];
        dialogue.match(/\[\([!_\-\w]+\)\]/)?.forEach(element => {
            this.flags.push(new StateFlag(element));
            dialogue = dialogue.replace(element, "");
        });
        this.speakerPicture = new FormControl(speakerPicture);
        this.dialogueBox = new FormControl(dialogueBox);
        this.dialogue = new FormControl(dialogue);
        this.useRightSide = new FormControl(useRightSide);
    }

    toString() {
        let retStr = this.id + "{[text]}";
        retStr += this.speakerPicture.value;
        retStr += this.useRightSide.value ? "[(rightside)]" : "";
        retStr += "{[text]}";
        retStr += this.dialogueBox.value;
        retStr += "{[text]}";
        retStr += this.dialogue.value;
        for (let i = 0; i < this.flags.length; i++) {
            retStr += "[("+this.flags[i].toString()+")]";
        }
        retStr += '{[text]}';
        retStr += this.useManualSelectionForBranches.value ? 'Y' : 'N';
        retStr += '{[text]}';
        for (let i = 0; i < this.branches.length; i++) {
            retStr += this.branches[i].toString();
            if (i < this.branches.length - 1) {
                retStr += "{[branches]}";
            }
        }
        return retStr;
    }

    duplicate() {
        return new DialogueLine(this.toString(), true);
    }
}

export class StateFlag {
    public name: FormControl;
    public value: FormControl;

    constructor(setupString: string) {
        let name = setupString.replace("[(", "").replace(")]", "");
        let value = true;
        if (name[0] == "!") {
            name = name.substring(1);
            value = false;
        }
        this.name = new FormControl(name);
        this.value = new FormControl(value);
    }

    toString() {
        return (this.value.value ? "" : "!") + this.name.value;
    }
}

export class DialogueBranch {
    public conditionText: FormControl;
    public condition: DialogueCondition;
    public nextLine: FormControl;

    constructor(setupString: string) {
        let parts = setupString.split("{[branch]}");
        this.conditionText = new FormControl(parts[0]);
        this.condition = new DialogueCondition(parts[1]);
        this.nextLine = new FormControl(parts[2]);
    }

    toString() {
        let retStr = this.conditionText.value;
        retStr += '{[branch]}';
        retStr += this.condition.toString();
        retStr += '{[branch]}';
        retStr += this.nextLine.value;
        return retStr;
    }
}