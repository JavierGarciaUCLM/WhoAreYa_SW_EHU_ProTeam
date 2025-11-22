import { stringToHTML } from "./fragments.js";

export { updateStats, getStats, initState, stats };

// 1. LÓGICA DE ESTADO DE LA PARTIDA ACTUAL (Tu código original)
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

    if (!state || typeof state !== "object" || state.solution !== solutionId) {
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

// 2. LÓGICA DE ESTADÍSTICAS HISTÓRICAS (Milestone 5)
const initialStats = {
    winDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Intentos 1 al 8
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
    return JSON.parse(JSON.stringify(initialStats));
};

function updateStats(t) {
    // t es el número de intentos (si ganó) o false (si perdió)
    let s = getStats('gameStats');
    
    s.gamesPlayed++;

    if (t !== false) {
        // Victoria
        s.gamesWon++;
        s.currentStreak++;
        if (s.currentStreak > s.maxStreak) {
            s.maxStreak = s.currentStreak;
        }
        // t es el nº de intentos (1-8), sumamos 1 a esa posición
        if (s.winDistribution[t] !== undefined) {
            s.winDistribution[t]++;
        }
    } else {
        // Derrota
        s.currentStreak = 0;
    }

    // Calcular porcentaje de victorias
    s.successRate = Math.round((s.gamesWon / s.gamesPlayed) * 100);

    localStorage.setItem('gameStats', JSON.stringify(s));
}

// 3. DISEÑO VISUAL (El HTML del Modal)
function stats() {
    const s = getStats('gameStats');
    
    // Calcular la barra más larga para escalar el gráfico
    const maxVal = Math.max(...s.winDistribution.slice(1), 1);

    let barsHTML = '';
    for (let i = 1; i <= 8; i++) {
        let count = s.winDistribution[i];
        let width = (count / maxVal) * 100;
        let colorClass = count > 0 ? 'bg-green-500' : 'bg-gray-500';
        
        // Solo mostramos porcentaje de ancho si hay datos, si no, un mínimo para que se vea
        let styleWidth = Math.max(width, 8) + '%';

        barsHTML += `
        <div class="flex items-center w-full mb-1">
            <div class="w-4 text-xs mr-2 text-gray-600 dark:text-gray-300 font-mono">${i}</div>
            <div class="flex-grow bg-gray-200 dark:bg-gray-700 rounded-sm h-5 overflow-hidden relative">
                <div class="${colorClass} h-full text-xs text-white font-bold flex items-center justify-end pr-2 transition-all duration-500" style="width: ${styleWidth};">
                    ${count}
                </div>
            </div>
        </div>`;
    }

    return `
    <div class="fixed z-50 inset-0 overflow-y-auto" id="statsModal">
        <div class="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
            
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-900 opacity-75" id="closedialog"></div>
            </div>

            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 dark:text-white relative">
                
                <button id="closeStatsBtn" class="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 class="text-lg leading-6 font-bold text-center uppercase tracking-wide mb-4">Estadísticas</h3>
                
                <div class="grid grid-cols-4 gap-2 mb-6 text-center">
                    <div><div class="text-2xl font-bold">${s.gamesPlayed}</div><div class="text-xs uppercase">Jugadas</div></div>
                    <div><div class="text-2xl font-bold">${s.successRate}%</div><div class="text-xs uppercase">% Victorias</div></div>
                    <div><div class="text-2xl font-bold">${s.currentStreak}</div><div class="text-xs uppercase">Racha</div></div>
                    <div><div class="text-2xl font-bold">${s.maxStreak}</div><div class="text-xs uppercase">Max</div></div>
                </div>

                <h4 class="text-sm font-bold mb-2 uppercase">Distribución de intentos</h4>
                <div class="w-full mb-4">
                    ${barsHTML}
                </div>
            </div>
        </div>
    </div>`;
}
