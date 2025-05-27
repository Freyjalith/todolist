//  Menu burger Bootstrap
function createBurgerMenu() {
  let burgerBtn = document.createElement("button");
  burgerBtn.className =
    "btn position-fixed top-0 end-0 m-3 p-2 d-flex flex-column justify-content-center align-items-center";
  burgerBtn.style.zIndex = "2000";
  burgerBtn.style.width = "40px";
  burgerBtn.style.height = "40px";
  burgerBtn.style.background = "transparent";
  burgerBtn.style.border = "none";
  burgerBtn.setAttribute("type", "button");
  burgerBtn.setAttribute("data-bs-toggle", "offcanvas");
  burgerBtn.setAttribute("data-bs-target", "#burgerOffcanvas");
  burgerBtn.setAttribute("aria-controls", "burgerOffcanvas");

  let bars = [];
  for (let i = 0; i < 3; i++) {
    let bar = document.createElement("div");
    bar.className = "burger-bar";
    bar.style.width = "25px";
    bar.style.height = "3px";
    bar.style.margin = "3px 0";
    bar.style.backgroundColor = "#ffffff";
    bar.style.borderRadius = "2px";
    burgerBtn.appendChild(bar);
    bars.push(bar);
  }

  let offcanvas = document.createElement("div");
  offcanvas.className = "offcanvas offcanvas-end";
  offcanvas.id = "burgerOffcanvas";
  offcanvas.tabIndex = -1;
  offcanvas.setAttribute("aria-labelledby", "burgerOffcanvasLabel");

  let offcanvasHeader = document.createElement("div");
  offcanvasHeader.className = "offcanvas-header";

  let offcanvasTitle = document.createElement("h5");
  offcanvasTitle.className = "offcanvas-title";
  offcanvasTitle.id = "offcanvasLabel";
  offcanvasTitle.textContent = "Menu";

  let closeButton = document.createElement("button");
  closeButton.className = "bttn-close";
  closeButton.setAttribute("data-bs-dismiss", "offcanvas");
  closeButton.setAttribute("aria-label", "Close");

  offcanvasHeader.appendChild(offcanvasTitle);
  offcanvasHeader.appendChild(closeButton);

  let offcanvasBody = document.createElement("div");
  offcanvasBody.className = "offcanvas-body";

  let statsLink = document.createElement("a");
  statsLink.href = "stat.html";
  statsLink.textContent = "Statistiques";
  statsLink.className = "btn btn-outline-primary w-100";

  offcanvasBody.appendChild(statsLink);
  offcanvas.appendChild(offcanvasHeader);
  offcanvas.appendChild(offcanvasBody);

  document.body.appendChild(burgerBtn);
  document.body.appendChild(offcanvas);

  // @ts-ignore
  let bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
  offcanvas.addEventListener("show.bs.offcanvas", () => {
    bars.forEach((bar) => (bar.style.display = "none"));
  });
  offcanvas.addEventListener("hide.bs.offcanvas", () => {
    bars.forEach((bar) => (bar.style.display = "block"));
  });
}

document.addEventListener("DOMContentLoaded", createBurgerMenu);

let prenom = document.getElementById("prenom");
// @ts-ignore
prenom.innerHTML = "Bonjour " + localStorage.getItem("prenom");

// @ts-ignore
let app = document.getElementById("app");
let url = "https://todolist-back-tau.vercel.app/todos";

//  Utilitaires suppression locale
function getDeletedTaskIds() {
  return JSON.parse(localStorage.getItem("deletedTasks") || "[]");
}

function markTaskAsDeleted(taskId) {
  let deleted = getDeletedTaskIds();
  if (!deleted.includes(taskId)) {
    deleted.push(taskId);
    localStorage.setItem("deletedTasks", JSON.stringify(deleted));
  }
}

//  Toast Bootstrap pour feedback
function showToast(message) {
  let toast = document.createElement("div");
  toast.className =
    "toast align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-3";
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  document.body.appendChild(toast);

  // @ts-ignore
  let toastInstance = new bootstrap.Toast(toast);
  toastInstance.show();

  setTimeout(() => toast.remove(), 4000); // Nettoyage
}

//  Bouton de réinitialisation
function createResetButton() {
  let container = document.createElement("div");
  container.className = "mb-4 text-end";

  let resetBtn = document.createElement("button");
  resetBtn.className = "btn btn-warning";
  resetBtn.innerHTML =
    '<i class="bi bi-arrow-counterclockwise"></i> Réinitialiser les suppressions';

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("deletedTasks");
    showToast("Suppressions réinitialisées ✅");
    setTimeout(() => location.reload(), 1500);
  });

  container.appendChild(resetBtn);
  // @ts-ignore
  app.appendChild(container);
}

//  Chargement des tâches
fetch(url).then((response) => {
  response.json().then((datas) => {
    let tasks = datas[0].todolist;
    let deletedTasks = getDeletedTaskIds();

    createResetButton(); // Afficher le bouton de réinit

    tasks.forEach((element) => {
      if (deletedTasks.includes(element.id)) return;

      let div = document.createElement("div");
      div.className = "card mb-3";

      let cardBody = document.createElement("div");
      cardBody.className = "card-body";

      let title = document.createElement("h5");
      title.className = "card-title";
      title.innerHTML = element.text;
      cardBody.appendChild(title);

      let date = document.createElement("p");
      date.className = "card-text";
      date.innerHTML = `Créé le ${element.created_at}`;
      cardBody.appendChild(date);

      let tags = document.createElement("p");
      tags.className = "card-text";
      tags.innerHTML = `Tags : ${element.Tags}`;
      cardBody.appendChild(tags);

      let status = document.createElement("p");
      status.className = "card-text";
      status.innerHTML = `Status : ${
        element.is_complete === false ? "En cours" : "Complète"
      }`;
      cardBody.appendChild(status);

      let btnGroup = document.createElement("div");
      btnGroup.className = "d-flex gap-2";

      let editButton = document.createElement("button");
      editButton.className = "btn btn-primary";
      editButton.innerHTML = "Modifier";
      editButton.addEventListener("click", () => {
        window.location.href = `item.html?id=${element.id}`;
      });
      btnGroup.appendChild(editButton);

      let deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-danger";
      deleteButton.innerHTML = "Supprimer";
      deleteButton.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
          markTaskAsDeleted(element.id);
          div.remove();
        }
      });
      btnGroup.appendChild(deleteButton);

      cardBody.appendChild(btnGroup);
      div.appendChild(cardBody);
      // @ts-ignore
      app.appendChild(div);
    });
  });
});

// new tasks
function createTaskForm() {
  let form = document.createElement("form");
  form.id = "newTaskForm";
  form.className = "mb-4";
  // @ts-ignore
  app.appendChild(form);

  let inputText = document.createElement("input");
  inputText.type = "text";
  inputText.placeholder = "Enter new task";
  inputText.required = true;
  inputText.className = "form-control mb-2";
  form.appendChild(inputText);

  let addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn btn-success";
  addButton.innerHTML = "Ajouter une tâche";
  form.appendChild(addButton);

  addButton.addEventListener("click", () => {
    if (inputText.value.trim() === "") {
      alert("Veuillez entrer une tâche.");
    } else {
      openPopup(inputText.value);
    }
  });
}

function openPopup(taskText) {
  let popup = document.createElement("div");
  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    zIndex: 1050,
  });
  popup.className = "shadow-lg";

  let inputDate = createInput("date", "", true);
  inputDate.className = "form-control mb-2";

  let inputTags = createInput(
    "text",
    "Entrez des tags (séparés par des virgules)"
  );
  inputTags.className = "form-control mb-2";

  let selectStatus = createStatus();
  selectStatus.className = "mb-2";

  let saveButton = createButton("Enregistrer");
  saveButton.className = "btn btn-success";

  let closeButton = createButton("Fermer", { marginLeft: "10px" });
  closeButton.className = "btn btn-secondary";

  let btnGroup = document.createElement("div");
  btnGroup.className = "d-flex gap-2";
  btnGroup.append(saveButton, closeButton);

  popup.append(inputDate, inputTags, selectStatus, btnGroup);
  document.body.appendChild(popup);

  closeButton.addEventListener("click", () => popup.remove());

  saveButton.addEventListener("click", () => {
    let newTask = {
      text: taskText,
      created_at: inputDate.value,
      Tags: inputTags.value.split(",").map((tag) => tag.trim()),
      is_complete: false,
    };
    saveTask(newTask);
    popup.remove();
  });
}

function createInput(type, placeholder = "", required = false) {
  let input = document.createElement("input");
  input.type = type;
  if (placeholder) input.placeholder = placeholder;
  input.required = required;
  return input;
}

function createButton(text, style = {}) {
  let button = document.createElement("button");
  button.type = "button";
  button.innerText = text;
  Object.assign(button.style, style);
  return button;
}

function createStatus() {
  let status = document.createElement("p");
  status.innerText = "Status : En cours";
  status.setAttribute("data-value", "false");
  return status;
}

function saveTask(task) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then((response) => {
      if (response.ok) {
        alert("Nouvelle tâche créée avec succès !");
        location.reload();
      } else {
        alert("Erreur lors de la création de la tâche.");
      }
    })
    .catch((error) => {
      console.error("Erreur :", error);
      alert("Erreur lors de la création de la tâche.");
    });
}

createTaskForm();
