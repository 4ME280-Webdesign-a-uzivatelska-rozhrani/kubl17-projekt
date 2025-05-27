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
    zobrazHry(hry);
    zobrazTop3(hry); // Pokud chceš, můžeš volat i tady, ale není nutné.
  } catch (error) {
    console.error("Chyba při načítání dat:", error);
  }
}

function zobrazHry(hryData) {
  const seznam = document.getElementById("seznam-her");
  seznam.innerHTML = "";

  hryData.forEach((hra, index) => {
    // Připravíme značku pro TOP 3
    let topText = "";
    if (hra._topTag) {
      topText = `<div class="top-tag">${hra._topTag}</div>`;
    }

    const hraDiv = document.createElement("div");
    hraDiv.className = "hra";

    hraDiv.innerHTML = `
      <h3>${hra.nazev}</h3>
      ${topText}
      <p>Typ: ${hra.typ}</p>
      <p>Počet hráčů: ${hra.hraci_min}–${hra.hraci_max}</p>
      <p>Čas: ${hra.cas_min}–${hra.cas_max} min</p>
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
    if (!isNaN(cas)) filtrovane = filtrovane.filter(hra => hra.cas_max <= cas);

    // Připravíme TOP 3
    const top3 = vyberTop3(filtrovane);

    // Odstraníme TOP 3 z filtrovane, aby se neopakovali
    const top3Ids = new Set(top3.map(h => h.nazev));
    const dalsi = filtrovane.filter(h => !top3Ids.has(h.nazev));

    // Sestavíme finální pole: top3 na začátek + zbytek
    const finalniSeznam = [...top3, ...dalsi];

    zobrazHry(finalniSeznam);
  });
}

// Funkce pro výběr TOP 3 her s označením
function vyberTop3(hryPole) {
  if (hryPole.length === 0) return [];

  // 1. Nejčastěji označená jako oblíbená (libi nejvíc)
  const topLibi = hryPole.reduce((max, hra) => (hra.libi > (max?.libi ?? -1) ? hra : max), null);

  // 2. Nejmenší počet zahrano (minimálně zahrané)
  const topZahrano = hryPole.reduce((min, hra) => (hra.zahrano < (min?.zahrano ?? Infinity) ? hra : min), null);

  // 3. Náhodná
  let nahodna;
  if (hryPole.length === 1) {
    nahodna = hryPole[0];
  } else {
    do {
      nahodna = hryPole[Math.floor(Math.random() * hryPole.length)];
    } while (nahodna.nazev === topLibi.nazev || nahodna.nazev === topZahrano.nazev);
  }

  // Přidej vlastnost _topTag pro zobrazení štítku
  if (topLibi) topLibi._topTag = "TOP favorit";
  if (topZahrano) topZahrano._topTag = "Zahraj si mě prosím";
  if (nahodna) nahodna._topTag = "Náhodná výzva";

  // Odstranit duplikáty pokud se některá hra shoduje (může se stát, když má jen pár her)
  const unikaty = [];
  const nazvy = new Set();

  [topLibi, topZahrano, nahodna].forEach(hra => {
    if (hra && !nazvy.has(hra.nazev)) {
      unikaty.push(hra);
      nazvy.add(hra.nazev);
    }
  });

  return unikaty;
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
      body: JSON.stringify({ hry }),
    });
  } catch (error) {
    console.error("Chyba při ukládání dat:", error);
  }
}
