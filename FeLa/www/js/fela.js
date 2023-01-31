function addMCItem(questNumber) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    
    var answer = 'Antwort B';

    const carouselItem = ons.createElement(`
            <ons-carousel-item>
                <h1 align="center">Placeholder Frage</h1>
                <ons-list>
                    <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd1${questNumber} name="questions" input-id="radio-1${questNumber}" ></ons-radio>
                        </label>

                        <label id=label1${questNumber} for="radio-1${questNumber}" class="center">
                            Aufgabe ${questNumber}                    
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd2${questNumber} name="questions" input-id="radio-2${questNumber}" ></ons-radio>
                        </label>

                        <label id=label2${questNumber} for="radio-2${questNumber}" class="center">
                            Antwort B
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd3${questNumber} name="questions" input-id="radio-3${questNumber}" ></ons-radio>
                        </label>

                        <label id=label3${questNumber} for="radio-3${questNumber}" class="center">
                            Antwort C
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd4${questNumber} name="questions" input-id="radio-4${questNumber}" ></ons-radio>
                        </label>

                        <label id=label4${questNumber} for="radio-4${questNumber}" class="center">
                            Antwort D 
                        </label>
                     </ons-list-item>
                </ons-list>

            <ons-button modifier="large" onclick="check('level1', ${questNumber}, '${answer}')">Antwort überprüfen</ons-button>
            


        </ons-carousel-item>
        `);

    //console.log(carouselItem);
    questCar.appendChild(carouselItem);

    
}

function addDaDItem(questNumber) {
    // carussel item hinzufügen für drag and drop mit tabelle und Buttons
    const questCar = document.querySelector('#questCar');

    let answer = "H2O";
    
    const carouselItem = ons.createElement(`
        <ons-carousel-item>
            <h1 align="center">Wasser</h1>
            <p style="text-align: center;">
                <ons-button id=DaD1${questNumber} modifier="quiet" onclick="mark(this, 'DaD1${questNumber}')"> H </ons-button>
                <ons-button id=DaD2${questNumber} modifier="quiet" onclick="mark(this, 'DaD2${questNumber}')"> 2 </ons-button>
                <ons-button id=DaD3${questNumber} modifier="quiet" onclick="mark(this, 'DaD3${questNumber}')"> O </ons-button>
            </p>

            <p style="text-align: center;">
                <ons-button id=DaD4${questNumber} modifier="quiet" onclick="mark(this, 'DaD4${questNumber}')"> P </ons-button>
                <ons-button id=DaD5${questNumber} modifier="quiet" onclick="mark(this, 'DaD5${questNumber}')"> Li </ons-button>
                <ons-button id=DaD6${questNumber} modifier="quiet" onclick="mark(this, 'DaD6${questNumber}')"> ${questNumber} </ons-button>
            </p>

            <style>
                table,th,td{
                    table-layout: fixed;
                    border:3px solid #cccccc;
                    border-style: solid;
                    border-collapse: collapse;
                    text-align: center;
                    padding: 5px;
                    width:42px; 
                    height:42px; 
                }    
            </style>
            <table align="center"> 
                <tr>
                    <td id=tab1${questNumber} onclick="pushInTable(this)"></td>   
                    <td id=tab2${questNumber} onclick="pushInTable(this)"></td> 
                    <td id=tab3${questNumber} onclick="pushInTable(this)"></td> 
                    <td id=tab4${questNumber} onclick="pushInTable(this)"></td> 
                    <td id=tab5${questNumber} onclick="pushInTable(this)"></td> 
                    <td id=tab6${questNumber} onclick="pushInTable(this)"></td> 
                </tr>
            </table>
            <p></p>

            <ons-button modifier="large" onclick="check('level2', ${questNumber}, '${answer}')">Antwort überprüfen</ons-button>
            
        </ons-carausel-item>
    `);

    questCar.appendChild(carouselItem);   
}  

function addFTEItem(questNumber) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    
    const carouselItem = ons.createElement(`
        <ons-carausel-item>    
            <h1>
                Placeholder Frage
            </h1>
            <br></br>
            <p>
                <ons-input id="answer" input-id="answertest" modifier="underbar" placeholder="Antwort" float></ons-input>
            </p>
            
            <ons-button modifier="large" onclick="check('level3', ${questNumber})">Antwort überprüfen</ons-button>
            
        </ons-carausel-item>  
    `);

    questCar.appendChild(carouselItem);
    
    var checkButton = document.getElementById('confirm');
    checkButton.addEventListener('click', check); 
}  

// https://onsen.io/v2/guide/tutorial.html#carousels
async function learnMode() {
    // carussel sseite pushen
    const level = document.getElementById("choose-sel1");
    const lvList = level.options;
    var selectedLevel = lvList[level.selectedIndex].value;

    const typ = document.getElementById("choose-sel2");
    const typList = typ.options;
    var selectedTyp = typList[typ.selectedIndex].value;
    
    const direction = document.getElementById("choose-sel3");
    const dirList = direction.options;
    var selectedDirection = dirList[direction.selectedIndex].value;
    
    
    await document.querySelector('#mainNavigator').pushPage('views/carousel.html', {data: {title: 'Fragen Testmodus'}});
    
    //Carousel items anhängen
    var i = 1;
    if (selectedLevel === 'level1') {
        for (let index = 0; index < 9; index++) {
            addMCItem(index);     
        }
    } else if (selectedLevel === 'level2') {
        for (let index = 0; index < 9; index++) {
            addDaDItem(index);     
        }
    } else if (selectedLevel === 'level3') {
            
        addFTEItem(i);
    }

    questCar.next();

}

//Functions for Drag end Drop
function mark(pushedButton, buttonID) {
    pushedButton.style.backgroundColor = 'lightblue';
    localStorage.setItem("markedButton", buttonID);
    localStorage.setItem("buttonText", pushedButton.innerText);
    
}
function pushInTable(tableField) {
    if (tableField.innerText === '') {
        var markedButton = document.getElementById(localStorage.getItem("markedButton"));
        var buttonText = localStorage.getItem("buttonText");
        markedButton.style.backgroundColor = "transparent";
        tableField.innerText = buttonText;
    
        localStorage.clear();
    } else {
        tableField.innerText = '';
        tableField.style.color = 'black';
    }
}

// checks if answer is correct
function check(level, index, answer) {
    console.log(level); 
    console.log(index);
    var carausel = document.getElementById('questCar');
    var questAnswer;
    // Multiple Choice
    if (level === 'level1') {
        if (document.getElementById('rd1'+index).checked) {
            questAnswer = document.getElementById('label1'+index).innerText;       
        } else if (document.getElementById('rd2'+index).checked) {
            questAnswer = document.getElementById('label2'+index).innerText;
        } else if (document.getElementById('rd3'+index).checked) {
            questAnswer = document.getElementById('label3'+index).innerText;
        } else if (document.getElementById('rd4'+index).checked) {
            questAnswer = document.getElementById('label3'+index).innerText;
        }

        if (questAnswer === answer) {
            alert('Richtig');
            carausel.next();
        } else {
            alert('Falsh');
        }
       
    //Drag and Drop    
    } else if (level === 'level2') {
        questAnswer = document.getElementById('tab1'+index).innerText + document.getElementById('tab2'+index).innerText +
                      document.getElementById('tab3'+index).innerText + document.getElementById('tab4'+index).innerText +
                      document.getElementById('tab5'+index).innerText + document.getElementById('tab6'+index).innerText;
        
        if (questAnswer === answer) {
            alert('Jeei');
            carausel.next();
        } else {
            document.getElementById('tab1'+index).style.color = 'red';
            document.getElementById('tab2'+index).style.color = 'red';
            document.getElementById('tab3'+index).style.color = 'red'; 
            document.getElementById('tab4'+index).style.color = 'red';
            document.getElementById('tab5'+index).style.color = 'red';
            document.getElementById('tab6'+index).style.color = 'red';
        }
        
    // Freitext
    } else if (level === 'level3') {
    }   
    //checken ob die Lösung richtig ist


}


document.addEventListener('init', function(event) {
    // var testknopf = document.getElementById("push-button");
    // console.log(testknopf);
    var page = event.target;

    //console.log(page);
    if (page.id === 'test') {
        page.querySelector('#push-button').onclick = learnMode;

    } else if (page.id === 'q_test') {
        page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    
    } 
});


