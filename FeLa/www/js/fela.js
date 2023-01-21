function addMCItem() {
    // carussel item hinzufügen für multiple chooice
    const questCar = document.querySelector('#questCar');
    //console.log(questCar);
    
    const carouselItem = ons.createElement(`
            <ons-carousel-item>
                <ons-list>
                    <ons-list-item tappable>
                        <label class="left">
                                <ons-radio name="color" input-id="radio-1" ></ons-radio>
                        </label>

                        <label for="radio-1" class="center">
                            Antwort A
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio name="color" input-id="radio-2" ></ons-radio>
                        </label>

                        <label for="radio-2" class="center">
                            Antwort B
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio name="color" input-id="radio-3" ></ons-radio>
                        </label>

                        <label for="radio-3" class="center">
                            Antwort C
                        </label>
                     </ons-list-item>

                     <ons-list-item tappable>
                        <label class="left">
                                <ons-radio name="color" input-id="radio-4" ></ons-radio>
                        </label>

                        <label for="radio-4" class="center">
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
    

    addMCItem();

    //questCar.next();

    
    // items anhängen - neue frage neues carusel item
}

// checks if answer is correct
function check() {
    console.log('Hey'); 
    let testradiovalue =  document.querySelector('color').value;
    console.log(testradiovalue);

}

document.addEventListener('init', function(event) {
    // var testknopf = document.getElementById("push-button");
    // console.log(testknopf);
    var page = event.target;

    console.log(page);
    if (page.id === 'test') {
        page.querySelector('#push-button').onclick = learnMode;

    } else if (page.id === 'q_test') {
        page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    
    } else if (page.id === 'carousel') {
        let baum = page.querySelector('#questCar');
        let baum2 = baum.querySelector('#confirm');
        console.log(baum2);
    } 
});
