import { setupRows } from "./rows.js";

export { autocomplete }

function autocomplete(inp, game) {

    let addRow = setupRows(game);

    let players = game.players;

    let currentFocus;

    inp.addEventListener("input", function (e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -2;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        for (i = 0; i < players.length; i++) {
            // comprobamos si el nombre empieza por lo que ha escrito el usuario (case-insensitive)
            if (players[i].name.toUpperCase().startsWith(val.toUpperCase())) {

                b = document.createElement("DIV");
                b.classList.add('flex', 'items-start', 'gap-x-3', 'leading-tight', 'uppercase', 'text-sm');

                b.innerHTML = `<img src="https://cdn.sportmonks.com/images/soccer/teams/${players[i].teamId % 32}/${players[i].teamId}.png"  width="28" height="28">`;

                // resaltamos las letras coincidentes en negrita y mostramos el resto del nombre


                b.innerHTML += `<div class='self-center'>
                                    <span class='font-bold'>${players[i].name.substr(0,val.length)}</span><span>${players[i].name.substr(val.length)}</span>
                                    <input type='hidden' name='name' value='${name}'>
                                    <input type='hidden' name='id' value='${players[i].id}'>
                                </div>`;

                b.addEventListener("click", function (e) {
                    // ponemos el valor en el input (el first hidden es el nombre)
                    inp.value = this.getElementsByTagName("input")[0].value;

                    closeAllLists();

                    // Ejecutamos addRow pasando el id (ajusta si tu setupRows necesita otra cosa)
                    const idStr = this.getElementsByTagName("input")[1].value;
                    const id = parseInt(idStr, 10);
                    if (!Number.isNaN(id)) {
                        try {
                            addRow(id);
                        } catch (err) {

                            console.warn("addRow falló con id, revisa setupRows:", err);
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
        if (e.keyCode == 40) {
            currentFocus += 2;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus -= 2;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
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