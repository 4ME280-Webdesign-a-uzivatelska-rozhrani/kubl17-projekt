const API_URL = "https://kubl17-projekt.kubl17.workers.dev/";
let hry = [];

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

function zobrazHry(hryData) {
  const seznam = document.getElementById("seznam-her");
  if (!seznam) return;
  seznam.innerHTML = "";

  hryData.forEach((hra, index) => {
    const hraDiv = document.createElement("div");
    hraDiv.className = "hra";

    hraDiv.innerHTML = `
      <h3>${hra.nazev}</h3>
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

function zobrazTop3(hryData) {
  const top3Container = document.getElementById("top3");
  if (!top3Container) return;
  top3Container.innerHTML = "";

  if (hryData.length === 0) return;

  const topLibi = [...hryData].sort((a, b) => b.libi - a.libi)[0];
  const topZahrano = [...hryData].sort((a, b) => a.zahrano - b.zahrano)[0];

  let nahodna;
  const zbyvajici = hryData.filter(hra => hra !== topLibi && hra !== topZahrano);
  if (zbyvajici.length > 0) {
    nahodna = zbyvajici[Math.floor(Math.random() * zbyvajici.length)];
  } else {
    nahodna = topLibi;
  }

  const top3 = [topLibi, topZahrano, nahodna];
  const topLabels = ["TOP favorit", "Zahraj si mě prosím", "Náhodná výzva"];

  top3.forEach((hra, i) => {
    const index = hry.findIndex(h => h.nazev === hra.nazev);
    const div = document.createElement("div");
    div.className = "top-hra";
    div.innerHTML = `
      <h3>${hra.nazev} <span class="top-label">${topLabels[i]}</span></h3>
      <p>Typ: ${hra.typ}</p>
      <p>Počet hráčů: ${hra.hraci_min}–${hra.hraci_max}</p>
      <p>Čas: ${hra.cas_min}–${hra.cas_max} min</p>
      <p>👍 ${hra.libi} | 👎 ${hra.nelibi} | ✅ ${hra.zahrano}</p>
      <button onclick="oznacLibi(${index})">👍 Líbí</button>
      <button onclick="oznacNelibi(${index})">👎 Nelíbí</button>
      <button onclick="oznacZahrano(${index})">✅ Zahrané</button>
    `;
    top3Container.appendChild(div);
  });

  // Uložit top3 ID pro pozdější skrytí ze seznamu
  window._top3Nazvy = top3.map(h => h.nazev);
}

function zobrazHryBezTop3(hryData) {
  const zbyvajici = hryData.filter(hra => !window._top3Nazvy.includes(hra.nazev));
  zobrazHry(zbyvajici);
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

    if (!isNaN(hraciMin) && hraciMin <= 0) {
      alert("Minimální počet hráčů musí být větší než 0.");
      return;
    }
    if (!isNaN(hraciMax) && hraciMax <= 0) {
      alert("Maximální počet hráčů musí být větší než 0.");
      return;
    }
    if (!isNaN(hraciMin) && !isNaN(hraciMax) && hraciMin > hraciMax) {
      alert("Minimální počet hráčů nemůže být větší než maximální.");
      zobrazHry([]);
      zobrazTop3([]);
      return;
    }
    if (!isNaN(casMax) && casMax <= 0) {
      alert("Čas musí být větší než 0 minut.");
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

    zobrazTop3(filtrovane);
    zobrazHryBezTop3(filtrovane);
  });
}

function oznacLibi(index) {
  hry[index].libi += 1;
  ulozData();
  zobrazTop3(hry);
  zobrazHryBezTop3(hry);
}

function oznacNelibi(index) {
  hry[index].nelibi += 1;
  ulozData();
  zobrazTop3(hry);
  zobrazHryBezTop3(hry);
}

function oznacZahrano(index) {
  hry[index].zahrano += 1;
  ulozData();
  zobrazTop3(hry);
  zobrazHryBezTop3(hry);
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
