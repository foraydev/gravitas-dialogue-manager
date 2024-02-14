import { DialogueBranch, DialogueCondition, DialogueExchange, DialogueLine, StateFlag } from "./shared-classes";
import { DialogueBranchParseable, DialogueConditionParseable, DialogueExchangeParseable, DialogueLineParseable, StateFlagParseable } from "./shared-classes-parsing";

export const NO_CONDITIONS = "This conversation has no conditions, so it will be used as the default.";
export const NO_FLAGS = "This dialog line does not set any scene flags.";

export const NEW_BRANCH: DialogueBranchParseable = {
    optionText: '',
    condition: {
        conditions: [],
        toStandard: function (): DialogueCondition {
            return new DialogueCondition(this);
        }
    },
    nextLine: '',
    toStandard: function (): DialogueBranch {
        return new DialogueBranch(this);
    }
};
export const NEW_LINE: DialogueLineParseable = {
    speakerPicture: '{DEFAULT}-default',
    dialogueBox: '',
    dialogue: 'Lorem ipsum dolor sit amet.',
    useRightSide: false,
    flags: [],
    id: 'NULL',
    useManualSelectionForBranches: false,
    branches: [],
    toStandard: function (): DialogueLine {
        return new DialogueLine(this);
    }
};
export const NEW_CONVERSATION: DialogueExchangeParseable = {
    condition: {
        conditions: [],
        toStandard: function (): DialogueCondition {
            return new DialogueCondition(this);
        }
    },
    lines: [ NEW_LINE ],
    toStandard: function (): DialogueExchange {
        return new DialogueExchange(this);
    }
};
export const NEW_FLAG: StateFlagParseable = {
    sceneFlag: "TestFlag",
    activeValue: true,
    toStandard: function (): StateFlag {
        return new StateFlag(this);
    }
};
export const NEW_CONDITION: DialogueConditionParseable = {
    conditions: [],
    toStandard: function (): DialogueCondition {
        return new DialogueCondition(this);
    }
};

export const DIALOGUE_BUBBLE_OPTIONS = [
    'Normal',
    'Angry',
    'Thought',
    'Radio',
    'Lore',
    'None'
];