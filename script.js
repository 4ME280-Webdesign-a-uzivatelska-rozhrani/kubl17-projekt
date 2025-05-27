const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];
let aktualniFiltrovane = [];

document.addEventListener("DOMContentLoaded", async () => {
  await nactiData();
  naplnTypyHerDropdown();
  zobrazTop3(hry);
  zobrazHryBezTop3(hry);
  nastavFiltraci();
});

async function nactiData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    hry = data.record.hry;
    aktualniFiltrovane = [...hry];
  } catch (error) {
    console.error("Chyba při načítání dat:", error);
  }
}

function naplnTypyHerDropdown() {
  const selectTyp = document.getElementById("filtr-typ");
  if (!selectTyp) return;

  const typy = [...new Set(hry.map(hra => hra.typ))].sort();

  selectTyp.innerHTML = '<option value="vse">Vše</option>';

  typy.forEach(typ => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ.charAt(0).toUpperCase() + typ.slice(1);
    selectTyp.appendChild(option);
  });
}

function zobrazHryBezTop3(hryData) {
  const seznam = document.getElementById("seznam-her");
  if (!seznam) return;
  seznam.innerHTML = "";

  // Získej hry z top3, aby se neopakovaly
  const top3Hry = getTop3Hry(hryData);

  const hryKZobrazeni = hryData.filter(hra => !top3Hry.includes(hra));

  hryKZobrazeni.forEach((hra, index) => {
    const hraDiv = document.createElement("div");
    hraDiv.className = "hra";

    hraDiv.innerHTML = `
      <h3>${hra.nazev}</h3>
      <p>Typ: ${hra.typ}</p>
      <p>Počet hráčů: ${hra.hraci_min}–${hra.hraci_max}</p>
      <p>Čas: ${hra.cas_min}–${hra.cas_max} min</p>
      <p>👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}</p>
      <button onclick="oznacLibi(${getHraIndex(hra)})">👍 Líbí</button>
      <button onclick="oznacNelibi(${getHraIndex(hra)})">👎 Nelíbí</button>
      <button onclick="oznacZahrano(${getHraIndex(hra)})">✅ Zahrané</button>
    `;

    seznam.appendChild(hraDiv);
  });
}

function getHraIndex(hra) {
  return hry.findIndex(h => h.nazev === hra.nazev);
}

function zobrazTop3(hryData) {
  const top3Container = document.getElementById("top3");
  if (!top3Container) return;
  top3Container.innerHTML = "";

  if (hryData.length === 0) return;

  // 1. Nejčastěji označená jako oblíbená
  const topLibi = [...hryData].sort((a,b) => b.libi - a.libi)[0];

  // 2. Nejmeně zahraná (nejnižší zahrano)
  const topZahrano = [...hryData].sort((a,b) => a.zahrano - b.zahrano)[0];

  // 3. Náhodná
  const nahodna = hryData[Math.floor(Math.random() * hryData.length)];

  // Vyhneme se opakování v top3 (unikátní hry)
  let top3Unikatni = [];
  [topLibi, topZahrano, nahodna].forEach(hra => {
    if (!top3Unikatni.some(h => h.nazev === hra.nazev)) top3Unikatni.push(hra);
  });

  const labels = ["TOP favorit", "Zahraj si mě prosím", "Náhodná výzva"];
  const cssTridy = ["top-favorit", "top-zahraj", "top-nahodna"];

  top3Unikatni.forEach((hra, i) => {
    const div = document.createElement("div");
    const trida = cssTridy[i % cssTridy.length];
    div.className = `top-hra ${trida}`;  // Přidání barvy podle pořadí
    div.innerHTML = `
      <h3>${hra.nazev} <span class="top-label">${labels[i]}</span></h3>
      <p>Typ: ${hra.typ}</p>
      <p>Počet hráčů: ${hra.hraci_min}–${hra.hraci_max}</p>
      <p>Čas: ${hra.cas_min}–${hra.cas_max} min</p>
      <p>👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}</p>
      <button onclick="oznacLibi(${getHraIndex(hra)})">👍 Líbí</button>
      <button onclick="oznacNelibi(${getHraIndex(hra)})">👎 Nelíbí</button>
      <button onclick="oznacZahrano(${getHraIndex(hra)})">✅ Zahrané</button>
    `;
    top3Container.appendChild(div);
  });
}



function getTop3Hry(hryData) {
  if (hryData.length === 0) return [];

  const topLibi = [...hryData].sort((a,b) => b.libi - a.libi)[0];
  const topZahrano = [...hryData].sort((a,b) => a.zahrano - b.zahrano)[0];
  const nahodna = hryData[Math.floor(Math.random() * hryData.length)];

  // Unikátní set
  let top3 = [];
  [topLibi, topZahrano, nahodna].forEach(hra => {
    if (!top3.includes(hra)) top3.push(hra);
  });
  return top3;
}

function nastavFiltraci() {
  const formular = document.getElementById("filtr-form");
  if (!formular) return;

  formular.addEventListener("submit", (e) => {
    e.preventDefault();

    const typ = document.getElementById("filtr-typ").value;
    const hraciMin = parseInt(document.getElementById("filtr-hraci-min").value);
    const hraciMax = parseInt(document.getElementById("filtr-hraci-max").value);
    const casMax = parseInt(document.getElementById("filtr-cas-max").value);

    // Ošetření nesmyslných filtrů (min > max)
    if (!isNaN(hraciMin) && !isNaN(hraciMax) && hraciMin > hraciMax) {
      alert("Minimální počet hráčů nemůže být větší než maximální.");
      return;
    }

    let filtrovane = [...hry];

    if (typ && typ !== "vse") {
      filtrovane = filtrovane.filter(hra => hra.typ === typ);
    }
    if (!isNaN(hraciMin)) {
      filtrovane = filtrovane.filter(hra => hra.hraci_max >= hraciMin);
    }
    if (!isNaN(hraciMax)) {
      filtrovane = filtrovane.filter(hra => hra.hraci_min <= hraciMax);
    }
    if (!isNaN(casMax)) {
      filtrovane = filtrovane.filter(hra => hra.cas_max <= casMax);
    }

    aktualniFiltrovane = filtrovane;

    zobrazTop3(filtrovane);
    zobrazHryBezTop3(filtrovane);
  });
}

async function oznacLibi(index) {
  hry[index].libi += 1;
  await ulozData();
  obnovPoKliknuti();
}

async function oznacNelibi(index) {
  hry[index].nelibi += 1;
  await ulozData();
  obnovPoKliknuti();
}

async function oznacZahrano(index) {
  hry[index].zahrano += 1;
  await ulozData();
  obnovPoKliknuti();
}

function obnovPoKliknuti() {
  // Znovu aplikuj filtr z aktuálních hodnot formuláře
  const typ = document.getElementById("filtr-typ").value;
  const hraciMin = parseInt(document.getElementById("filtr-hraci-min").value);
  const hraciMax = parseInt(document.getElementById("filtr-hraci-max").value);
  const casMax = parseInt(document.getElementById("filtr-cas-max").value);

  let filtrovane = [...hry];

  if (typ && typ !== "vse") {
    filtrovane = filtrovane.filter(hra => hra.typ === typ);
  }
  if (!isNaN(hraciMin)) {
    filtrovane = filtrovane.filter(hra => hra.hraci_max >= hraciMin);
  }
  if (!isNaN(hraciMax)) {
    filtrovane = filtrovane.filter(hra => hra.hraci_min <= hraciMax);
  }
  if (!isNaN(casMax)) {
    filtrovane = filtrovane.filter(hra => hra.cas_max <= casMax);
  }

  aktualniFiltrovane = filtrovane;
  zobrazTop3(filtrovane);
  zobrazHryBezTop3(filtrovane);
}


function obnovZobrazeni() {
  zobrazTop3(aktualniFiltrovane);
  zobrazHryBezTop3(aktualniFiltrovane);
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
