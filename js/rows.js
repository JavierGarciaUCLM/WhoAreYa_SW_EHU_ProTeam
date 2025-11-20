import { stringToHTML } from "./fragments.js";
// Importamos updateStats para guardar datos y stats para obtener el HTML visual
import { initState, updateStats, stats } from "./stats.js";

export { setupRows };

// Utility para formatear números si fuera necesario
function pad(a, b) {
    return (1e15 + a + '').slice(-b);
}

const delay = 350;
const attribs = ['nationality', 'leagueId', 'teamId', 'position', 'birthdate'];

let setupRows = function (game) {

    let [state, updateState] = initState('WAYgameState', game.solution.id);
    //game.guesses = state.guesses.slice(); // Sincronizar intentos previos si hay recarga

    function leagueToFlag(leagueId) {
        const leagueMap = {
            564: "es1", // La Liga
            8:   "en1", // Premier League
            82:  "de1", // Bundesliga
            384: "it1", // Serie A
            301: "fr1"  // Ligue 1
        };
        return leagueMap[leagueId] ?? "unknown";
    }

    function getAge(dateString) {
        const birth = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const hasBirthdayPassed = today.getMonth() > birth.getMonth() || 
                                  (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
        
        if (!hasBirthdayPassed) age--;
        return age;
    }

    let check = function (theKey, theValue) {
        const target = game.solution;

        if (theKey === "birthdate") {
            const guessedAge = getAge(theValue);
            const targetAge = getAge(target.birthdate);
            
            if (guessedAge === targetAge) return "correct";
            // Si la edad adivinada es menor, la correcta es "higher" (mayor)
            return guessedAge < targetAge ? "higher" : "lower";
        }

        return target[theKey] === theValue ? "correct" : "incorrect";
    };

    function unblur(outcome) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                document.getElementById("mistery").classList.remove("hue-rotate-180", "blur");
                
                // Quitamos la caja de búsqueda para que no moleste
                const combobox = document.getElementById("combobox");
                if(combobox) combobox.style.display = 'none';

                let color, text;
                if (outcome == 'success') {
                    color = "bg-blue-500";
                    text = "Awesome";
                } else {
                    color = "bg-rose-500";
                    text = "The player was " + game.solution.name;
                }

                document.getElementById("picbox").innerHTML += `
                    <div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white">
                        <div class="p-4">
                            <p class="text-sm text-center font-medium">${text}</p>
                        </div>
                    </div>`;
                resolve();
            }, 2000);
        });
    }

    function closeModal() {
        const modal = document.getElementById("statsModal");
        if (modal) modal.remove();
        // Aseguramos que la imagen sigue visible
        document.getElementById("mistery").classList.remove("hue-rotate-180", "blur");
    }

    function showStats(timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Generamos el HTML de las estadísticas llamando a la función importada
                const statsHTML = stats();
                document.body.appendChild(stringToHTML(statsHTML));

                // Vinculamos el botón de cerrar 'X' del modal generado
                const closeBtn = document.getElementById("showHide");
                if (closeBtn) closeBtn.onclick = closeModal;

                // Vinculamos el click en el fondo oscuro
                bindClose();
                resolve();
            }, timeout);
        });
    }

    function bindClose() {
        const backdrop = document.getElementById("closedialog");
        if (backdrop) {
            backdrop.onclick = closeModal;
        }
    }

    function setContent(guess) {
        return [
            `<img src="https://playfootball.games/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            `${getAge(guess.birthdate)}`
        ];
    }

    function showContent(content, guess) {
        let fragments = '';
        for (let j = 0; j < content.length; j++) {
            let s = ((j + 1) * delay).toString() + "ms";
            // Lógica para flechas de edad (opcional visualmente, aquí se añade clase 'higher'/'lower' si la tuvieras en CSS, o se deja base)
            // Nota: La lógica de color ya la tienes integrada abajo
            
            fragments += `
            <div class="w-1/5 shrink-0 flex justify-center">
                <div class="mx-1 overflow-hidden w-full max-w-2 shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${check(attribs[j], guess[attribs[j]]) == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="max-width: 60px; animation-delay: ${s};">
                    ${content[j]}
                </div>
            </div>`;
        }

        let child = `
        <div class="flex w-full flex-wrap text-l py-2">
            <div class="w-full grow text-center pb-2">
                <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown" style="animation-delay: 0ms;">
                    ${guess.name}
                </div>
            </div>
            ${fragments}
        </div>`;

        let playersNode = document.getElementById('players');
        playersNode.prepend(stringToHTML(child));
    }

    function resetInput() {
        const input = document.getElementById("myInput");
        if (!input) return;
        
        let attempt = game.guesses.length + 1;
        // Si ya terminó el juego visualmente, no mostramos "Intento 9 de 8"
        if (attempt > 8) attempt = 8; 
        
        input.value = "";
        input.placeholder = `Intento ${attempt} de 8`;
        input.disabled = false;
        input.focus();
    }

    let getPlayer = function (playerId) {
        return game.players.find(p => p.id === playerId);
    };

    function gameEnded(lastGuess) {
        const hasGuessed = lastGuess === game.solution.id;
        const outOfTries = game.guesses.length >= 8;
        return hasGuessed || outOfTries;
    }

    // Inicializamos input al cargar
    resetInput();

    // --- Función principal que retorna setupRows ---
    return function (playerId) {
        let guess = getPlayer(playerId);
        // console.log(guess); // Debug

        let content = setContent(guess);

        game.guesses.push(playerId);
        updateState(playerId);

        showContent(content, guess); // Mostramos la fila visualmente
        resetInput(); // Reseteamos el input para el siguiente intento

        if (gameEnded(playerId)) {
            const input = document.getElementById("myInput");
            if (input) {
                input.disabled = true;
                input.placeholder = "Game Over";
            }

            // Lógica de Estadísticas (Milestone 5)
            if (playerId == game.solution.id) {
                // VICTORIA: Pasamos el número de intentos (length actual)
                updateStats(game.guesses.length);
                success();
            } else {
                // DERROTA
                updateStats(false);
                gameOver();
            }

            // Mostramos las estadísticas tras esperar la animación de unblur
            showStats(2500);
        }
    };

    function success() {
        unblur('success');
    }

    function gameOver() {
        unblur('fail');
    }
};