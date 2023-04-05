import * as feladb from './database/database.js';

// --> functions for the learn and test pages <-- //

// build the 3 different question modes //

/** 
 * Function to create and push a multiple choice question into the carausel
 * @param roundID ID of the questionRound
 * @param questNumber ID of the explicit question
 * @param direction direction of the Question: direct2 for Summenformel -> Name or direct3 for Name -> Summenformel
 * @param modeString String for test or learn  
 * @param question the question
 * @param answer the answer for the question 
*/
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
    var buttonText;
    if (modeString === 'test') {
        buttonText = 'Weiter';
    } else {
        buttonText = 'Antwort überprüfen';
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
                <div align="center" style="margin-top: 20px; margin-bottom:20px; height: 40px;">
                    <h1 align="center">${question}</h1>
                </div>
                <ons-list style="margin-top: 20px; margin-left: 10px; margin-right: 10px;">
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

            <ons-button modifier="large" style="margin-top: 20px;" onclick="check(this, ${roundID}, 'level1', ${questNumber}, '${answer}', '${modeString}')">${buttonText}</ons-button>
            


        </ons-carousel-item>
        `);

    //console.log(carouselItem);
    questCar.appendChild(carouselItem);

    
}

/** 
 * Function to create and push a Drag and Drop question into the carausel
 * @param roundID ID of the questionRound
 * @param questNumber ID of the explicit question
 * @param modeString String for test or learn  
 * @param directString direction of the Question: direct2 for Summenformel -> Name or direct3 for Name -> Summenformel
 * @param question the question
 * @param answer the answer for the question 
 * @param split the splitted anwer
*/
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

    var buttonText;
    if (modeString === 'test') {
        buttonText = 'Weiter';
    } else {
        buttonText = 'Antwort überprüfen';
    }

    // carussel item hinzufügen für drag and drop mit tabelle und Buttons
    const questCar = document.querySelector('#questCar');
    let splitted;
    const alternatives = await feladb.getAlternatives(questNumber, 2, 10);
    if (directString === 'direct3') { //Summenformel -> Name;
        splitted = feladb.splitFormula(answer, 0);
        //console.log(splitted);
        
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
        //console.log(splitted);

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
            <div align="center" style="margin-top: 20px; margin-bottom:20px; height: 40px;">
                <h1 align="center">${question}</h1>
            </div>

            <div style="margin-left: 10px; margin-right: 10px;">
                <div style="text-align: center;">
                    <ons-button id=DaD1${questNumber} modifier="quiet" onclick="mark(this, 'DaD1${questNumber}')" style="text-transform:none"> ${splitted[0]} </ons-button>
                    <ons-button id=DaD2${questNumber} modifier="quiet" onclick="mark(this, 'DaD2${questNumber}')" style="text-transform:none"> ${splitted[1]}  </ons-button>
                    <ons-button id=DaD3${questNumber} modifier="quiet" onclick="mark(this, 'DaD3${questNumber}')" style="text-transform:none"> ${splitted[2]}  </ons-button>
                    <ons-button id=DaD4${questNumber} modifier="quiet" onclick="mark(this, 'DaD4${questNumber}')" style="text-transform:none"> ${splitted[3]}  </ons-button>
                    <ons-button id=DaD5${questNumber} modifier="quiet" onclick="mark(this, 'DaD5${questNumber}')" style="text-transform:none"> ${splitted[4]}  </ons-button>
                </div>
                    
                <div style="text-align: center;">
                    <ons-button id=DaD6${questNumber} modifier="quiet" onclick="mark(this, 'DaD6${questNumber}')" style="text-transform:none"> ${splitted[5]}  </ons-button>
                    <ons-button id=DaD7${questNumber} modifier="quiet" onclick="mark(this, 'DaD7${questNumber}')" style="text-transform:none"> ${splitted[6]}  </ons-button>
                    <ons-button id=DaD8${questNumber} modifier="quiet" onclick="mark(this, 'DaD8${questNumber}')" style="text-transform:none"> ${splitted[7]}  </ons-button>
                    <ons-button id=DaD9${questNumber} modifier="quiet" onclick="mark(this, 'DaD9${questNumber}')" style="text-transform:none"> ${splitted[8]}  </ons-button>
                    <ons-button id=DaD10${questNumber} modifier="quiet" onclick="mark(this, 'DaD10${questNumber}')" style="text-transform:none"> ${splitted[9]}  </ons-button>
                </div>
            </div>

            <style>
                table,th,td{
                    table-layout: fixed;
                    border:3px solid #cccccc;
                    border-style: solid;
                    border-collapse: collapse;
                    text-align: center;
                    padding: 5px;
                    margin-top: 20px;
                    margin-left: 10px;
                    margin-right: 10px;"
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

            <ons-button modifier="large" style="margin-top: 20px;" onclick="check(this, ${roundID}, 'level2', ${questNumber}, '${answer}', '${modeString}')">${buttonText}</ons-button>
            
        </ons-carausel-item>
    `);

    questCar.appendChild(carouselItem);   
}  

/** 
 * Function to create and push a Freitext question into the carausel
 * @param roundID ID of the questionRound
 * @param questNumber ID of the explicit question
 * @param modeString String for test or learn  
 * @param question the question
 * @param answer the answer for the question 
*/
function addFTEItem(roundID, questNumber, modeString, question, answer) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    //console.log(answer)
    question = feladb.niceFormula(question);

    var buttonText;
    if (modeString === 'test') {
        buttonText = 'Weiter';
    } else {
        buttonText = 'Antwort überprüfen';
    }

    const carouselItem = ons.createElement(`
        <ons-carausel-item> 
            <div align="center" style="margin-top: 20px; margin-bottom:20px; height: 40px;">   
                <h1 align='center'>
                    ${question}
                </h1>
            </div>
            
            <div align='center' style="margin-top: 20px; margin-left: 10px; margin-right: 10px;">
                <ons-input id="answer${questNumber}" input-id="answertest${questNumber}" modifier="underbar" placeholder="Antwort" float></ons-input>
            </div>
            
            <ons-button modifier="large" style="margin-top: 20px;" onclick="check(this, ${roundID}, 'level3', ${questNumber}, '${answer}' , '${modeString}')">${buttonText}</ons-button>
            
        </ons-carausel-item>  
    `);

    questCar.appendChild(carouselItem); 
}  

/** 
 * Function to build learn mode environment
 * @param modeString String for test or learn, here always learn (old param, not really used anymore) 
 */
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
    
    
    // console.log(selectedTyp);
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

/** 
 * Function to build test mode environment
 */
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
          }
    }
    questCar.next();
}

/** 
 * First helper function for Drag and Drop. Mark the clicked button.
 * @param pushedButton the button which is clicked and need too be marked
 * @param buttonID ID of the clicked button 
 */
export function mark(pushedButton, buttonID) {
    let marked = localStorage.getItem("marked");
    if ((marked === null) || (marked === "false") ) {
        pushedButton.style.backgroundColor = 'lightblue';
        localStorage.setItem("markedButton", buttonID);
        localStorage.setItem("buttonText", pushedButton.innerText);
        localStorage.setItem("marked", "true");     
    } 
}

/** 
 * Second helper function for Drag and Drop. Pushes the button text into the table.
 * @param tableField field in which the button text needs to be pushed
 */
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

/** 
 * Function to show next carausel site. Checks if the round is over and shows statistics.
 * @param roundID ID of the round
 * @param carausel the carausel
 */
async function nextPage(roundID, carausel) {
    buildStats();
    // console.log(await feladb.isRoundClosed(roundID));
    await feladb.isRoundClosed(roundID);
    var closed = await feladb.isRoundClosed(roundID);
    // console.log(closed);
    if (closed){
        roundStats(roundID, carausel);
        carausel.next();
        carausel.setAttribute('swipeable', 'true');
        document.getElementById('loadingScreen').remove();
        
    } else {
        carausel.next();
    }
}

/** 
 * Checks the given answer of a question
 * @param button the button whish is clicked
 * @param roundID ID of the round
 * @param level String for the level: eather level1 for multiple choice, level2 for Drag and drop or level3 for Freitext
 * @param index index of the carausel site
 * @param answer the correct answer for the question
 * @param modeString String for test or learn  
 */
export async function check(button, roundID, level, index, answer, modeString) {
    // console.log(level); 
    // console.log(index);
    // console.log(modeString);
    // console.log(button);
    var carausel = document.getElementById('questCar');
    var questAnswer;
    let convertedAnswer = feladb.niceFormula(answer);

    if (localStorage.getItem('learnButtonSwitch') === 'true'){
        nextPage(roundID, carausel);
        localStorage.setItem('learnButtonSwitch', 'false');
        button.setAttribute('disabled','true');
        return;
    }

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
        } else {
            questAnswer = '';
        }

        if (modeString === 'learn') {
            if (questAnswer.includes(convertedAnswer)){
                // ergebniss speichern

                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'mc', 1, 0);
                }

                for (var i = 1; i <= 4; i++) {
                    if ((document.getElementById('rd'+ i +index).checked)) {
                        document.getElementById('label'+ i + index).style.color = 'green';
                    }
                }
                // nextPage(roundID, carausel);
                localStorage.setItem('learnButtonSwitch', 'true');
                button.innerHTML = 'Nächste Frage';

            } else {
                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'mc', 0, 0);
                }
                // Zeile rot machen
                for (var i = 1; i <= 4; i++) {
                    if ((document.getElementById('rd'+ i +index).checked)) {
                        document.getElementById('label'+ i + index).style.color = 'red';
                    }
                }
            }
        } else if (modeString === 'test'){
            if (questAnswer.includes(convertedAnswer)){
                await feladb.closeQuestion(roundID, index, 'mc', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                //carausel.next(); 
                await nextPage(roundID, carausel); 
                for (var i = 1; i <= 4; i++) {
                    if ((document.getElementById('rd'+ i +index).checked)) {
                        document.getElementById('label'+ i + index).style.color = 'green';
                    }
                }
                button.setAttribute('disabled','true');
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'mc', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                //carausel.next();
                await nextPage(roundID, carausel);
                for (var i = 1; i <= 4; i++) {
                    if ((document.getElementById('rd'+ i +index).checked)) {
                        document.getElementById('label'+ i + index).style.color = 'red';
                    }
                }
                button.setAttribute('disabled','true');
            }
        }
       
    // Drag and Drop    
    } else if (level === 'level2') {
        // questAnswer = document.getElementById('tab1'+index).innerText + document.getElementById('tab2'+index).innerText +
        //               document.getElementById('tab3'+index).innerText + document.getElementById('tab4'+index).innerText +
        //               document.getElementById('tab5'+index).innerText + document.getElementById('tab6'+index).innerText;
        questAnswer = '';
        for (let i = 1; i < 7; i++) {
            let temp = document.getElementById('tab'+i+index).innerHTML;
            //console.log(temp);
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
                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'd&d', 1, 0);
                }
                for (let i = 1; i <= 6; i++) {
                    let field = document.getElementById('tab' + i + index);
                    if (!(field.innerHTML === 'Place')) {
                        field.style.color = 'green';
                    }    
                }
                localStorage.setItem('learnButtonSwitch', 'true');
                button.innerHTML = 'Nächste Frage';
                
            } else {
                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'd&d', 0, 0);
                }
                for (let i = 1; i <= 6; i++) {
                    let field = document.getElementById('tab' + i + index);
                    if (!(field.innerHTML === 'Place')) {
                        field.style.color = 'red';
                    }    
                }
            }
        } else if (modeString === 'test'){
            if (questAnswer === answer){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'd&d', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                //carausel.next(); 
                await nextPage(roundID, carausel);   
                for (let i = 1; i <= 6; i++) {
                    let field = document.getElementById('tab' + i + index);
                    if (!(field.innerHTML === 'Place')) {
                        field.style.color = 'green';
                    }    
                }
                button.setAttribute('disabled','true');           
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'd&d', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                //carausel.next();
                await nextPage(roundID, carausel);
                for (let i = 1; i <= 6; i++) {
                    let field = document.getElementById('tab' + i + index);
                    if (!(field.innerHTML === 'Place')) {
                        field.style.color = 'red';
                    }    
                }
                button.setAttribute('disabled','true');
            }
        }
            
    // Freitext
    } else if (level === 'level3') {
        questAnswer = document.getElementById('answer' + index).value;
        if (modeString === 'learn') {
            if (questAnswer === answer){
                // ergebniss speichern
                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'free', 1, 0);
                }

                document.getElementById("answertest" + index).style.color = 'green';
                localStorage.setItem('learnButtonSwitch', 'true');
                button.innerHTML = 'Nächste Frage';

            } else {
                if (!(await feladb.isQuestionClosed(index))){
                    await feladb.closeQuestion(roundID, index, 'free', 0, 0);
                }
                // Zeile rot machen
                //console.log(document.getElementById("answertest" + index));
                document.getElementById("answertest" + index).style.color = 'red';
                
            }
        } else if (modeString === 'test'){
            if (questAnswer === answer){
                // ergebniss speichern
                await feladb.closeQuestion(roundID, index, 'free', 1, 0);
                //alert('Richtig: später nicht mehr angezeigt');
                //carausel.next(); 
                await nextPage(roundID, carausel); 
                document.getElementById("answertest" + index).style.color = 'green';
                document.getElementById("answertest" + index).setAttribute('readonly', 'true');
                button.setAttribute('disabled','true');             
            } else {
                // ergebnis speichern
                await feladb.closeQuestion(roundID, index, 'free', 0, 0);
                //alert('Falsch: später nicht mehr anzeigen');
                //carausel.next();
                await nextPage(roundID, carausel);
                document.getElementById("answertest" + index).style.color = 'red';
                document.getElementById("answertest" + index).setAttribute('readonly', 'true');
                button.setAttribute('disabled','true');
            }
        }   
    }
}

// --> functions for the statistic page <-- //

// funtion to generate the overall statistic page which location is in the ons-tabbar
async function buildStats() {
    
    let res = await feladb.getCategoryStatistics();

    // bar chart: contains rankting for each category
    let xValues0 = ["Ionen", "Wasserstoff, Sauerstoff", "Natrium, Calcium", "Stickstoff", "Kohlenstoff", "Phosphor, Schwefel", "Halogene", "Kohlenwasserstoffe"];

    let yValues0 = [0,0,0,0,0,0,0,0];
    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            yValues0[res[i].category_id-1] = res[i].ranking;
        }
    }

    let barColors0 = ["red","green","blue","orange","pink","yellow","purple","grey"];

    new Chart("chart0", {
    type: "bar",
    data: {
        labels: xValues0,
        datasets: [{
        backgroundColor: barColors0,
        data: yValues0
        }]
    },
    options: {
        legend: {display: false},
        title: {
        display: true,
        text: "Ranking"
        }
    }
    });
    
    // pie chart: contains number of questions answerd per category
    let xValues1 = ["Ionen", "Wasserstoff, Sauerstoff", "Natrium, Calcium", "Stickstoff", "Kohlenstoff", "Phosphor, Schwefel", "Halogene", "Kohlenwasserstoffe"];

    let yValues1 = [0,0,0,0,0,0,0,0];
    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            yValues1[res[i].category_id-1] = res[i].total_questions;
        }
    }

    let barColors1 = ["red","green","blue","orange","pink","yellow","purple","grey"];

    new Chart("chart1", {
    type: "polarArea",
    data: {
        labels: xValues1,
        datasets: [{
        backgroundColor: barColors1,
        data: yValues1
        }]
    },
    options: {
        title: {
        display: true,
        text: "Anzahl Fragen beantwortet"
        }
    }
    });

    // stacked bar chart: contains number of right and wrong answered questions per category
    let xValues2 = ["Ionen", "Wasserstoff, Sauerstoff", "Natrium, Calcium", "Stickstoff", "Kohlenstoff", "Phosphor, Schwefel", "Halogene", "Kohlenwasserstoffe"];

    let yValues2a = [0,0,0,0,0,0,0,0];
    let yValues2b = [0,0,0,0,0,0,0,0];
    if (res.length != 0) {
        for (let i = 0; i < res.length; i++) {
            yValues2a[(res[i].category_id-1)*2] = res[i].right_questions;
            yValues2b[(res[i].category_id-1)*2+1] = -res[i].wrong_questions;
        }
    }

    new Chart("chart2", {
    type: "bar",
    data: {
        labels: xValues2,
        datasets: [{
        label: "Richtig",
        backgroundColor: "green",
        stack: 'Stack 0',
        data: yValues2a
        }, {
        label: "Falsch",
        backgroundColor: "red",
        stack: 'Stack 0',
        data: yValues2b
        }]
    },
    options: {
        title: {
            display: true,
            text: "Anzahl richtiger und falscher Antworten"
            },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
        }
    }
    });
}

async function roundStats(roundID, carausel) {
    
    const carouselItem = ons.createElement(`
    <ons-carousel-item>
        <canvas id="roundChart0" style="width:75%;max-width:700px;max-height:550px"></canvas>
        <canvas id="roundChart1" style="width:100%;max-width:700px;max-height:550px"></canvas>
    </ons-carousel-item>
    `)
    carausel.appendChild(carouselItem);

    // doughnut chart: represents the right and wrong percentage of the results of the current round
    let res = await feladb.getRoundStatistics([roundID]);

    let xValues0 = ["Richtig", "Falsch"];

    let percentage = res[0].right_percentage;
    let yValues0 = [percentage, 100-percentage];

    let barColors0 = ["green", "red"];

    new Chart("roundChart0", {
        type: "doughnut",
        data: {
            labels: xValues0,
            datasets: [{
            backgroundColor: barColors0,
            data: yValues0
            }]
        },
        options: {
            title: {
            display: true,
            text: "Auswertung der aktuellen Runde"
            }
        }
    });

    // stacked bar chart: contains number of right and wrong answered questions for the current and the last four rounds
    let xValues1 = ["aktuelle Runde", "eine Runde zuvor", "zwei Runden zuvor", "drei Runden zuvor", "vier Runden zuvor"];

    let pastRes;
    let pastRoundIDs = [];
    let i = 4;
    while (roundID > 0 && i >= 0) {
        pastRoundIDs.push(roundID);
        roundID--;
        i--;
    }
    pastRes = await feladb.getRoundStatistics(pastRoundIDs);
    let yValues1a = [];
    let yValues1b = [];
    for (let i = 0; i < pastRes.length; i++) {
        yValues1a.push(pastRes[i].right_questions);
        yValues1b.push(-pastRes[i].wrong_questions);
    }

    new Chart("roundChart1", {
    type: "bar",
    data: {
        labels: xValues1,
        datasets: [{
        label: "Richtig",
        backgroundColor: "green",
        stack: 'Stack 0',
        data: yValues1a
        }, {
        label: "Falsch",
        backgroundColor: "red",
        stack: 'Stack 0',
        data: yValues1b
        }]
    },
    options: {
        title: {
            display: true,
            text: "Vergleich mit den letzten Ergebnissen"
            },
        responsive: true,
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        }
    }
    });

}

// additional stuff
document.addEventListener('init', function(event) {
    var page = event.target;

    if (page.id === 'test') {
        page.querySelector('#push-button').onclick = function() {testMode()};

    } else if (page.id === 'learn') {
        page.querySelector('#push-button').onclick = function() {learnMode('learn')};

    } else if (page.id === 'stats') {
        document.addEventListener("feladbready", (e) => {
            buildStats();
            //console.log('Statistics successful builded');
        });
    }
});

window.check = check;
window.pushInTable = pushInTable;
window.mark = mark;
