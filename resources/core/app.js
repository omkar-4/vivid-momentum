import { sys } from "../platform/platform-api-impl.js";
import { logger } from "../utils/logger.js";
import { db } from "../db/db-api-impl.js";

const newEntryBtn = document.getElementById("new-entry-btn");
const createEntryDialog = document.getElementById("create-entry-dialog");
const closeEntryDialogBtn = document.getElementById('close-entry-dialog-btn')
const entries = document.getElementById("entries");
const statusTrigger = document.getElementById('status-trigger');
const statusTextLabel = statusTrigger.querySelector('.dropdown-text-label');
const statusMenu = document.getElementById('status-menu');
const dropdownItems = document.querySelectorAll('.dropdown-item');
const addShortcutBtn = document.getElementById('add-shortcut-btn');
const shortcutsContainer = document.getElementById('shortcuts-list-container');
const shortcutTemplate = document.getElementById('shortcut-field-template');
const entryForm = document.getElementById('entry-form');
const template = document.getElementById("entry-template");

const filterBtn = document.getElementById("filter-btn");
const filterDialog = document.getElementById("filter-options-dialog");
const applyBtn = document.getElementById("filter-apply-btn");

const allCheckbox = filterDialog.querySelector('.opt-all input');
const statusCheckboxes = filterDialog.querySelectorAll('.filter-row:not(.opt-all) input');

console.log("NL_DATAPATH:", NL_DATAPATH);
console.log("NL_PORT:", NL_PORT);
console.log("NL_APPVERSION:", NL_APPVERSION);

const renderProjectCard = (project) => {
  const clone = template.content.cloneNode(true);
  const entryRoot = clone.querySelector(".entry");

  entryRoot.setAttribute("data-id", project.id);
  clone.querySelector(".project-title-target").textContent = project.name ? project.name : 'missing (corrupted entry)';
  clone.querySelector(".status-target").textContent = project.status ? project.status : 'missing';
  clone.querySelector(".category-target").textContent = project.category ? project.category : 'missing';
  clone.querySelector(".progress-target").textContent = project.progress ? project.progress : 'missing';

  const shortcutsWrapper = clone.querySelector(".shortcuts-target");
  if (project.shortcuts && project.shortcuts.length > 0) {
    project.shortcuts.forEach((s) => {
      const span = document.createElement("span");
      span.classList.add("shortcut");
      span.classList.add('shortcut-shell-pill')
      span.setAttribute("data-cmd", s.cmd);
      span.textContent = s.name;
      shortcutsWrapper.appendChild(span);
    });
  } else {
    shortcutsWrapper.remove();
  }

  document.getElementById("entries").prepend(clone);
};

await db.init();
const currentProjects = db.get();

currentProjects.forEach(project => renderProjectCard(project));


// --- Open 'create entry dialog' on + button click ---

function openNewEntryDialog() {
  editingProjectId = null;
  if (
    getComputedStyle(createEntryDialog).display == "none" ||
    getComputedStyle(createEntryDialog) != "flex"
  ) {
    document.getElementById("submit-entry-btn").textContent = "Create Entry";
    createEntryDialog.style.display = "flex";
  }
}

newEntryBtn.addEventListener("click", openNewEntryDialog);

function closeNewEntryDialog() {
  if (getComputedStyle(createEntryDialog).display != "none") createEntryDialog.style.display = "none";
  entryForm.reset();
  statusMenu.style.display = 'none'
}

closeEntryDialogBtn.addEventListener('click', closeNewEntryDialog);

// --- Custom dropdown for status ---

// Toggle status dropdown visibility
statusTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = statusMenu.style.display === 'none' || statusMenu.style.display === '';

  if (isHidden) {
    statusMenu.style.display = 'flex';
  } else {
    statusMenu.style.display = 'none';
  }
});

// Handle Option Selection
dropdownItems.forEach(item => {
  item.addEventListener('click', () => {
    const selectedValue = item.getAttribute('data-option');
    statusTrigger.setAttribute('data-value', selectedValue);
    statusTextLabel.textContent = selectedValue;
    dropdownItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Close menu
    statusMenu.style.display = 'none';
  });
});

// Close dropdown if user clicks anywhere outside
document.addEventListener('click', () => {
  statusMenu.style.display = 'none';
});

// --- Dynamic Shortcut Fields Creation ---

const MAX_SHORTCUTS = 30;
let shortcutCount = 0;
let editingProjectId = null;

addShortcutBtn.addEventListener('click', () => {
  if (shortcutCount >= MAX_SHORTCUTS) {
    alert(`Maximum limit of ${MAX_SHORTCUTS} shortcuts reached.`);
    return;
  }

  shortcutCount++;

  // Clone template
  const clone = shortcutTemplate.content.cloneNode(true);
  const row = clone.querySelector('.shortcut-fields-row');
  console.log(row)
  row.setAttribute('data-index', shortcutCount);

  // Handle row removal
  row.querySelector('.remove-shortcut-btn').addEventListener('click', () => {
    row.remove();
    shortcutCount--;
  });

  shortcutsContainer.appendChild(clone);
});


// --- Create entry form submission ---
entryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const dataObj = Object.fromEntries(formData);

  const name = dataObj.name?.trim();
  const progress = dataObj.progress?.trim();
  const category = dataObj.category?.trim();

  const status = document.getElementById("status-trigger").getAttribute("data-value") || "todo";

  if (!name || !progress || !category) {
    console.warn("Please fill out all required fields.");
    return;
  }

  const shortcuts = [];

  shortcutsContainer.querySelectorAll(".shortcut-fields-row").forEach((row) => {
    const sName = row.querySelector(".shortcut-name").value.trim();
    const sCmd = row.querySelector(".shortcut-command").value.trim();
    if (sName && sCmd) {
      shortcuts.push({ name: sName, cmd: sCmd });
    }
  });

  if (editingProjectId) {
    // edit entry
    const index = currentProjects.findIndex(p => p.id === editingProjectId);
    if (index !== -1) {
      currentProjects[index] = { id: editingProjectId, name, progress, category, status, shortcuts };
      await db.save(currentProjects);
      const parentHelper = document.createElement("div");
      const oldPrepend = document.getElementById("entries").prepend;
      document.getElementById("entries").prepend = (node) => parentHelper.appendChild(node);
      renderProjectCard(currentProjects[index]);
      document.getElementById("entries").prepend = oldPrepend;
      const oldCard = document.querySelector(`.entry[data-id="${editingProjectId}"]`);
      if (oldCard) {
        oldCard.replaceWith(parentHelper.firstElementChild);
      }
    }
  } else {
    // create new entry
    const newProject = {
      id: window.crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name, progress, category, status, shortcuts
    };

    currentProjects.push(newProject);
    await db.save(currentProjects);
    renderProjectCard(newProject);
  }

  e.target.reset();
  shortcutsContainer.innerHTML = "";
  shortcutCount = 0;
  editingProjectId = null;

  document.getElementById("submit-entry-btn").textContent = "Create Entry";

  const statusTrigger = document.getElementById("status-trigger");
  document.querySelector(".dropdown-text-label").textContent = "todo";
  statusTrigger.setAttribute("data-value", "todo");

  document.getElementById("create-entry-dialog").style.display = "none";
});


document.getElementById("entries").addEventListener("click", async (e) => {
  const delBtn = e.target.closest(".del-btn");
  if (!delBtn) return;
  const entryCard = delBtn.closest(".entry");
  const projectId = entryCard.getAttribute("data-id");
  const index = currentProjects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    currentProjects.splice(index, 1);
  }
  await db.save(currentProjects);
  entryCard.remove();
});


document.getElementById("entries").addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  if (!editBtn) return;

  const entryCard = editBtn.closest(".entry");
  const projectId = entryCard.getAttribute("data-id");

  const project = currentProjects.find(p => p.id === projectId);
  if (!project) return;

  editingProjectId = project.id;

  document.getElementById("project-title-input").value = project.name;
  document.getElementById("progress-input").value = project.progress;
  document.getElementById("category-input").value = project.category;

  const statusTrigger = document.getElementById("status-trigger");
  document.querySelector(".dropdown-text-label").textContent = project.status;
  statusTrigger.setAttribute("data-value", project.status);

  shortcutsContainer.innerHTML = "";
  if (project.shortcuts) {
    project.shortcuts.forEach((s) => {
      const clone = shortcutTemplate.content.cloneNode(true);
      const row = clone.querySelector('.shortcut-fields-row');

      row.querySelector(".shortcut-name").value = s.name;
      row.querySelector(".shortcut-command").value = s.cmd;

      shortcutsContainer.appendChild(clone);
    });
    shortcutCount = project.shortcuts.length;
  }

  document.getElementById("submit-entry-btn").textContent = "Modify Entry";
  document.getElementById("create-entry-dialog").style.display = "flex";
});

document.getElementById("entries").addEventListener("click", async (e) => {
  const shortcutPill = e.target.closest(".shortcut");
  if (!shortcutPill) return;

  const command = shortcutPill.getAttribute("data-cmd");

  if (command) {
    try {
      await sys.os.execCommand(command);
    } catch (err) {
      console.error("Failed to execute shortcut command:", err);
    }
  }
});


// toggle visibility of filter menu
filterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = filterDialog.style.display === "none";
  filterDialog.style.display = isHidden ? "flex" : "none";
});

// hide dialog if clicking outside menu wrapper
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter-wrapper")) {
    filterDialog.style.display = "none";
  }
});

// Mutual Exclusion Box Control Strategy
allCheckbox.addEventListener("change", () => {
  if (allCheckbox.checked) {
    // If "all" is checked, uncheck every specific status box
    statusCheckboxes.forEach(cb => cb.checked = false);
  }
});

statusCheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    if (cb.checked) {
      // If any individual status is selected, uncheck the "all" constraint completely
      allCheckbox.checked = false;
    }
  });
});

// filtering engine
applyBtn.addEventListener("click", () => {
  const activeFilters = [];
  if (allCheckbox.checked) {
    activeFilters.push("all");
  } else {
    statusCheckboxes.forEach(cb => {
      if (cb.checked) activeFilters.push(cb.value);
    });
  }

  // Fallback check: If the user leaves everything empty, treat it exactly as selecting "all"
  const baselineAll = activeFilters.includes("all") || activeFilters.length === 0;

  // Process and scan every single item inside the UI instantly
  const entryCards = document.querySelectorAll("#entries .entry");

  entryCards.forEach((card) => {
    const cardStatus = card.querySelector(".status-target")?.textContent?.trim();

    if (baselineAll || activeFilters.includes(cardStatus)) {
      card.style.display = ""; // Makes the element visible in natural layout stream
    } else {
      card.style.display = "none"; // Erases card visibility instantly with zero destructive layout updates
    }
  });

  // Close frame view
  filterDialog.style.display = "none";
});
