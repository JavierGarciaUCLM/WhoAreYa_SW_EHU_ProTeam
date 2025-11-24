import { setupRows } from "./rows.js";

export { autocomplete };

function autocomplete(inp, game) {

    let addRow = setupRows(game);
    let players = game.players;
    let currentFocus;

    inp.addEventListener("input", function (e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1; // CAMBIO: Iniciamos en -1
        
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        // Lógica de búsqueda
        for (i = 0; i < players.length; i++) {
            // Usamos tu lógica de match si existe, o un includes básico como fallback
            let matchFound = false;
            
            if (window.WAY && typeof window.WAY.match === 'function') {
                const matches = window.WAY.match(players[i].name, val, { insideWords: true, findAllOccurrences: true });
                matchFound = (matches && matches.length > 0);
            } else {
                // Fallback simple por si WAY.match falla
                matchFound = players[i].name.toUpperCase().includes(val.toUpperCase());
            }

            if (matchFound) {
                b = document.createElement("DIV");
                b.classList.add('flex', 'items-start', 'gap-x-3', 'leading-tight', 'uppercase', 'text-sm');
                
                // Imagen del equipo
                b.innerHTML = `<img src="https://cdn.sportmonks.com/images/soccer/teams/${players[i].teamId % 32}/${players[i].teamId}.png" width="28" height="28">`;
                
                b.innerHTML += `<div class='self-center'>
                                    <span class='font-bold'>${players[i].name.substr(0,val.length)}</span><span>${players[i].name.substr(val.length)}</span>
                                    <input type='hidden' name='name' value='${players[i].name}'>
                                    <input type='hidden' name='id' value='${players[i].id}'>
                                </div>`;

                b.addEventListener("click", function (e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();

                    const idStr = this.getElementsByTagName("input")[1].value;
                    const id = parseInt(idStr, 10);
                    if (!Number.isNaN(id)) {
                        try {
                            addRow(id);
                        } catch (err) {
                            console.warn("Error en addRow:", err);
                        }
                    }
                });
                a.appendChild(b);
            }
        }
    });

    inp.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        
        if (e.keyCode == 40) { // Abajo
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // Arriba
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1) {
                // Si se usaron flechas, seleccionar el activo
                if (x) x[currentFocus].click();
            } else if (x && x.length > 0) {
                // NUEVO: Si no se usaron flechas, seleccionar el PRIMERO de la lista automáticamente
                x[0].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active", "bg-slate-200", "pointer");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active", "bg-slate-200", "pointer");
        }
    }

    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
