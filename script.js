currentMenu = "main-page";
characterName = '';
conversations = [];
defaultNoConditions = "This conversation has no conditions, so it will be used as the default.";
defaultNoFlags = "This dialog line does not set any scene flags.";

// CLASSES
class DialogueCondition {
    constructor(condition) {
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

class DialogueSubCondition {
    constructor(condition) {
        if (condition[0] == '!') {
            this.variable = condition.substring(1);
            this.targetValue = false;
        } else {
            this.variable = condition;
            this.targetValue = true;
        }
    }

    toString() {
        return (this.targetValue ? "" : "!") + this.variable;
    }
}

class DialogueExchange {
    constructor(setupString) {
        let parts = setupString.split("{[exchange]}");
        this.condition = new DialogueCondition(parts[0]);
        this.lines = [];
        parts[1].split("{[line]}").forEach(element => {
            this.lines.push(new DialogueLine(element));
        });
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
}

class DialogueLine {
    constructor(setupString) {
        let parts = setupString.split("{[text]}");
        this.speakerPicture = parts[0].trim();
        this.dialogue = parts[1].trim();
        this.flags = [];
        this.dialogue.match(/\[\([!_\-\w]+\)\]/)?.forEach(element => {
            this.flags.push(new StateFlag(element));
            this.dialogue = this.dialogue.replace(element, "");
        });
    }

    toString() {
        let retStr = "";
        retStr += this.speakerPicture;
        retStr += "{[text]}";
        retStr += this.dialogue;
        for (let i = 0; i < this.flags.length; i++) {
            retStr += "[("+this.flags[i].toString()+")]";
        }
        return retStr;
    }
}

class StateFlag {
    constructor(setupString) {
        this.name = setupString.replace("[(", "").replace(")]", "");
        if (this.name[0] == "!") {
            this.name = this.name.substring[1];
            this.value = false;
        } else {
            this.value = true;
        }
    }

    toString() {
        return (this.value ? "" : "!") + this.name;
    }
}

// FUNCTIONS

function addElement(tag, content, parent, attributes) {
	var newElement = document.createElement(tag);
	for (var attr = 0; attr < attributes.length; attr++)
	{
		newElement.setAttribute(attributes[attr][0], attributes[attr][1])
	}
	newElement.innerHTML = content;
	var parentElement = document.getElementById(parent);
	parentElement.appendChild(newElement);
}

function setUpEditPage() {
    document.getElementById('edit-page-content').innerHTML = "";
    // set up character name
    addElement("div", "Character name: ", 'edit-page-content', [['id', 'character-name']]);
    addElement('input', "", 'character-name', [['class', 'dialogue-condition-input'], ['id', 'character-name-input'], ['type', 'text'], ['value', characterName]]);
    addElement('button', 'Export', 'edit-page-content', [['class', 'dialogue-button'], ['onclick', 'exportDialogueFile()']]);
    addElement('div', '', 'edit-page-content', [['id', 'error-msg']]);
    for (let exchange = 0; exchange < conversations.length; exchange++) {
        addElement("div", "", "edit-page-content", [['class', 'dialogue-exchange'], ['id', 'dialogue-exchange-'+exchange]]);
        // create the header
        addElement('div', 'Conversation '+(exchange+1), 'dialogue-exchange-'+exchange, [['class', 'dialogue-exchange-header'], ['id', 'dialogue-exchange-'+exchange+'-header']]);
        addElement("button", 'Move Up', 'dialogue-exchange-'+exchange+'-header', [['class', 'dialogue-button'], ['onclick', 'moveExchangeUp('+exchange+')']]);
        addElement("button", 'Move Down', 'dialogue-exchange-'+exchange+'-header', [['class', 'dialogue-button'], ['onclick', 'moveExchangeDown('+exchange+')']]);
        addElement("button", 'Collapse', 'dialogue-exchange-'+exchange+'-header', [['class', 'dialogue-button'], ['id', 'dialogue-toggle-'+exchange], ['onclick', 'toggleVisibility('+exchange+')']]);
        addElement("button", 'Delete', 'dialogue-exchange-'+exchange+'-header', [['class', 'dialogue-button'], ['onclick', 'deleteExchange('+exchange+')']]);
        // create the body
        addElement('div', '', 'dialogue-exchange-'+exchange, [['class', 'dialogue-exchange-body'], ['id', 'dialogue-exchange-'+exchange+'-body']]);
        // add the conditions
        addElement('div', 'Conditions:', 'dialogue-exchange-'+exchange+'-body', [['class', 'dialogue-condition-wrapper'], ['id', 'dialogue-exchange-'+exchange+'-condition-wrapper']]);
        if (conversations[exchange].condition.conditions.length == 0) {
            document.getElementById('dialogue-exchange-'+exchange+'-condition-wrapper').innerHTML = defaultNoConditions;
        } else {
            for (let condition = 0; condition < conversations[exchange].condition.conditions.length; condition++) {
                addElement('div', "", 'dialogue-exchange-'+exchange+'-condition-wrapper', [['class', 'dialogue-condition'], ['id', 'dialogue-exchange-'+exchange+'-condition-'+condition]]);
                addElement('input', "", 'dialogue-exchange-'+exchange+'-condition-'+condition, [['class', 'dialogue-condition-input'], ['id', 'dialogue-exchange-'+exchange+'-condition-'+condition+'-input'], ['type', 'text'], ['value', conversations[exchange].condition.conditions[condition].variable]]);
                addElement('input', "", 'dialogue-exchange-'+exchange+'-condition-'+condition, [['class', 'checkbox'], ['id', 'dialogue-exchange-'+exchange+'-condition-'+condition+'-checkbox'], ['type', 'checkbox'], conversations[exchange].condition.conditions[condition].targetValue ? ['checked', ''] : []]);
                addElement('button', 'X', 'dialogue-exchange-'+exchange+'-condition-'+condition, [['class', 'dialogue-button-small'], ['onclick', 'deleteCondition('+exchange+','+condition+')']]);
            }
        }
        addElement('button', '+', 'dialogue-exchange-'+exchange+'-condition-wrapper', [['class', 'dialogue-button-small'], ['onclick', 'addCondition('+exchange+')']]);
        // add the lines of dialogue
        for (let line = 0; line < conversations[exchange].lines.length; line++) {
            addElement('div', '', 'dialogue-exchange-'+exchange+'-body', [['class', 'dialogue-line-wrapper'], ['id', 'dialogue-exchange-'+exchange+'-line-wrapper-'+line]]);
            addElement('div', "Speaker Picture:", 'dialogue-exchange-'+exchange+'-line-wrapper-'+line, [['class', 'dialogue-line-label'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-speaker-label']]);
            addElement('input', "", 'dialogue-exchange-'+exchange+'-line-'+line+'-speaker-label', [['class', 'dialogue-condition-input'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-speaker-input'], ['type', 'text'], ['value', conversations[exchange].lines[line].speakerPicture]]);
            addElement('div', "Dialogue:", 'dialogue-exchange-'+exchange+'-line-wrapper-'+line, [['class', 'dialogue-line-label']]);
            addElement('textarea', conversations[exchange].lines[line].dialogue, 'dialogue-exchange-'+exchange+'-line-wrapper-'+line, [['class', 'dialogue-textarea'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-dialogue-input'], ['rows', '5'], ['columns', '100']]);
            // add any scene flags that are set when this dialog line appears
            addElement('div', 'Scene Flags:', 'dialogue-exchange-'+exchange+'-line-wrapper-'+line, [['class', 'dialogue-flag-wrapper'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-wrapper']]);
            for (let flag = 0; flag < conversations[exchange].lines[line].flags.length; flag++) {
                addElement('div', "", 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-wrapper', [['class', 'dialogue-flag'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag]]);
                addElement('input', "", 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag, [['class', 'dialogue-condition-input'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag+'-input'], ['type', 'text'], ['value', conversations[exchange].lines[line].flags[flag].name]]);
                addElement('input', "", 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag, [['class', 'checkbox'], ['id', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag+'-checkbox'], ['type', 'checkbox'], conversations[exchange].lines[line].flags[flag].value ? ['checked', ''] : []]);
                addElement('button', 'X', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-'+flag, [['class', 'dialogue-button-small'], ['onclick', 'deleteFlag('+exchange+','+line+','+flag+')']]);
            }
            addElement('button', '+', 'dialogue-exchange-'+exchange+'-line-'+line+'-flag-wrapper', [['class', 'dialogue-button-small'], ['onclick', 'addFlag('+exchange+','+line+')']]);
            // add the footer to the lines
            addElement('div', '', 'dialogue-exchange-'+exchange+'-line-wrapper-'+line, [['class', 'dialogue-line-footer'], ['id', 'dialogue-exchange-'+exchange+'-footer-'+line]]);
            addElement("button", 'Move Up', 'dialogue-exchange-'+exchange+'-footer-'+line, [['class', 'dialogue-button'], ['onclick', 'moveLineUp('+exchange+','+line+')']]);
            addElement("button", 'Move Down', 'dialogue-exchange-'+exchange+'-footer-'+line, [['class', 'dialogue-button'], ['onclick', 'moveLineDown('+exchange+','+line+')']]);
            addElement("button", 'Delete', 'dialogue-exchange-'+exchange+'-footer-'+line, [['class', 'dialogue-button'], ['onclick', 'deleteLine('+exchange+','+line+')']]);
        }
        addElement('button', '+', 'dialogue-exchange-'+exchange+'-body', [['class', 'dialogue-button-small'], ['onclick', 'addLine('+exchange+')']]);

    }
    addElement('button', '+', 'edit-page-content', [['class', 'dialogue-button'], ['onclick', 'addExchange()']]);
}

function setUpTranslatePage() {
    let allStrings = getAllStrings();
    addElement('button', 'Export', 'translate-page-content', [['class', 'dialogue-button'], ['onclick', 'exportTranslatedFile()']]);
    addElement('div', '', 'translate-page-content', [['id', 'error-msg-translate']]);
    for (let i = 0; i < allStrings.length; i++) {
        addElement('div', '', 'translate-page-content', [['class', 'translation-string-wrapper'], ['id', 'translation-wrapper-'+i]]);
        addElement('div', allStrings[i], 'translation-wrapper-'+i, [['class', 'translation-string-original']]);
        addElement('textarea', '', 'translation-wrapper-'+i, [['class', 'dialogue-textarea'], ['id', 'translation-input-'+i]]);
    }
}

function createNewDialogue() {
    conversations = [];
    conversations.push(new DialogueExchange("default{[exchange]}new-character-normal{[text]}Lorem ipsum dolor iset."));
    characterName = "New Character";
    goToMenu("edit-page");
    setUpEditPage();
}

function editExistingDialogue() {
    goToMenu("edit-page");
    setUpEditPage();
    getAllStrings();
}

function translateExistingDialogue() {
    goToMenu("translate-page");
    setUpTranslatePage();
}

function parseFileUpload() {
    const [file] = document.querySelector('input[type=file]').files;
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        reader.result.replace("\n", "").split("{[interaction]}").forEach(element => {
            conversations.push(new DialogueExchange(element));
        });
    }, false);

    if (file) {
        document.getElementById("mode-select-filename").innerHTML = "You have uploaded "+file.name;
        characterName = file.name.replace("dialogue-", "").replace(".txt", "");
        reader.readAsText(file);
    }
    goToMenu("mode-page");
}

function goToMenu(menuName) {
    document.getElementById(currentMenu).style.display = "none";
    document.getElementById(menuName).style.display = "inline";
    currentMenu = menuName;
}

function moveExchangeUp(dialogueNum) {
    if (dialogueNum > 0) {
        setAll();
        let spliced = conversations.splice(dialogueNum, 1)[0];
        conversations.splice(dialogueNum - 1, 0, spliced);
        setUpEditPage();
    }
}

function moveExchangeDown(dialogueNum) {
    if (dialogueNum < conversations.length -1) {
        setAll();
        let spliced = conversations.splice(dialogueNum, 1)[0];
        conversations.splice(dialogueNum + 1, 0, spliced);
        setUpEditPage();
    }
}

function toggleVisibility(dialogueNum) {
    if (document.getElementById('dialogue-exchange-'+dialogueNum+'-body').style.display != "none") {
        document.getElementById('dialogue-exchange-'+dialogueNum+'-body').style.display = "none";
        document.getElementById('dialogue-toggle-'+dialogueNum).innerHTML = "Expand";
    } else {
        document.getElementById('dialogue-exchange-'+dialogueNum+'-body').style.display = "inline";
        document.getElementById('dialogue-toggle-'+dialogueNum).innerHTML = "Collapse";
    }
}

function addExchange() {
    setAll();
    conversations.push(new DialogueExchange("TestFlag{[exchange]}"+characterName.toLowerCase()+"-normal{[text]}Lorem ipsum dolor iset."));
    setUpEditPage();
}

function deleteExchange(dialogueNum) {
    conversations.splice(dialogueNum, 1);
    setAll();
    setUpEditPage();
}

function addCondition(dialogueNum) {
    setAll();
    conversations[dialogueNum].condition.conditions.push(new DialogueSubCondition('TestFlag'));
    setUpEditPage();
}

function deleteCondition(dialogueNum, conditionNum) {
    conversations[dialogueNum].condition.conditions.splice(conditionNum, 1);
    setAll();
    setUpEditPage();
}

function moveLineUp(dialogueNum, lineNum) {
    if (lineNum > 0) {
        setAll();
        let spliced = conversations[dialogueNum].lines.splice(lineNum, 1)[0];
        conversations[dialogueNum].lines.splice(lineNum - 1, 0, spliced);
        setUpEditPage();
    }
}

function moveLineDown(dialogueNum, lineNum) {
    if (lineNum < conversations[dialogueNum].lines.length-1) {
        setAll();
        let spliced = conversations[dialogueNum].lines.splice(lineNum, 1)[0];
        conversations[dialogueNum].lines.splice(lineNum+1, 0, spliced);
        setUpEditPage();
    }
}

function addLine(dialogueNum) {
    setAll();
    conversations[dialogueNum].lines.push(new DialogueLine(characterName.toLowerCase()+'-normal{[text]}Lorem ipsum dolor iset.'));
    setUpEditPage();
}

function deleteLine(dialogueNum, lineNum) {
    conversations[dialogueNum].lines.splice(lineNum, 1);
    setAll();
    setUpEditPage();
}

function addFlag(dialogueNum, lineNum) {
    setAll();
    conversations[dialogueNum].lines[lineNum].flags.push(new StateFlag("TestFlag"));
    setUpEditPage();
}

function deleteFlag(dialogueNum, lineNum, flagNum) {
    conversations[dialogueNum].lines[lineNum].flags.splice(flagNum, 1);
    setAll();
    setUpEditPage();
}

function checkDialogueFile() {
    let numOfDefaults = 0;
    conversations.forEach(element => {
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
    if (conversations[conversations.length-1].condition.conditions.length != 0) {
        return 'Your default conversation is not at the bottom. Make sure that the default conversation is at the bottom before exporting.';
    }
    return 'no-error';
}

function checkTranslations() {
    allStrings = getAllStrings();
    for (let i = 0; i < allStrings.length; i++) {
        if (allStrings[i].includes('{player}') && !document.getElementById('translation-input-'+i).value.includes('{player}')) {
            return 'The original string \''+allStrings[i]+'\' contains {player}, but your translation does not. Make sure you include \'{player}\' before exporting.';
        }
    }
    return 'no-error';
}

function setAll() {
    setCharacterName();
    for (let i = 0; i < conversations.length; i++) {
        setExchange(i);
    }
}

function setCharacterName() {
    characterName = document.getElementById('character-name-input').value;
}

function setExchange(exchangeNum) {
    for (let i = 0; i < conversations[exchangeNum].condition.conditions.length; i++) {
        setCondition(exchangeNum, i);
    }
    for (let i = 0; i < conversations[exchangeNum].lines.length; i++) {
        setLine(exchangeNum, i);
    }
}

function setCondition(exchangeNum, conditionNum) {
    conversations[exchangeNum].condition.conditions[conditionNum].variable = document.getElementById('dialogue-exchange-'+exchangeNum+'-condition-'+conditionNum+'-input').value;
    conversations[exchangeNum].condition.conditions[conditionNum].targetValue = document.getElementById('dialogue-exchange-'+exchangeNum+'-condition-'+conditionNum+'-checkbox').checked;
}

function setLine(exchangeNum, lineNum) {
    conversations[exchangeNum].lines[lineNum].speakerPicture = document.getElementById('dialogue-exchange-'+exchangeNum+'-line-'+lineNum+'-speaker-input').value;
    conversations[exchangeNum].lines[lineNum].dialogue = document.getElementById('dialogue-exchange-'+exchangeNum+'-line-'+lineNum+'-dialogue-input').value;
    for (let i = 0; i < conversations[exchangeNum].lines[lineNum].flags.length; i++) {
        setFlag(exchangeNum, lineNum, i);
    }
}

function setFlag(exchangeNum, lineNum, flagNum) {
    conversations[exchangeNum].lines[lineNum].flags[flagNum].name = document.getElementById('dialogue-exchange-'+exchangeNum+'-line-'+lineNum+'-flag-'+flagNum+'-input').value;
    conversations[exchangeNum].lines[lineNum].flags[flagNum].value = document.getElementById('dialogue-exchange-'+exchangeNum+'-line-'+lineNum+'-flag-'+flagNum+'-checkbox').checked;
}

function exportDialogueFile() {
    let errorMsg = checkDialogueFile();
    if (errorMsg != "no-error") {
        document.getElementById('error-msg').innerHTML = errorMsg;
    } else {
        document.getElementById('error-msg').innerHTML = '';
        const link = document.createElement("a");
        setAll();
        const content = formatForExport();
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = 'dialogue-'+characterName.toLowerCase().replace(" ", "-")+'.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

function formatForExport() {
    let retStr = "";
    for (let exchange = 0; exchange < conversations.length; exchange++) {
        retStr += conversations[exchange].toString();
        if (exchange < this.conversations.length - 1) {
            retStr += "{[interaction]}";
        }
    }
    return retStr;
}

function getAllStrings() {
    let allStrings = [];
    conversations.forEach(exchange => {
        exchange.lines.forEach(line => {
            allStrings.push(formatDialogueForTranslation(line.dialogue));
        });
    });
    return allStrings;
}

function formatDialogueForTranslation(dialogueLine) {
    retStr = dialogueLine;
    retStr.match(/<link.*\/link>/)?.forEach(element => {
        insideText = element.substring(element.indexOf('">')+2, element.indexOf('</link>'));
        retStr = retStr.replace(element, insideText);
    });
    return retStr;
}

function exportTranslatedFile() {
    let errorMsg = checkTranslations();
    if (errorMsg != "no-error") {
        document.getElementById('error-msg-translate').innerHTML = errorMsg;
    } else {
        document.getElementById('error-msg-translate').innerHTML = '';
        const link = document.createElement("a");
        let content = formatForExport();
        allStrings = getAllStrings();
        for (let i = 0; i < allStrings.length; i++) {
            content = content.replace(allStrings[i], document.getElementById('translation-input-'+i).value);
        }
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = 'dialogue-'+characterName.toLowerCase().replace(" ", "-")+'.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }
}