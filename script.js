const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];

document.addEventListener("DOMContentLoaded", async () => {
  await nactiData();
  zobrazHry(hry);
  nastavFiltraci();
});

async function nactiData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    hry = data.record.hry;

    // Zavoláme filtrování s defaultními hodnotami (vše)
    zobrazHry(hry, {}); // aby se zobrazilo normálně, bez top štítků

    // Nebo můžeme rovnou zavolat filtrovací funkci s prázdným filtrem (pokud chceš, aby se rovnou zobrazily TOP 3)
    // simulace filtrování:
    const topOblibena = hry.reduce((max, hra) => hra.libi > (max?.libi ?? -1) ? hra : max, null);
    const topZahraj = hry.reduce((min, hra) => hra.zahrano < (min?.zahrano ?? Infinity) ? hra : min, null);
    const ostatni = hry.filter(h => h !== topOblibena && h !== topZahraj);
    const topNahodna = ostatni.length > 0 ? ostatni[Math.floor(Math.random() * ostatni.length)] : null;

    let novePoradi = [];
    if (topOblibena) novePoradi.push(topOblibena);
    if (topZahraj && topZahraj !== topOblibena) novePoradi.push(topZahraj);
    if (topNahodna && topNahodna !== topOblibena && topNahodna !== topZahraj) novePoradi.push(topNahodna);

    hry.forEach(hra => {
      if (!novePoradi.includes(hra)) novePoradi.push(hra);
    });

    zobrazHry(novePoradi, { topOblibena, topZahraj, topNahodna });
  } catch (error) {
    console.error("Chyba při načítání dat:", error);
  }
}


function naplnFiltrTypy(hryData) {
  const selectTyp = document.getElementById("filtr-typ");

  // získáme unikátní typy her
  const typy = [...new Set(hryData.map(hra => hra.typ))].sort();

  // přidáme každý typ jako option
  typy.forEach(typ => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ.charAt(0).toUpperCase() + typ.slice(1);
    selectTyp.appendChild(option);
  });
}

function zobrazHry(hryData, topObj = {}) {
  const seznam = document.getElementById("seznam-her");
  seznam.innerHTML = "";

  hryData.forEach((hra, index) => {
    const hraDiv = document.createElement("div");
    hraDiv.className = "hra";

    // Rozpoznání, jestli je hra v TOP 3
    let specialLabel = "";
    if (topObj.topOblibena === hra) specialLabel = '<span class="top-label">TOP favorit</span>';
    else if (topObj.topZahraj === hra) specialLabel = '<span class="top-label">Zahraj si mě prosím</span>';
    else if (topObj.topNahodna === hra) specialLabel = '<span class="top-label">Náhodná výzva</span>';

    hraDiv.innerHTML = `
      <h3>${hra.nazev} ${specialLabel}</h3>
      <p>Typ: ${hra.typ}</p>
      <p>Počet hráčů: ${hra.hraci_min} - ${hra.hraci_max}</p>
      <p>Čas: ${hra.cas_min} - ${hra.cas_max} min</p>
      <p>👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}</p>
      <button onclick="oznacLibi(${index})">👍 Líbí</button>
      <button onclick="oznacNelibi(${index})">👎 Nelíbí</button>
      <button onclick="oznacZahrano(${index})">✅ Zahrané</button>
    `;

    seznam.appendChild(hraDiv);
  });
}


function nastavFiltraci() {
  const formular = document.getElementById("filtr-form");

  formular.addEventListener("submit", (e) => {
    e.preventDefault();
    const typ = document.getElementById("filtr-typ").value;
    const hraci = parseInt(document.getElementById("filtr-hraci").value);
    const cas = parseInt(document.getElementById("filtr-cas").value);

    let filtrovane = [...hry];

    if (typ && typ !== "vse") filtrovane = filtrovane.filter(hra => hra.typ === typ);
    if (!isNaN(hraci)) filtrovane = filtrovane.filter(hra => hra.hraci_min <= hraci && hra.hraci_max >= hraci);
    if (!isNaN(cas)) filtrovane = filtrovane.filter(hra => hra.cas_min <= cas && hra.cas_max >= cas);

    if (filtrovane.length === 0) {
      zobrazHry([]);
      zobrazTop3([]);
      return;
    }

    // 1. Nejčastěji označená jako oblíbená (max libi)
    const topOblibena = filtrovane.reduce((max, hra) => hra.libi > (max?.libi ?? -1) ? hra : max, null);
    // 2. Nejméně nehraná (min zahrano)
    const topZahraj = filtrovane.reduce((min, hra) => hra.zahrano < (min?.zahrano ?? Infinity) ? hra : min, null);
    // 3. Náhodná (mimo ty 2 výše)
    const ostatni = filtrovane.filter(h => h !== topOblibena && h !== topZahraj);
    const topNahodna = ostatni.length > 0 ? ostatni[Math.floor(Math.random() * ostatni.length)] : null;

    // Sestavujeme nový seznam s TOP 3 na začátku (bez duplicit)
    let novePoradi = [];
    if (topOblibena) novePoradi.push(topOblibena);
    if (topZahraj && topZahraj !== topOblibena) novePoradi.push(topZahraj);
    if (topNahodna && topNahodna !== topOblibena && topNahodna !== topZahraj) novePoradi.push(topNahodna);

    // Přidáme zbytek her, které nejsou v top 3
    filtrovane.forEach(hra => {
      if (!novePoradi.includes(hra)) novePoradi.push(hra);
    });

    zobrazHry(novePoradi, { topOblibena, topZahraj, topNahodna });
  });
}


function oznacLibi(index) {
  hry[index].libi += 1;
  ulozData();
  zobrazHry(hry);
}

function oznacNelibi(index) {
  hry[index].nelibi += 1;
  ulozData();
  zobrazHry(hry);
}

function oznacZahrano(index) {
  hry[index].zahrano += 1;
  ulozData();
  zobrazHry(hry);
}

async function ulozData() {
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hry })
    });
  } catch (error) {
    console.error("Chyba při ukládání dat:", error);
  }
}

function zobrazTop3(hryData) {
  // Implementace top 3 her (podle líbí, méně hrané, náhodné)
  // Můžeš doplnit podle potřeby
}
