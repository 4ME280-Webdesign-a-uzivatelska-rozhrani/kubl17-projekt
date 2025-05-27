const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];

document.addEventListener("DOMContentLoaded", async () => {
  await nactiData();
  naplnTypyHerDropdown();
  zobrazHry(hry);
  nastavFiltraci();
});

async function nactiData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    hry = data.record.hry;
  } catch (error) {
    console.error("Chyba při načítání dat:", error);
  }
}

function naplnTypyHerDropdown() {
  const selectTyp = document.getElementById("filtr-typ");
  if (!selectTyp) return;

  // Vytáhneme unikátní typy her z dat
  const typy = [...new Set(hry.map(hra => hra.typ))].sort();

  // Vyčistíme dropdown a přidáme možnost "Vše"
  selectTyp.innerHTML = '<option value="vse">Vše</option>';

  // Přidáme typy z dat
  typy.forEach(typ => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ.charAt(0).toUpperCase() + typ.slice(1);
    selectTyp.appendChild(option);
  });
}

function zobrazHry(hryData) {
  const seznam = document.getElementById("seznam-her");
  seznam.innerHTML = "";

  hryData.forEach((hra, index) => {
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

    const top3 = vyberTop3(filtrovane);

    const top3Nazvy = new Set(top3.map(h => h.nazev));
    const dalsi = filtrovane.filter(h => !top3Nazvy.has(h.nazev));

    const finalniSeznam = [...top3, ...dalsi];

    zobrazHry(finalniSeznam);
  });
}

function vyberTop3(hryPole) {
  if (hryPole.length === 0) return [];

  const topLibi = hryPole.reduce((max, hra) => (hra.libi > (max?.libi ?? -1) ? hra : max), null);
  const topZahrano = hryPole.reduce((min, hra) => (hra.zahrano < (min?.zahrano ?? Infinity) ? hra : min), null);

  let nahodna;
  if (hryPole.length === 1) {
    nahodna = hryPole[0];
  } else {
    do {
      nahodna = hryPole[Math.floor(Math.random() * hryPole.length)];
    } while (
      nahodna.nazev === topLibi.nazev ||
      nahodna.nazev === topZahrano.nazev
    );
  }

  if (topLibi) topLibi._topTag = "TOP favorit";
  if (topZahrano) topZahrano._topTag = "Zahraj si mě prosím";
  if (nahodna) nahodna._topTag = "Náhodná výzva";

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
