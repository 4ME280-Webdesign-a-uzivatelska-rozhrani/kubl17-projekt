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

function zobrazHryBezTop3(hryData) {
  const seznam = document.getElementById("seznam-her");
  if (!seznam) return;
  seznam.innerHTML = "";

  const top3Hry = getTop3Hry(hryData); // getTop3Hry bere hryData (tedy filtrované)
  // vyjmeme hry z top3 ze seznamu
  const hryKZobrazeni = hryData.filter(hra => !top3Hry.some(topHra => topHra.nazev === hra.nazev));

  hryKZobrazeni.forEach((hra) => {
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

  // Pokud máš méně než 3 hry, zobraz všechny a skonči
  if (hryData.length <= 3) {
    hryData.forEach((hra, i) => {
      pridatTopHru(hra, i);
    });
    return;
  }

  // Najdeme topLibi - hru s nejvíce "libi"
  const topLibi = [...hryData].sort((a, b) => b.libi - a.libi)[0];

  // Najdeme topZahrano - hru s nejvíce "zahrano" (zopakoval jsem podle smyslu, dříve bylo naopak)
  const topZahrano = [...hryData].sort((a, b) => b.zahrano - a.zahrano)[0];

  // Vytvoříme pole pro unikátní top hry
  let top3Unikatni = [];

  // Přidáme topLibi
  if (topLibi) top3Unikatni.push(topLibi);

  // Přidáme topZahrano pokud není duplicitní
  if (topZahrano && !top3Unikatni.some(h => h.nazev === topZahrano.nazev)) {
    top3Unikatni.push(topZahrano);
  }

  // Vybereme náhodnou hru z filtrovaných, která není v top3Unikatni
  const zbyleHry = hryData.filter(h => !top3Unikatni.some(th => th.nazev === h.nazev));
  let nahodna = null;
  if (zbyleHry.length > 0) {
    nahodna = zbyleHry[Math.floor(Math.random() * zbyleHry.length)];
    top3Unikatni.push(nahodna);
  } else {
    // Pokud není žádná hra mimo topLibi a topZahrano, může být náhodná jedna z nich (opět jen pro 3 prvky)
    // Nebo prostě top3 budou jen dvě hry
  }

  // Labely a CSS třídy - podle počtu her dynamicky
  const labels = ["TOP favorit", "Zahraj si mě prosím", "Náhodná výzva"];
  const cssTridy = ["top-favorit", "top-zahraj", "top-nahodna"];

  top3Unikatni.forEach((hra, i) => {
    pridatTopHru(hra, i);
  });

  function pridatTopHru(hra, i) {
    const div = document.createElement("div");
    const trida = cssTridy[i % cssTridy.length];
    div.className = `top-hra ${trida}`;
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
  }
}




function getTop3Hry(hryData) {
  if (hryData.length === 0) return [];

  const topLibi = [...hryData].sort((a, b) => b.libi - a.libi)[0];
  const topZahrano = [...hryData].sort((a, b) => a.zahrano - b.zahrano)[0];
  const nahodna = hryData.length > 0 
    ? hryData[Math.floor(Math.random() * hryData.length)] 
    : null;

  let top3 = [];
  [topLibi, topZahrano].forEach(hra => {
    if (hra && !top3.some(h => h.nazev === hra.nazev)) top3.push(hra);
  });
  if (nahodna && !top3.some(h => h.nazev === nahodna.nazev)) top3.push(nahodna);

  return top3;
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
  zobrazTop3(filtrovane);
  zobrazHryBezTop3(filtrovane);
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
