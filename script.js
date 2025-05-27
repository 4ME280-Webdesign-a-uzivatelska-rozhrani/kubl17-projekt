const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];
let posledniFiltry = {
  typ: "vse",
  hraciMin: null,
  hraciMax: null,
  casMax: null
};

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

function getTop3HryOnce(hryData) {
  const kopie = [...hryData];
  const top3 = [];

  if (kopie.length === 0) return top3;

  // Nejvíce líbí
  kopie.sort((a, b) => b.libi - a.libi);
  const topLibi = kopie.shift();
  top3.push(topLibi);

  // Nejvíce zahrané (odstraníme topLibi pokud byl zároveň)
  kopie.sort((a, b) => b.zahrano - a.zahrano);
  const topZahrano = kopie.find(h => h.nazev !== topLibi.nazev);
  if (topZahrano) {
    kopie.splice(kopie.indexOf(topZahrano), 1);
    top3.push(topZahrano);
  }

  // Náhodná zbylá hra
  if (kopie.length > 0) {
    const nahodna = kopie[Math.floor(Math.random() * kopie.length)];
    top3.push(nahodna);
  }

  return top3;
}



function getHraIndex(hra) {
  return hry.findIndex(h => h.nazev === hra.nazev);
}

function nastavFiltraci() {
  const formular = document.getElementById("filtr-form");
  if (!formular) return;

  formular.addEventListener("submit", (e) => {
    e.preventDefault();

    posledniFiltry.typ = document.getElementById("filtr-typ").value;
    posledniFiltry.hraciMin = parseInt(document.getElementById("filtr-hraci-min").value);
    posledniFiltry.hraciMax = parseInt(document.getElementById("filtr-hraci-max").value);
    posledniFiltry.casMax = parseInt(document.getElementById("filtr-cas-max").value);

    if (!isNaN(posledniFiltry.hraciMin) && !isNaN(posledniFiltry.hraciMax) && posledniFiltry.hraciMin > posledniFiltry.hraciMax) {
      alert("Minimální počet hráčů nemůže být větší než maximální.");
      return;
    }

    obnovZobrazeni();
  });
}

function filtrujHry() {
  let filtrovane = [...hry];

  if (posledniFiltry.typ && posledniFiltry.typ !== "vse") {
    filtrovane = filtrovane.filter(hra => hra.typ === posledniFiltry.typ);
  }
  if (!isNaN(posledniFiltry.hraciMin)) {
    filtrovane = filtrovane.filter(hra => hra.hraci_max >= posledniFiltry.hraciMin);
  }
  if (!isNaN(posledniFiltry.hraciMax)) {
    filtrovane = filtrovane.filter(hra => hra.hraci_min <= posledniFiltry.hraciMax);
  }
  if (!isNaN(posledniFiltry.casMax)) {
    filtrovane = filtrovane.filter(hra => hra.cas_max <= posledniFiltry.casMax);
  }

  return filtrovane;
}

async function oznacLibi(index) {
  hry[index].libi += 1;
  aktualizujZobrazeniHry(index);
  ulozData();
}

async function oznacNelibi(index) {
  hry[index].nelibi += 1;
  aktualizujZobrazeniHry(index);
  ulozData();
}

async function oznacZahrano(index) {
  hry[index].zahrano += 1;
  aktualizujZobrazeniHry(index);
  ulozData();
}

function aktualizujZobrazeniHry(index) {
  const hra = hry[index];

  // Najdi všechny divy (v top3 i v hlavním seznamu), které mají danou hru podle názvu
  const divy = document.querySelectorAll(".hra, .top-hra");
  divy.forEach(div => {
    const h3 = div.querySelector("h3");
    if (!h3) return;

    // Porovnáme podle názvu - ať funguje i v top3, kde je label navíc
    if (h3.textContent.includes(hra.nazev)) {
      const p = div.querySelectorAll("p");
      if (p.length >= 4) {
        p[3].innerHTML = `👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}`;
      }
    }
  });
}

function obnovZobrazeni() {
  const filtrovane = filtrujHry();
  const top3 = getTop3HryOnce(filtrovane);
  zobrazTop3(top3);
  zobrazHryBezTop3(filtrovane, top3);
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
