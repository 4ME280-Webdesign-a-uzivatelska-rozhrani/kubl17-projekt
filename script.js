const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];
let posledniFiltry = {
  typ: "vse",
  hraciMin: null,
  casMax: null
};

document.addEventListener("DOMContentLoaded", async () => {
  await nactiData();
  naplnTypyHerDropdown();
  nastavFiltraci();
  obnovZobrazeni();
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

  const typy = [...new Set(hry.map(hra => hra.typ))].sort();
  selectTyp.innerHTML = '<option value="vse">Vše</option>';

  typy.forEach(typ => {
    const option = document.createElement("option");
    option.value = typ;
    option.textContent = typ.charAt(0).toUpperCase() + typ.slice(1);
    selectTyp.appendChild(option);
  });
}

function nastavFiltraci() {
  const formular = document.getElementById("filtr-form");
  if (!formular) return;

  formular.addEventListener("submit", (e) => {
    e.preventDefault();

    posledniFiltry.typ = document.getElementById("filtr-typ").value;
    posledniFiltry.hraciMin = parseInt(document.getElementById("filtr-hraci-min").value);
    // hraciMax odstraněno
    posledniFiltry.casMax = parseInt(document.getElementById("filtr-cas-max").value);

    // odstraněna validace hraciMin > hraciMax

    obnovZobrazeni();
  });
}

function filtrujHry() {
  let filtrovane = [...hry];

  if (posledniFiltry.typ && posledniFiltry.typ !== "vse") {
    filtrovane = filtrovane.filter(hra => hra.typ === posledniFiltry.typ);
  }
   if (!isNaN(posledniFiltry.hraciMin)) {
    filtrovane = filtrovane.filter(hra =>hra.hraci_min <= posledniFiltry.hraciMin && hra.hraci_max >= posledniFiltry.hraciMin);
  }
  // odstraněno filtrování podle hraciMax
  if (!isNaN(posledniFiltry.casMax)) {
    filtrovane = filtrovane.filter(hra => hra.cas_min <= posledniFiltry.casMax);

  }

  return filtrovane;
}

function getTop3HryOnce(hryData) {
  const kopie = [...hryData];
  const top3 = [];

  if (kopie.length === 0) return top3;

  kopie.sort((a, b) => b.libi - a.libi);
  const topLibi = kopie.shift();
  top3.push(topLibi);

 kopie.sort((a, b) => a.zahrano - b.zahrano);
const topZahrano = kopie.find(h => h.nazev !== topLibi.nazev);

  if (topZahrano) {
    kopie.splice(kopie.indexOf(topZahrano), 1);
    top3.push(topZahrano);
  }

  if (kopie.length > 0) {
    const nahodna = kopie[Math.floor(Math.random() * kopie.length)];
    top3.push(nahodna);
  }

  return top3;
}

function getHraIndex(hra) {
  return hry.findIndex(h => h.nazev === hra.nazev);
}

function obnovZobrazeni() {
  const filtrovane = filtrujHry();
  const top3 = getTop3HryOnce(filtrovane);
  zobrazTop3(top3);
  zobrazHryBezTop3(filtrovane, top3);
}

function zobrazTop3(top3) {
  const top3Container = document.getElementById("top3");
  if (!top3Container) return;
  top3Container.innerHTML = "";

  const labels = ["TOP favorit", "Zahraj si mě prosím", "Náhodná výzva"];
  const cssTridy = ["top-favorit", "top-zahraj", "top-nahodna"];

  top3.forEach((hra, i) => {
    const div = document.createElement("div");
    div.className = `top-hra ${cssTridy[i] || ""}`;
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

function zobrazHryBezTop3(hryData, top3) {
  const seznam = document.getElementById("seznam-her");
  if (!seznam) return;
  seznam.innerHTML = "";

  const topNazvy = top3.map(h => h.nazev);
  const ostatniHry = hryData.filter(hra => !topNazvy.includes(hra.nazev));

  ostatniHry.forEach((hra) => {
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

async function oznacLibi(index) {
  hry[index].libi += 1;
  aktualizujZobrazeniHry(index);
  ulozData(index, "libi");
}

async function oznacNelibi(index) {
  hry[index].nelibi += 1;
  aktualizujZobrazeniHry(index);
  ulozData(index, "nelibi");
}

async function oznacZahrano(index) {
  hry[index].zahrano += 1;
  aktualizujZobrazeniHry(index);
  ulozData(index, "zahrano");
}


function aktualizujZobrazeniHry(index) {
  const hra = hry[index];

  const divy = document.querySelectorAll(".hra, .top-hra");
  divy.forEach(div => {
    const h3 = div.querySelector("h3");
    if (!h3) return;

    if (h3.textContent.includes(hra.nazev)) {
      const p = div.querySelectorAll("p");
      if (p.length >= 4) {
        p[3].innerHTML = `👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}`;
      }
    }
  });
}

async function ulozData(index, field) {
  const hra = hry[index];

  try {
    await fetch(API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nazev: hra.nazev,
        field
      }),
    });
  } catch (error) {
    console.error("Chyba při ukládání dat:", error);
  }
}
