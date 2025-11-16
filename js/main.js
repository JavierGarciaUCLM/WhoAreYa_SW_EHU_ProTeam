import { folder, leftArrow } from "./fragments.js";
import { fetchJSON } from "./loaders.js";
import { setupRows } from "./rows.js";

function differenceInDays(date1) {
  //YOUR CODE HERE
  const start = new Date(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate()
  );
  const today = new Date();
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); //normalizado de fechas y toma de día

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diffMs = end - start;
  return Math.floor(diffMs / MS_PER_DAY) + 1; //suma de 1 día como pide el enunciado
}

let difference_In_Days = differenceInDays(new Date("01-10-2025"));

window.onload = function () {
  document.getElementById( "gamenumber").innerText = difference_In_Days.toString();
  document.getElementById("back-icon").innerHTML = folder + leftArrow;
};

let game = {
  guesses: [],
  solution: {},
  players: [],
  leagues: []
};

function getSolution(players, solutionArray, difference_In_Days) {
    // YOUR CODE HERE 
  const index = (difference_In_Days - 1) % solutionArray.length;//búsqueda circular del array de soluciones
  const solutionId = solutionArray[index];//ID jugador top secret
  const player = players.find(p => p.id === solutionId);//pillamos el jugador completo
  return player;
}


Promise.all([fetchJSON("fullplayers25"), fetchJSON("solution25")]).then(
  (values) => {

    let solution;
    
    [game.players, solution] = values;

    game.solution = getSolution(game.players, solution, difference_In_Days);
    
    console.log(game.solution);

    document.getElementById("mistery").src = `https://playfootball.games/media/players/${game.solution.id % 32}/${game.solution.id}.png`;


      // YOUR CODE HERE
    let addRow = setupRows(game); //estado del juego
    // get myInput object...
    const input = document.getElementById("guess"); 
      // when the user types a number an press the Enter key:
      input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          const playerId = parseInt(input.value, 10);
          if (!isNaN(playerId)) {
        addRow( playerId/* the ID of the player, where is it? */);
        input.value = "";
    //  
  }
}
});

  }
);
