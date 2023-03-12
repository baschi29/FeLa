import * as feladb from './database/database.js';

async function addMCItem(roundID, questNumber, direction, modeString, question, answer) {
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    const alternatives = await feladb.getAlternatives(questNumber, 3, 3);
    const formulars = [answer];
    if (direction === 'direct3') { // formel -> name
        formulars.push(alternatives[0].formula, alternatives[1].formula, alternatives[2].formula);
        feladb.niceFormulaList(formulars);
    } else {
        formulars.push(alternatives[0].name, alternatives[1].name, alternatives[2].name);
    }
    shuffle(formulars);
    question = feladb.niceFormula(question);
    
    const carouselItem = ons.createElement(`
            <ons-carousel-item>
                <h1 align="center">${question}</h1>
                <ons-list>
                    <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd1${questNumber} name="questions" input-id="radio-1${questNumber}" ></ons-radio>
                        </label>

                        <label id=label1${questNumber} for="radio-1${questNumber}" class="center">
                            ${formulars[0]}                   
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd2${questNumber} name="questions" input-id="radio-2${questNumber}" ></ons-radio>
                        </label>

                        <label id=label2${questNumber} for="radio-2${questNumber}" class="center">
                            ${formulars[1]}                             
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd3${questNumber} name="questions" input-id="radio-3${questNumber}" ></ons-radio>
                        </label>

                        <label id=label3${questNumber} for="radio-3${questNumber}" class="center">
                            ${formulars[2]}     
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd4${questNumber} name="questions" input-id="radio-4${questNumber}" ></ons-radio>
                        </label>

                        <label id=label4${questNumber} for="radio-4${questNumber}" class="center">
                            ${formulars[3]}     
                        </label>
                     </ons-list-item>
                </ons-list>

            <ons-button modifier="large" onclick="check(${roundID}, 'level1', ${questNumber}, '${answer}', '${modeString}')">Antwort überprüfen</ons-button>
            


        </ons-carousel-item>
        `);

    //console.log(carouselItem);
    questCar.appendChild(carouselItem);

    
}

async function addDaDItem(roundID, questNumber, modeString, directString, question, answer, split) {
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    // carussel item hinzufügen für drag and drop mit tabelle und Buttons
    const questCar = document.querySelector('#questCar');
    let splitted;
    const alternatives = await feladb.getAlternatives(questNumber, 2, 10);
    if (directString === 'direct3') { //Summenformel -> Name;
        splitted = feladb.splitFormula(answer, 0);
        console.log(splitted);
        
        const splittedAlternatives = [];
        for (let i = 0; i < alternatives.length; i++) {
            //const temp = alternatives[i].formula.split(/(?=[A-Z])/);
            const temp = feladb.splitFormula(alternatives[i].formula, 0);
            for (let j = 0; j < temp.length; j++) {
                splittedAlternatives.push(temp[j]);    
            }    
        }
        shuffle(splittedAlternatives);
        let i = 0;
        while (splitted.length < 10) {
            if (!(splitted.includes(splittedAlternatives[i]))){
                splitted.push(splittedAlternatives[i]);  
            }
            i++;
        }
    } else if (directString === 'direct2') { //Name -> Summenformel
        splitted = feladb.splitName(split);
        console.log(splitted);

        const splittedAlternatives = [];
        for (let i = 0; i < alternatives.length; i++) {
            const temp = feladb.splitName(alternatives[i].split);
            for (let j = 0; j < temp.length; j++) {
                splittedAlternatives.push(temp[j]);    
            }    
        }
        shuffle(splittedAlternatives);
        let i = 0;
        while (splitted.length < 10) {
            if (!(splitted.includes(splittedAlternatives[i]))){
                splitted.push(splittedAlternatives[i]);  
            }
            i++;
        }
    }
    
    
    shuffle(splitted);
    feladb.niceFormulaList(splitted);
    question = feladb.niceFormula(question);
    
    const carouselItem = ons.createElement(`
        <ons-carousel-item>
            <h1 align="center">${question}</h1>
            <p style="text-align: center;">
                <ons-button id=DaD1${questNumber} modifier="quiet" onclick="mark(this, 'DaD1${questNumber}')" style="text-transform:none"> ${splitted[0]} </ons-button>
                <ons-button id=DaD2${questNumber} modifier="quiet" onclick="mark(this, 'DaD2${questNumber}')" style="text-transform:none"> ${splitted[1]}  </ons-button>
                <ons-button id=DaD3${questNumber} modifier="quiet" onclick="mark(this, 'DaD3${questNumber}')" style="text-transform:none"> ${splitted[2]}  </ons-button>
                <ons-button id=DaD4${questNumber} modifier="quiet" onclick="mark(this, 'DaD4${questNumber}')" style="text-transform:none"> ${splitted[3]}  </ons-button>
                <ons-button id=DaD5${questNumber} modifier="quiet" onclick="mark(this, 'DaD5${questNumber}')" style="text-transform:none"> ${splitted[4]}  </ons-button>
                </p>
                
            <p style="text-align: center;">
                <ons-button id=DaD6${questNumber} modifier="quiet" onclick="mark(this, 'DaD6${questNumber}')" style="text-transform:none"> ${splitted[5]}  </ons-button>
                <ons-button id=DaD7${questNumber} modifier="quiet" onclick="mark(this, 'DaD7${questNumber}')" style="text-transform:none"> ${splitted[6]}  </ons-button>
                <ons-button id=DaD8${questNumber} modifier="quiet" onclick="mark(this, 'DaD8${questNumber}')" style="text-transform:none"> ${splitted[7]}  </ons-button>
                <ons-button id=DaD9${questNumber} modifier="quiet" onclick="mark(this, 'DaD9${questNumber}')" style="text-transform:none"> ${splitted[8]}  </ons-button>
                <ons-button id=DaD10${questNumber} modifier="quiet" onclick="mark(this, 'DaD10${questNumber}')" style="text-transform:none"> ${splitted[9]}  </ons-button>
               
            </p>

            <style>
                table,th,td{
                    table-layout: fixed;
                    border:3px solid #cccccc;
                    border-style: solid;
                    border-collapse: collapse;
                    text-align: center;
                    padding: 5px;
                     
                    height:42px; 
                    color: #ff000000;
                     
                }    
            </style>
            <table id=table${questNumber} align="center"> 
                <tr>
                    <td id=tab1${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td>   
                    <td id=tab2${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td> 
                    <td id=tab3${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td> 
                    <td id=tab4${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td> 
                    <td id=tab5${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td> 
                    <td id=tab6${questNumber} onclick="pushInTable(this, 'table${questNumber}')">Place</td> 
                </tr>
            </table>
            <p></p>

            <ons-button modifier="large" onclick="check(${roundID}, 'level2', ${questNumber}, '${answer}', '${modeString}')">Antwort überprüfen</ons-button>
            
        </ons-carausel-item>
    `);

    questCar.appendChild(carouselItem);   
}  

function addFTEItem(roundID, questNumber, modeString, question, answer) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    console.log(answer)
    question = feladb.niceFormula(question);

    const carouselItem = ons.createElement(`
        <ons-carausel-item>    
            <h1 align='center'>
                ${question}
            </h1>
            <br></br>
            <p align='center'>
                <ons-input id="answer${questNumber}" input-id="answertest${questNumber}" modifier="underbar" placeholder="Antwort" float></ons-input>
            </p>
            
            <ons-button modifier="large" onclick="check(${roundID}, 'level3', ${questNumber}, '${answer}' , '${modeString}')">Antwort überprüfen</ons-button>
            
        </ons-carausel-item>  
    `);

    questCar.appendChild(carouselItem); 
}  

// https://onsen.io/v2/guide/tutorial.html#carousels
async function learnMode(modeString) {
    // Inhalte aus den ons-selector holen
    const level = document.getElementById("choose-sel1" + modeString);
    const lvList = level.options;
    var selectedLevel = lvList[level.selectedIndex].value;
    
    const typ = document.getElementById("choose-sel2" + modeString);
    const typList = typ.options;
    var selectedTyp = typList[typ.selectedIndex].value;
    
    const direction = document.getElementById("choose-sel3" + modeString);
    const dirList = direction.options;
    var selectedDirection = dirList[direction.selectedIndex].value;
    
    // carussel Seite pushen
    await document.querySelector('#mainNavigator').pushPage('views/carousel.html', {data: {title: 'Fragen Testmodus'}});
    
    
    console.log(selectedTyp);
    let round;
    if (selectedTyp === 'Alle') {
        round = await feladb.createRound(modeString, [], 10);
    } else {
        round = await feladb.createRound(modeString, selectedTyp, 10);
    }
   
    /*
    Carousel items anhängen.
    Je nach ausgewähltem Level werden enstprechende fragen ausgewählt.
    */
    const directions = ['direct2', 'direct3'];
    var dir;
    if (selectedLevel === 'level1') {
        for (let i = 0; i < round.questions.length; i++) {
            let question = round.questions[i];
            if (selectedDirection === 'direct3') {
                await addMCItem(round.id, question.question_id, selectedDirection, modeString, question.name, question.formula);    
            } else if (selectedDirection === 'direct2') {
                await addMCItem(round.id, question.question_id, selectedDirection, modeString, question.formula, question.name); 
            } else {
                dir = directions[Math.floor(Math.random() * directions.length)];
                if (dir === 'direct3') {
                     await addMCItem(round.id, question.question_id, dir,  modeString, question.name, question.formula);    
                } else if (dir === 'direct2') {
                    await addMCItem(round.id, question.question_id, dir,  modeString, question.formula, question.name); 
                }
            }
        }
        
    } else if (selectedLevel === 'level2') {
        for (let i = 0; i < round.questions.length; i++) {
            let question = round.questions[i];
            if (selectedDirection === 'direct3') {
                await addDaDItem(round.id, question.question_id, modeString, selectedDirection, question.name, question.formula, question.split);       
            } else if (selectedDirection === 'direct2') {
                await addDaDItem(round.id, question.question_id, modeString, selectedDirection, question.formula, question.name, question.split);
            } else {
                dir = directions[Math.floor(Math.random() * directions.length)]
                if (dir === 'direct3') {
                    await addDaDItem(round.id, question.question_id, modeString, dir, question.name, question.formula, question.split);       
                } else if (dir === 'direct2') {
                    await addDaDItem(round.id, question.question_id, modeString, dir, question.formula, question.name, question.split);
                }
            }
        }

    } else if (selectedLevel === 'level3') {
        for (let i = 0; i < round.questions.length; i++) {
            let question = round.questions[i];
            if (selectedDirection === 'direct3') {
                addFTEItem(round.id, question.question_id, modeString, question.name, question.formula);                      
            } else if (selectedDirection === 'direct2') {
                addFTEItem(round.id, question.question_id, modeString, question.formula, question.name);                      
            } else {
                dir = directions[Math.floor(Math.random() * directions.length)];
                if (dir === 'direct3') {
                    addFTEItem(round.id, question.question_id, modeString, question.name, question.formula);                      
                } else if (dir === 'direct2') {
                    addFTEItem(round.id, question.question_id, modeString, question.formula, question.name);                      
                }
            }
        }
    }
    questCar.next();

}

async function testMode() {
    await document.querySelector('#mainNavigator').pushPage('views/carousel.html', {data: {title: 'Fragen Testmodus'}});
    
    const typ = document.getElementById("choose-sel2test");
    const typList = typ.options;
    var selectedTyp = typList[typ.selectedIndex].value;
    
    let round;
    if (selectedTyp === 'Alle') {
        round = await feladb.createRound('test', [], 30);
    } else {
        round = await feladb.createRound('test', selectedTyp, 30);
    }
    //let round = await feladb.createRound('test', [], 30);
    const levels = ['MC', 'DaD', 'FTE'];
    const directions = ['direct2', 'direct3'];
    
    
    for (let i = 0; i < round.questions.length; i++) {
        let question = round.questions[i];
        let dir = directions[Math.floor(Math.random() * directions.length)];
        let randlevel = levels[Math.floor(Math.random() * levels.length)];
        switch(randlevel) {
            case 'MC':
                if (dir === 'direct3') {
                     await addMCItem(round.id, question.question_id, dir,  'test', question.name, question.formula);    
                } else if (dir === 'direct2') {
                    await addMCItem(round.id, question.question_id, dir,  'test', question.formula, question.name); 
                }
              break;
            case 'DaD':
                if (dir === 'direct3') {
                    await addDaDItem(round.id, question.question_id, 'test', dir, question.name, question.formula, question.split);       
                } else if (dir === 'direct2') {
                    await addDaDItem(round.id, question.question_id, 'test', dir, question.formula, question.name, question.split);
                }
              break;
            case 'FTE':
                if (dir === 'direct3') {
                    addFTEItem(round.id, question.question_id, 'test', question.name, question.formula);                      
                } else if (dir === 'direct2') {
                    addFTEItem(round.id, question.question_id, 'test', question.formula, question.name);                      
                }
            default:
              // code block
          }
    }
    questCar.next();
}



//Functions for Drag and Drop
export function mark(pushedButton, buttonID) {
    let marked = localStorage.getItem("marked");
    if ((marked === null) || (marked === "false") ) {
        pushedButton.style.backgroundColor = 'lightblue';
        localStorage.setItem("markedButton", buttonID);
        localStorage.setItem("buttonText", pushedButton.innerText);
        localStorage.setItem("marked", "true");     
    } 
}

export function pushInTable(tableField) {
    if (tableField.innerText === 'Place') {
        var markedButton = document.getElementById(localStorage.getItem("markedButton"));
        var buttonText = localStorage.getItem("buttonText");
        markedButton.style.backgroundColor = "transparent";
        //console.log(tableField.style.width);  
        tableField.innerText = buttonText;
       
        let isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
        if (isDark) {
            tableField.style.color = 'white';
        } else {
            tableField.style.color = 'black';
        }
        
    
        localStorage.setItem("marked", "false");
    } else {
        tableField.innerText = 'Place';
        tableField.style.color = 'transparent';
    }
}

// checks if answer is correct
export async function check(roundID, level, index, answer, modeString) {
    // console.log(level); 
    // console.log(index);
    // console.log(modeString);
    var carausel = document.getElementById('questCar');
    var questAnswer;
    let convertedAnswer = feladb.niceFormula(answer);
    // Multiple Choice
    if (level === 'level1') {
        var x;
        if (document.getElementById('rd1'+index).checked) {
            questAnswer = document.getElementById('label1'+index).innerHTML;  
            x=1;     
        } else if (document.getElementById('rd2'+index).checked) {
            questAnswer = document.getElementById('label2'+index).innerHTML;
            x=2;
        } else if (document.getElementById('rd3'+index).checked) {
            questAnswer = document.getElementById('label3'+index).innerHTML;
            x=3;
        } else if (document.getElementById('rd4'+index).checked) {
            questAnswer = document.getElementById('label4'+index).innerHTML;
            x=4;
        }

        if (modeString === 'learn') {
            if (questAnswer.includes(convertedAnswer)){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'mc', 1, 0);
                alert('Richtig');
                carausel.next();
            } else {
                // Zeile rot machen
                for (var i = 1; i <= 4; i++) {
                    if ((document.getElementById('rd'+ i +index).checked)) {
                        document.getElementById('label'+ i + index).style.color = 'red';
                    }
                }
                alert('Falsch');
            }
        } else if (modeString === 'test'){
            if (questAnswer.includes(convertedAnswer)){
                await feladb.closeQuestion(roundID, index, 'mc', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                carausel.next();               
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'mc', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                carausel.next();
            }
        }
       
    //Drag and Drop    
    } else if (level === 'level2') {
        // questAnswer = document.getElementById('tab1'+index).innerText + document.getElementById('tab2'+index).innerText +
        //               document.getElementById('tab3'+index).innerText + document.getElementById('tab4'+index).innerText +
        //               document.getElementById('tab5'+index).innerText + document.getElementById('tab6'+index).innerText;
        questAnswer = '';
        for (let i = 1; i < 7; i++) {
            let temp = document.getElementById('tab'+i+index).innerHTML;
            console.log(temp);
            if (!(temp === 'Place')) {
                questAnswer += temp;
            }   
        }

        let convertedAnswer2 = '';
        for (const elem of answer) {
            if (elem != '_' && elem != '^') {
                convertedAnswer2 += elem;
            }
        }

        if (modeString === 'learn') {
            if (questAnswer === convertedAnswer2){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'd&d', 1, 0);
                alert('Richtig');
                carausel.next();
            } else {
                for (let i = 1; i <= 6; i++) {
                    let field = document.getElementById('tab' + i + index);
                    if (!(field.innerHTML === 'Place')) {
                        field.style.color = 'red';
                    }    
                }
                alert('Falsch');
            }
        } else if (modeString === 'test'){
            if (questAnswer === answer){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'mc', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                carausel.next();               
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'mc', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                carausel.next();
            }
        }
            
    // Freitext
    } else if (level === 'level3') {
        questAnswer = document.getElementById('answer' + index).value;
        if (modeString === 'learn') {
            if (questAnswer === answer){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'free', 1, 0);
                alert('Richtig');
                carausel.next();
            } else {
                // Zeile rot machen
                console.log(document.getElementById("answertest" + index));
                document.getElementById("answertest" + index).style.color = 'red';
                alert('Falsch');
            }
        } else if (modeString === 'test'){
            if (questAnswer === answer){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'free', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                carausel.next();               
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'free', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                carausel.next();
            }
        }   
    }
}


document.addEventListener('init', function(event) {
    // var testknopf = document.getElementById("push-button");
    // console.log(testknopf);
    var page = event.target;

    //console.log(page);
    if (page.id === 'test') {
        page.querySelector('#push-button').onclick = function() {testMode()};

    } else if (page.id === 'learn') {
        page.querySelector('#push-button').onclick = function() {learnMode('learn')};
    
    } else if (page.id === 'q_test') {
        page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    
    } 
});

window.check = check;
window.pushInTable = pushInTable;
window.mark = mark;
