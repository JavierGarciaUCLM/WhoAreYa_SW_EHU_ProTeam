import { stringToHTML } from "./fragments.js";

export { updateStats, getStats, initState, stats }; // Añadimos 'stats' al export

let initState = function(what, solutionId) {
    let stored = localStorage.getItem(what);
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

    return [state, updateState];
}

// Estructura por defecto si es la primera vez que juega
const initialStats = {
    winDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Índices 1-8 (el 0 no se usa o se ignora)
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    successRate: 0
};

let getStats = function(what) {
    let stored = localStorage.getItem(what);
    if (stored) {
        return JSON.parse(stored);
    }
    return JSON.parse(JSON.stringify(initialStats)); // Retornamos una copia limpia
};

function updateStats(t) {
    // t puede ser el número de intentos (victoria) o null/false (derrota)
    // Nota: En tu rows.js tendrás que ajustar cómo llamas a esta función.
    
    let stats = getStats('gameStats');
    stats.gamesPlayed++;

    if (typeof t === 'number' && t <= 8) {
        // VICTORIA
        stats.gamesWon++;
        stats.currentStreak++;
        stats.winDistribution[t]++; // Sumamos 1 al intento correspondiente
        
        if (stats.currentStreak > stats.maxStreak) {
            stats.maxStreak = stats.currentStreak;
        }
    } else {
        // DERROTA
        stats.currentStreak = 0;
        // No actualizamos winDistribution en derrota (normalmente en Wordle es así)
    }

    // Calcular % victorias
    stats.successRate = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

    localStorage.setItem('gameStats', JSON.stringify(stats));
};

// Función para generar el HTML del Modal de Estadísticas
function stats() {
    const s = getStats('gameStats');
    
    // Calculamos el máximo de victorias en un solo intento para escalar las barras
    const maxFrequency = Math.max(...s.winDistribution.slice(1)) || 1;

    // Generamos las barras del gráfico
    let graphHTML = '';
    for (let i = 1; i <= 8; i++) {
        const count = s.winDistribution[i];
        const percentage = (count / maxFrequency) * 100; // Ancho relativo
        const widthClass = percentage > 8 ? `${percentage}%` : 'fit-content'; // Para que quepa el número
        const bgColor = count > 0 ? 'bg-green-500' : 'bg-gray-500';
        
        graphHTML += `
            <div class="flex items-center w-full mb-1">
                <div class="w-4 text-xs mr-1">${i}</div>
                <div class="text-xs text-white font-bold p-1 ${bgColor}" style="width: ${Math.max(percentage, 7)}%; min-width: 20px; text-align: right;">
                    ${count}
                </div>
            </div>
        `;
    }

    // Retornamos el HTML completo del modal
    return `
    <div class="fixed z-50 inset-0 overflow-y-auto" id="statsModal">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-900 opacity-75" id="closedialog"></div>
            </div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 dark:text-white">
                
                <div class="absolute top-0 right-0 pt-4 pr-4">
                    <button type="button" id="showHide" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span class="sr-only">Close</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div>
                    <h3 class="text-lg leading-6 font-medium text-center uppercase tracking-wide mb-4">Estadísticas</h3>
                    
                    <div class="flex justify-center space-x-4 mb-6 text-center">
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold">${s.gamesPlayed}</span>
                            <span class="text-xs">Jugadas</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold">${s.successRate}</span>
                            <span class="text-xs">Win %</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold">${s.currentStreak}</span>
                            <span class="text-xs">Racha</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-2xl font-bold">${s.maxStreak}</span>
                            <span class="text-xs">Max Racha</span>
                        </div>
                    </div>

                    <h4 class="text-md font-medium mb-2 uppercase">Distribución de intentos</h4>
                    <div class="w-full">
                        ${graphHTML}
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}
