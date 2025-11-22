import { stringToHTML } from "./fragments.js";
import { initState, updateStats, stats } from "./stats.js";

export { setupRows };

function pad(a, b){
    return(1e15 + a + '').slice(-b);
}

const delay = 350;
const attribs = ['nationality', 'leagueId', 'teamId', 'position', 'birthdate']

let setupRows = function (game) {

    let [state, updateState] = initState('WAYgameState', game.solution.id);
    //game.guesses = state.guesses.slice();

    // Configuración del botón de estadísticas (Para abrirlo manualmente)
    function setupStatsButton() {
        const btn = document.getElementById("statsIcon");
        if (btn) {
            btn.style.cursor = "pointer";
            btn.onclick = function() {
                showStats(0);
            };
        }
    }
    setupStatsButton();


    function leagueToFlag(leagueId) {
        const leagueMap = {
            564: "es1",
            8:   "en1",
            82:  "de1",
            384: "it1",
            301: "fr1"
        };
        return leagueMap[leagueId] ?? "unknown";
    }

    function getAge(dateString) {
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const hasBirthdayPassed = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
        if (!hasBirthdayPassed) age--;
        return age;
    }
    
    let check = function (theKey, theValue) {
        const target = game.solution;
        if (theKey === "birthdate") {
            const guessedAge = getAge(theValue);
            const targetAge  = getAge(target.birthdate);
            if (guessedAge === targetAge) return "correct";
            return guessedAge < targetAge ? "higher" : "lower";
        }
        return target[theKey] === theValue ? "correct" : "incorrect";
    };

    function unblur(outcome) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.getElementById("mistery").classList.remove("hue-rotate-180", "blur")
                const combo = document.getElementById("combobox");
                if(combo) combo.style.display = 'none'; 

                let color, text
                if (outcome=='success'){
                    color =  "bg-blue-500"
                    text = "Awesome"
                } else {
                    color =  "bg-rose-500"
                    text = "The player was " + game.solution.name
                }
                document.getElementById("picbox").innerHTML += `<div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white"><div class="p-4"><p class="text-sm text-center font-medium">${text}</p></div></div>`
                resolve();
            }, 2000)
        })
    }

    function closeStatsModal() {
        const modal = document.getElementById("statsModal");
        if (modal) modal.remove();
    }

    function showStats(timeout) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.body.appendChild(stringToHTML(stats()));
                
                const closeBtn = document.getElementById("closeStatsBtn");
                if (closeBtn) closeBtn.onclick = closeStatsModal;

                bindClose();
                resolve();
            }, timeout)
        })
    }

    function bindClose() {
        const backdrop = document.getElementById("closedialog");
        if (backdrop) backdrop.onclick = closeStatsModal;
    }


    function setContent(guess) {
        return [
            `<img src="https://playfootball.games/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            `${getAge(guess.birthdate)}`
        ]
    }

    function showContent(content, guess) {
        let fragments = '', s = '';
        for (let j = 0; j < content.length; j++) {
            s = "".concat(((j + 1) * delay).toString(), "ms")
            fragments += `<div class="w-1/5 shrink-0 flex justify-center ">
                            <div class="mx-1 overflow-hidden w-full max-w-2 shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${check(attribs[j], guess[attribs[j]]) == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="max-width: 60px; animation-delay: ${s};">
                                ${content[j]}
                            </div>
                          </div>`
        }

        let child = `<div class="flex w-full flex-wrap text-l py-2">
                        <div class=" w-full grow text-center pb-2">
                            <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown " style="animation-delay: 0ms;">
                                ${guess.name}
                            </div>
                        </div>
                        ${fragments}`

        let playersNode = document.getElementById('players')
        playersNode.prepend(stringToHTML(child))
    }


    function resetInput(){
        const input = document.getElementById("myInput");
        if (!input) return;
        let attempt = game.guesses.length + 1;
        if (attempt > 8) attempt = 8;
        input.value = "";
        input.placeholder = `Intento ${attempt} de 8`;
        input.focus();
    }

    let getPlayer = function (playerId) {
        return game.players.find(p => p.id === playerId);
    }


    function gameEnded(lastGuess){
        const hasGuessed = lastGuess === game.solution.id;
        const outOfTries = game.guesses.length >= 8;
        return hasGuessed || outOfTries;
    }

    resetInput();

    return /* addRow */ function (playerId) {

        let guess = getPlayer(playerId)
        let content = setContent(guess)

        game.guesses.push(playerId)
        updateState(playerId)
        showContent(content, guess)
        resetInput();

        if (gameEnded(playerId)) {
            const input = document.getElementById("myInput");
            if (input) {
                input.disabled = true;
                input.placeholder = "Game Over";
            }
        
            if (playerId == game.solution.id) {
                updateStats(game.guesses.length); 
                success();
            } else if (game.guesses.length == 8) {
                updateStats(false); 
                gameOver();
            }
        
            // -------------------------------------------------
            // HE QUITADO LA SIGUIENTE LÍNEA PARA QUE NO SALTE AUTOMÁTICAMENTE:
            // showStats(2500);
            // -------------------------------------------------
        }
    }

    function success() {
        unblur('success');
    }
    
    function gameOver() {
        unblur('fail');
    }
}