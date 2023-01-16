function addMCItem() {
    // carussel item hinzufügen für multiple chooice
    const testcarousel = document.querySelector('#onscarousel');
    console.log(testcarousel);
    
    const carouselItem = ons.createElement(`
        <ons-carousel-item>
            <ons-button>
                starten
            </ons-button>
        </ons-carousel-item>
        `);

    //console.log(carouselItem);

    testcarousel.appendChild(carouselItem);

   
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

    
    // items anhängen - neue frage neues carusel item
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
    } 
});
