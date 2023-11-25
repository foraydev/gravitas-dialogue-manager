import { FormControl } from "@angular/forms";

export class DialogueCondition {
    public conditions: DialogueSubCondition[];

    constructor(condition: string) {
        this.conditions = [];
        condition.split("&").forEach(element => {
            if (element.trim() != 'default') {
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
            this.lines.push(new DialogueLine(element));
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

    constructor(setupString: string) {
        let parts = setupString.split("{[text]}");
        let speakerPicture = parts[0].trim();
        let dialogueBox = parts[1].trim();
        let dialogue = '';
        let useRightSide = false;
        if (parts.length > 2) {
            dialogue = parts[2].trim();
        } else {
            dialogue = parts[1].trim();
        }
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
        let retStr = "";
        retStr += this.speakerPicture.value;
        retStr += this.useRightSide.value ? "[(rightside)]" : "";
        retStr += "{[text]}";
        retStr += this.dialogueBox.value;
        retStr += "{[text]}";
        retStr += this.dialogue.value;
        for (let i = 0; i < this.flags.length; i++) {
            retStr += "[("+this.flags[i].toString()+")]";
        }
        return retStr;
    }

    duplicate() {
        return new DialogueLine(this.toString());
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

export class DialogueChoice {
    public options: DialogueOption[];

    constructor(setupString: string) {
        this.options = [];
    }
}

export class DialogueOption {
    public condition: DialogueCondition;
    public displayText: string;
    public line: DialogueLine;

    constructor(setupString: string) {
        this.condition = new DialogueCondition('');
        this.displayText = '';
        this.line = new DialogueLine('');
    }
}