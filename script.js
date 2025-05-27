const API_URL = "https://kubl17-projekt.kubl17.workers.dev";
let hry = [];

// Načtení dat
async function nactiData() {
  const res = await fetch(API_URL);
  const data = await res.json();
  hry = data.record.hry;
  zobrazHry(hry);
  zobrazTop3(hry);
}
nactiData();

// Zobrazení her
function zobrazHry(seznam) {
  const ul = document.getElementById("seznam");
  ul.innerHTML = "";
  seznam.forEach((hra, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${hra.nazev}</strong> (${hra.typ}, ${hra.hraci} hráčů, ${hra.cas} min)<br>
      👍 ${hra.libi} | 👎 ${hra.nelibi} | 🕹️ ${hra.zahrano}
      <br>
      <button onclick="ohodnot(${index}, 'libi')">👍 Líbí</button>
      <button onclick="ohodnot(${index}, 'nelibi')">👎 Nelíbí</button>
      <button onclick="ohodnot(${index}, 'zahrano')">🕹️ Zahráno</button>
    `;
    ul.appendChild(li);
  });
}

// Filtr
function filtruj() {
  const typ = document.getElementById("typ").value;
  const hraci = parseInt(document.getElementById("hraci").value);
  const cas = parseInt(document.getElementById("cas").value);

  let filtrovane = hry.filter(hra => {
    return (!typ || hra.typ === typ) &&
           (!hraci || hra.hraci >= hraci) &&
           (!cas || hra.cas <= cas);
  });

  zobrazHry(filtrovane);
  zobrazTop3(filtrovane);
}

// Hodnocení
function ohodnot(index, typ) {
  hry[index][typ]++;
  ulozData();
  zobrazHry(hry);
  zobrazTop3(hry);
}

// Uložení do JSONBin
async function ulozData() {
  await fetch(API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hry })
  });
}

// Výběr doporučených her
function zobrazTop3(seznam) {
  const ul = document.getElementById("top3");
  ul.innerHTML = "";

  if (seznam.length === 0) return;

  const podleLibenosti = [...seznam].sort((a, b) => b.libi - a.libi)[0];
  const nejmeneZahrana = [...seznam].sort((a, b) => a.zahrano - b.zahrano)[0];
  const nahodna = seznam[Math.floor(Math.random() * seznam.length)];

  const vyber = [podleLibenosti, nejmeneZahrana, nahodna];

  const nazvy = new Set(); // zamezí duplikaci v top3
  for (let hra of vyber) {
    if (!nazvy.has(hra.nazev)) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${hra.nazev}</strong> (${hra.typ}, ${hra.hraci} hráčů, ${hra.cas} min)`;
      ul.appendChild(li);
      nazvy.add(hra.nazev);
    }
  }
}

