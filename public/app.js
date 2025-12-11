// Fetch games from API and populate dropdowns + search functionality
const API_URL = "/"; // current API returns { Games: [...] }

const genreSelect = document.getElementById("genre-select");
const franchiseSelect = document.getElementById("franchise-select");
const consoleSelect = document.getElementById("console-select");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
// const clearBtn = document.getElementById("clear-btn");

let games = [];

function unique(values) {
  return [...new Set(values)].sort();
}

function populateSelect(selectEl, items) {
  // keep first option (All)
  selectEl.innerHTML =
    "<option value=''>All</option>" +
    items.map((i) => `<option value="${i}">${i}</option>`).join("");
}

function render(list) {
  if (!list.length) {
    results.innerHTML = "<p class='empty'>No results</p>";
    return;
  }

  results.innerHTML = list
    .map((g) => {
      // Determine image source
      const raw = g.image || "";
      let imageSrc = "https://via.placeholder.com/150x100?text=No+Image";

      if (raw) {
        // absolute URL (http/https)
        if (/^https?:\/\//i.test(raw)) {
          imageSrc = raw;
        } else {
          // treat as local path, make the default dir /app/
          // e.g. 'images/foo.jpg' -> '/app/images/foo.jpg'
          if (raw.startsWith("/app/")) imageSrc = raw;
          else if (raw.startsWith("/")) imageSrc = "/app" + raw;
          else imageSrc = "/app/" + raw;
        }
      }

      return `
    <article class="game">
      <div class="card-header">
        <h2>${g.title}</h2>
        <div class="meta">
                <span>${g.console || "Unknown console"}</span> •
                <span>${g.release_date || "Unknown date"}</span>
            </div>
            <p class="desc">${g.description || ""}</p>
            <p class="chars"><strong>Characters:</strong> ${
              Array.isArray(g.characters)
                ? g.characters.join(", ")
                : g.characters || ""
            }</p>
            <p class="devpub">${g.developer ? `${g.developer}` : ""}${
        g.publisher ? ` — ${g.publisher}` : ""
      }</p>
            <p class="genre">Genre: ${g.genre || "—"}</p>
      </div>
        <img src="${imageSrc}" alt="${g.title} cover image" />
        
    </article>
  `;
    })
    .join("");
}

function filterGames() {
  const genre = genreSelect.value;
  const franchise = franchiseSelect.value;
  const consoleVal = consoleSelect.value;
  const q = searchInput.value.trim().toLowerCase();

  const filtered = games.filter((g) => {
    if (genre && (g.genre || "").toLowerCase() !== genre.toLowerCase())
      return false;
    if (
      franchise &&
      (g.franchise || "").toLowerCase() !== franchise.toLowerCase()
    )
      return false;
    if (
      consoleVal &&
      (g.console || "").toLowerCase() !== consoleVal.toLowerCase()
    )
      return false;

    if (!q) return true;

    const hay = [
      g.title,
      g.description,
      (g.characters || []).join(" "),
      g.franchise,
      g.console,
      g.genre,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return hay.includes(q);
  });

  render(filtered);
}

async function init() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    games = data.Games || data.games || [];

    // populate selects
    populateSelect(
      genreSelect,
      unique(games.map((g) => g.genre).filter(Boolean))
    );
    populateSelect(
      franchiseSelect,
      unique(games.map((g) => g.franchise).filter(Boolean))
    );
    populateSelect(
      consoleSelect,
      unique(games.map((g) => g.console).filter(Boolean))
    );

    render(games);
  } catch (err) {
    results.innerHTML = '<p class="error">Error loading games</p>';
    console.error(err);
  }
}

genreSelect.addEventListener("change", filterGames);
franchiseSelect.addEventListener("change", filterGames);
consoleSelect.addEventListener("change", filterGames);
searchInput.addEventListener("input", filterGames);
// clearBtn.addEventListener("click", () => {
//   genreSelect.value = "";
//   franchiseSelect.value = "";
//   consoleSelect.value = "";
//   searchInput.value = "";
//   render(games);
// });

init();
