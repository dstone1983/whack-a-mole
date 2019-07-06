/*action button */
const startBtn = document.getElementById('whack-start');
const stopBtn = document.getElementById('whack-stop');
const resetBtn = document.getElementById('whack-reset');
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

const state = {};

function init() {
    const initState = {
        seconds: 60,
        timer: 0,
        moleTile: -1,
        moleTimer: 0,
        moleClicks: 0,
        moleTileList: '',
        paused: false
    }

    for (let prop in initState) {
        state[prop] = initState[prop]
    }

    document.getElementById('whack-count-tally').innerText = state.moleClicks;
    document.getElementById('timer').innerHTML = '1:00';

    enableElement(startBtn, mainActions['start'], 'click');
    enableElement(resetBtn, mainActions['reset'], 'click');
    disableElement(stopBtn, mainActions['stop'], 'click');
}

/*
simulate a click event
param passed is an element
functionality: will take element and create a mouse click event
 */
function simulateClick(elem) {
    let evt;

    if (isIE11) {
        evt = document.createEvent("MouseEvent");
        evt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
    } else {
        evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
    }

    !elem.dispatchEvent(evt);
}

/*
function to disable elements
params: el and function callback reference
functionality: takes any element and disables it and removes an event listener if one passed
 */
function disableElement(el, callback, eventType) {
    const tagName = el.tagName;

    if (tagName === 'INPUT') {
        el.readOnly = true;
    } else {
        if (callback) {
            el.removeEventListener(eventType, callback);
        }

        el.disabled = true;
    }

    el.classList.add('disabled');
}

/*
function to enables elements
params: el and function callback reference
functionality: takes any element and enables it and adds an event listener if one passed
 */
function enableElement(el, callback, eventType) {
    const tagName = el.tagName;

    if (tagName === 'INPUT') {
        el.readOnly = false;
    } else {
        if (callback) {
            el.addEventListener(eventType, callback);
        }

        el.disabled = false;
    }

    el.classList.remove('disabled');
}

/* collection of methods specific to the showing and hiding the moles */
const mole = {
    randomMoleGenerator: function() {
        state.moleTileList = document.querySelectorAll('.mole-tile');
        mole.randomMoleTile();
        state.moleTimer = setTimeout(mole.randomMoleGenerator, (Math.random() * 800) + 800);
    },
    randomMoleTile: function() {
        const currentTile = state.moleTile;

        if (currentTile !== -1) {
            mole.lowerMole();
        }

        mole.raiseMole();
    },
    raiseMole: function() {
        const randomTile = Math.floor((Math.random() * 9));

        state.moleTile = randomTile;
        state.moleTileList[randomTile].children[0].addEventListener('click', mole.successMoleClick);
        state.moleTileList[randomTile].children[0].classList.add('active');
    },
    lowerMole: function() {
        const currentTile = state.moleTile;

        if (currentTile !== -1) {
            state.moleTileList[currentTile].children[0].removeEventListener('click', mole.successMoleClick);
            state.moleTileList[currentTile].children[0].classList.remove('active');
        }
    },
    successMoleClick: function() {
        if (state.moleTileList[state.moleTile].children[0].classList.contains('active')) {
            state.moleClicks++;
            document.getElementById('whack-count-tally').innerText = state.moleClicks;
        }

        mole.lowerMole();
    }
}

/*collection of methods of primary functionality to start, stop and reset the game*/
const mainActions = {
    start: function() {
        clearTimeout(state.timer);

        if (state.seconds === 0) {
            state.seconds = 60;
            state.moleClicks = 0;
            state.paused = false;
            document.getElementById('timer').innerHTML = '1:00';
        }

        document.getElementById('whack-count-tally').innerText = state.moleClicks;

        disableElement(startBtn, mainActions['start'], 'click');
        enableElement(stopBtn, mainActions['stop'], 'click');
        mainActions.startTimer();
        mole.randomMoleGenerator();
    },
    stop: function() {
        mole.lowerMole();
        clearTimeout(state.timer);
        clearTimeout(state.moleTimer);

        state.moleTile = -1
        state.paused = true;

        enableElement(startBtn, mainActions['start'], 'click');
        disableElement(stopBtn, mainActions['stop'], 'click');
    },
    reset: function() {
        clearTimeout(state.timer);
        clearTimeout(state.moleTimer);

        if (!state.paused) {
            mole.lowerMole();
        }

        init();
    },
    startTimer: function() {
        state.timer = setTimeout(mainActions.startTimer, 1000);
        state.seconds--;

        document.getElementById('timer').innerHTML = ':' + state.seconds;

        if (state.seconds <= 0) {
            simulateClick(stopBtn);
        }
    }
}

init();
