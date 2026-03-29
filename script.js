const state = { places: [], filtered: [] };
const el = (id) => document.getElementById(id);

const regionHint = {
  "Área Metro": "short",
  Norte: "medium",
  Este: "medium",
  Sur: "long",
  Oeste: "long",
  "Central / Montaña": "medium",
  "Islas (Vieques & Culebra)": "long"
};

const normalize = (v) => v?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") || "";

const inferredDuration = (place) => {
  const hard = normalize(place.access).includes("dificil");
  const island = normalize(place.region).includes("islas");
  if (island || hard) return "weekend";
  return "day";
};

function setSelectOptions(selectId, values, includeAny = true) {
  const select = el(selectId);
  const current = select.value;
  select.innerHTML = "";
  if (includeAny) select.add(new Option("Any", "any"));
  values.forEach((v) => select.add(new Option(v, v)));
  if ([...select.options].some((o) => o.value === current)) select.value = current;
}

function summarize(data) {
  const stats = {
    stops: data.length,
    categories: new Set(data.map((d) => d.category)).size,
    municipios: new Set(data.map((d) => d.municipio)).size,
    easy: data.filter((d) => normalize(d.access).includes("facil")).length
  };
  el("stats").innerHTML = `
    <div class="stat"><span>Matching Stops</span><b>${stats.stops}</b></div>
    <div class="stat"><span>Categories</span><b>${stats.categories}</b></div>
    <div class="stat"><span>Municipios</span><b>${stats.municipios}</b></div>
    <div class="stat"><span>Easy Access</span><b>${stats.easy}</b></div>
  `;
}

function renderCards(data) {
  const container = el("results");
  container.innerHTML = "";
  const template = el("cardTemplate");
  const toRender = data.slice(0, 48);
  if (!toRender.length) {
    container.innerHTML = "<p>No matching stops found. Try broadening your filters.</p>";
    return;
  }
  toRender.forEach((place) => {
    const node = template.content.cloneNode(true);
    node.querySelector("h3").textContent = place.name;
    node.querySelector(".meta").textContent = `${place.category} · ${place.region} · ${place.municipio}`;
    node.querySelector(".tags").textContent = `Access: ${place.access} | Trip: ${inferredDuration(place)} | Drive: ${regionHint[place.region] || "medium"}`;
    node.querySelector(".contact").textContent = place.contact && place.contact !== "-" ? place.contact : "Contact info not provided in source guide.";
    container.appendChild(node);
  });
}

function applyFilters() {
  const criteria = {
    category: el("category").value,
    region: el("region").value,
    municipio: el("municipio").value,
    access: el("access").value,
    duration: el("duration").value,
    drive: el("drive").value
  };

  state.filtered = state.places.filter((p) => {
    if (criteria.category !== "any" && p.category !== criteria.category) return false;
    if (criteria.region !== "any" && p.region !== criteria.region) return false;
    if (criteria.municipio !== "any" && p.municipio !== criteria.municipio) return false;
    if (criteria.access !== "any" && p.access !== criteria.access) return false;
    if (criteria.duration !== "any" && inferredDuration(p) !== criteria.duration) return false;
    if (criteria.drive !== "any" && (regionHint[p.region] || "medium") !== criteria.drive) return false;
    return true;
  });

  summarize(state.filtered);
  renderCards(state.filtered);
}

function bind() {
  ["category", "region", "municipio", "access", "duration", "drive"].forEach((id) => {
    el(id).addEventListener("change", () => {
      if (id === "region") {
        const selectedRegion = el("region").value;
        const options = [...new Set(state.places
          .filter((p) => selectedRegion === "any" || p.region === selectedRegion)
          .map((p) => p.municipio))].sort((a, b) => a.localeCompare(b));
        setSelectOptions("municipio", options);
      }
      applyFilters();
    });
  });

  el("planBtn").addEventListener("click", applyFilters);
  el("resetBtn").addEventListener("click", () => {
    ["category", "region", "municipio", "access", "duration", "drive"].forEach((id) => (el(id).value = "any"));
    applyFilters();
  });
}

async function init() {
  const data = await fetch("./data/places.json").then((r) => r.json());
  state.places = data.places.map((p, idx) => ({ id: idx + 1, ...p }));

  const categories = [...new Set(state.places.map((p) => p.category))].sort((a, b) => a.localeCompare(b));
  const regions = [...new Set(state.places.map((p) => p.region))].sort((a, b) => a.localeCompare(b));
  const municipios = [...new Set(state.places.map((p) => p.municipio))].sort((a, b) => a.localeCompare(b));

  setSelectOptions("category", categories);
  setSelectOptions("region", regions);
  setSelectOptions("municipio", municipios);

  bind();
  applyFilters();
}

init();
