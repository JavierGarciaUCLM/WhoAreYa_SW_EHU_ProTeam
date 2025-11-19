export {updateStats, getStats, initState}

let initState = function(what, solutionId) { 

    // YOUR CODE HERE
    let stored = localStorage.getItem(what);//busco por el localstorage
    let state = null;

    if (stored) {
        try {
            state = JSON.parse(stored);
        } catch (e) {
            state = null;
        }
    }

    if (!state || typeof state !== "object" || state.solution !== solutionId) { //sino había, lo creoo
        state = {
            guesses: [],
            solution: solutionId
        };
    }
    let updateState = function (guessId) {
        state.guesses.push(guessId);
        localStorage.setItem(what, JSON.stringify(state));
    };
    //paso [state, updateState] como pide el enunciado
    return [state, updateState];
}

function successRate (e){
    // YOUR CODE HERE
}

let getStats = function(what) {
    // YOUR CODE HERE
    //
};


function updateStats(t){
 // YOUR CODE HERE
};


let gamestats = getStats('gameStats');



