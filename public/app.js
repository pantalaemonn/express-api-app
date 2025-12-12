const API_URL = "/"; // current API returns { Games: [...] }

const genreSelect = document.getElementById("genre-select");
const franchiseSelect = document.getElementById("franchise-select");
const consoleSelect = document.getElementById("console-select");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");

let games = [];
let currentUser = null;
let isAdmin = false;

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
        if (/^https?:\/\//i.test(raw)) {
          imageSrc = raw;
        } else {
          if (raw.startsWith("/app/")) imageSrc = raw;
          else if (raw.startsWith("/")) imageSrc = "/app" + raw;
          else imageSrc = "/app/" + raw;
        }
      }

      // ✅ Step 3: controls block
      const controls =
        currentUser && (g.author === currentUser || isAdmin)
          ? `
            <div class="game-controls">
              <button onclick="showEditForm(${JSON.stringify(g).replace(
                /"/g,
                "&quot;"
              )})">Edit</button>
              <button onclick="deleteGame('${g._id}')">Delete</button>
            </div>
          `
          : "";

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
            ${controls}
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

async function loadGames() {
  try {
    const authorSelect = document.getElementById("author-filter");
    const filter = authorSelect ? authorSelect.value : "all";
    const endpoint = filter === "mine" ? "/mine" : "/";

    const res = await fetch(endpoint, { credentials: "include" });
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

// auth UI: show logout button if logged in
async function checkAuth() {
  try {
    const r = await fetch("/auth/me", { credentials: "include" });
    const d = await r.json();
    const who = document.getElementById("who");
    const loginLink = document.getElementById("login-link");
    const logoutBtn = document.getElementById("logout-btn");

    if (d && d.user) {
      currentUser = d.user.username;
      isAdmin = d.user.isAdmin || false;

      if (who) who.textContent = d.user.username;
      if (loginLink) loginLink.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "";

      // author filter if logged in
      const filterContainer = document.getElementById("filters");
      if (filterContainer && !document.getElementById("author-filter")) {
        const label = document.createElement("label");
        label.setAttribute("for", "author-filter");
        label.textContent = "Show:";
        const select = document.createElement("select");
        select.id = "author-filter";
        select.innerHTML = `
          <option value="all">All Games</option>
          <option value="mine">My Games</option>
        `;
        filterContainer.appendChild(label);
        filterContainer.appendChild(select);

        // hook up event
        select.addEventListener("change", () => {
          loadGames();
        });
      }
    } else {
      currentUser = null;
      isAdmin = false;

      if (who) who.textContent = "";
      if (loginLink) loginLink.style.display = "";
      if (logoutBtn) logoutBtn.style.display = "none";
    }

    if (logoutBtn)
      logoutBtn.addEventListener("click", async () => {
        await fetch("/auth/logout", { method: "POST" });
        window.location.reload();
      });
  } catch (err) {
    console.error("auth check failed", err);
  }
}

// Edit/Delete handlers
async function editGame(id) {
  const newTitle = prompt("Enter new title:");
  if (!newTitle) return;

  try {
    await fetch(`/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
      credentials: "include",
    });
    loadGames();
  } catch (err) {
    console.error("Edit failed", err);
  }
}

async function deleteGame(id) {
  if (!confirm("Are you sure you want to delete this game?")) return;

  try {
    await fetch(`/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadGames();
  } catch (err) {
    console.error("Delete failed", err);
  }
}

function showEditForm(game) {
  document.getElementById("edit-id").value = game._id;
  document.getElementById("edit-title").value = game.title || "";
  document.getElementById("edit-description").value = game.description || "";
  document.getElementById("edit-console").value = game.console || "";
  document.getElementById("edit-genre").value = game.genre || "";

  document.getElementById("edit-form").style.display = "block";
}

function cancelEdit() {
  document.getElementById("edit-form").style.display = "none";
}

document
  .getElementById("game-edit-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-id").value;
    const updated = {
      title: document.getElementById("edit-title").value,
      description: document.getElementById("edit-description").value,
      console: document.getElementById("edit-console").value,
      genre: document.getElementById("edit-genre").value,
    };

    try {
      await fetch(`/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
        credentials: "include",
      });
      cancelEdit();
      loadGames();
    } catch (err) {
      console.error("Edit failed", err);
    }
  });

document
  .getElementById("game-create-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const newGame = {
      title: document.getElementById("create-title").value,
      description: document.getElementById("create-description").value,
      console: document.getElementById("create-console").value,
      genre: document.getElementById("create-genre").value,
      franchise: document.getElementById("create-franchise").value,
      developer: document.getElementById("create-developer").value,
      publisher: document.getElementById("create-publisher").value,
      release_date: document.getElementById("create-release").value,
      characters: document
        .getElementById("create-characters")
        .value.split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGame),
        credentials: "include", // ensures session cookie is sent
      });

      if (res.ok) {
        alert("Game created successfully!");
        e.target.reset(); // clear form
        loadGames(); // reload list
      } else {
        const err = await res.json();
        alert("Error creating game: " + (err.message || res.statusText));
      }
    } catch (err) {
      console.error("Create failed", err);
      alert("Error creating game");
    }
  });

// initial load
loadGames();
checkAuth();
