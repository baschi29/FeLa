function addMCItem(radioNumber) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    
    const carouselItem = ons.createElement(`
            <ons-carousel-item>
                <ons-list>
                    <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd1${radioNumber} name="questions" input-id="radio-1" ></ons-radio>
                        </label>

                        <label id=label1${radioNumber} for="radio-1" class="center">
                            Aufgabe ${radioNumber}                    
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd2${radioNumber} name="questions" input-id="radio-2" ></ons-radio>
                        </label>

                        <label id=label2${radioNumber} for="radio-2" class="center">
                            Antwort B
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd3${radioNumber} name="questions" input-id="radio-3" ></ons-radio>
                        </label>

                        <label id=label3${radioNumber} for="radio-3" class="center">
                            Antwort C
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio id=rd4${radioNumber} name="questions" input-id="radio-4" ></ons-radio>
                        </label>

                        <label id=label4${radioNumber} for="radio-4" class="center">
                            Antwort D 
                        </label>
                     </ons-list-item>
                </ons-list>

            <ons-button id='confirm' modifier="large">
                Bestätigen
            </ons-button>


        </ons-carousel-item>
        `);

    //console.log(carouselItem);
    questCar.appendChild(carouselItem);

    var checkButton = document.getElementById('confirm');
    checkButton.addEventListener('click', check);   
}

function addDaDItem(radioNumber) {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    
    const carouselItem = ons.createElement(`
        <ons-carousel-item>
            <p id="demo" onmousedown="mouseDown()">Click me.</p>

            <p>
                <ons-input id="answer" input-id="answertest" modifier="underbar" placeholder="Antwort" float></ons-input>
            </p>

            <ons-button id='confirm' modifier="large">
                Antwort auswählen
            </ons-button>
            
        </ons-carausel-item>
    `);

    
    questCar.appendChild(carouselItem);
    
    document.getElementById('answer').disabled;
    
}  

function addFTEItem(radioNumber) {
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

            <ons-button id='confirm' modifier="large">
                Antwort überprüfen
            </ons-button>
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
    // console.log(selectedLevel);

    const typ = document.getElementById("choose-sel2");
    const typList = typ.options;
    var selectedTyp = typList[typ.selectedIndex].value;
    //localStorage.setItem('typ', selectedTyp);
    
    const direction = document.getElementById("choose-sel3");
    const dirList = direction.options;
    var selectedDirection = dirList[direction.selectedIndex].value;
    //localStorage.setItem('direction', selectedDirection);
    
    
    await document.querySelector('#mainNavigator').pushPage('views/carousel.html', {data: {title: 'Fragen Testmodus'}});
    
    var i = 1;
    if (selectedLevel === 'level1') {
        addMCItem(i);
    } else if (selectedLevel === 'level2') {
        addDaDItem(i);     
    } else if (selectedLevel === 'level3') {
        addFTEItem(i);
    }

    //questCar.next();

    
    // items anhängen - neue frage neues carusel item
}

// checks if answer is correct
function check() {
    console.log('Hey'); 

    //checken ob die Lösung richtig ist
    if (document.getElementById('rd11').checked) {
        let ans1 = document.getElementById('label11').textContent;
        console.log(ans1);
        console.log(ans1 === 'Aufgabe 1');
        
    } else {
        console.log('Falsch');
    }


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

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("Text", event.target.id);
}

function drop(event) {
    var data = event.dataTransfer.getData("Text");
    event.target.appendChild(document.getElementById(data));
    event.preventDefault();
}
