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

    naplnFiltrTypy(hry);    // doplníme typy her do filtru
    zobrazHry(hry);
    zobrazTop3(hry);
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

function zobrazHry(hryData) {
  const seznam = document.getElementById("seznam-her");
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

function nastavFiltraci() {
  const formular = document.getElementById("filtr-form");

  formular.addEventListener("submit", (e) => {
    e.preventDefault();
    const typ = document.getElementById("filtr-typ").value;
    const hraci = parseInt(document.getElementById("filtr-hraci").value);
    const cas = parseInt(document.getElementById("filtr-cas").value);

    let filtrovane = [...hry];

    if (typ) filtrovane = filtrovane.filter(hra => hra.typ === typ);
   if (!isNaN(hraci)) {
  filtrovane = filtrovane.filter(hra => hraci >= hra.hraci_min && hraci <= hra.hraci_max);
}
if (!isNaN(cas)) {
  filtrovane = filtrovane.filter(hra => hra.cas_min <= cas);
}


    // doporučení: nejvíce líbí → nejméně zahrané → náhodná
    filtrovane.sort((a, b) => b.libi - a.libi || a.zahrano - b.zahrano);
    const nahodna = filtrovane[Math.floor(Math.random() * filtrovane.length)];
    if (nahodna) {
      filtrovane = [
        filtrovane[0],
        filtrovane[1],
        nahodna,
        ...filtrovane.slice(2).filter(h => h !== nahodna),
      ];
    }

    zobrazHry(filtrovane);
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
