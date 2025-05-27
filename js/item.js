// Récupère les paramètres de l'URL
let params = new URLSearchParams(window.location.search);
let taskId = params.get("id");
let itemUrl = "https://todolist-back-tau.vercel.app/todos/" + taskId;
// @ts-ignore
let app = document.getElementById("app");

//  Fonctions de suppression locale
function getDeletedTaskIds() {
  return JSON.parse(localStorage.getItem("deletedTasks") || "[]");
}

function markTaskAsDeleted(taskId) {
  let deleted = getDeletedTaskIds();
  taskId = parseInt(taskId);
  if (!deleted.includes(taskId)) {
    deleted.push(taskId);
    localStorage.setItem("deletedTasks", JSON.stringify(deleted));
  }
}

// Vérifie si la tâche est supprimée
function isTaskDeleted(taskId) {
  return getDeletedTaskIds().includes(parseInt(taskId));
}

// Récupère la tâche depuis l'API
fetch(itemUrl)
  .then((response) => response.json())
  .then((task) => {
    if (!task || taskId === "") {
      // @ts-ignore
      app.innerHTML =
        "<div class='alert alert-danger'>Tâche non trouvée.</div>";
      return;
    }

    let isDeleted = isTaskDeleted(task.id);

    // Affiche le titre dans le header
    let headerTitle = document.querySelector(".masthead-heading");
    if (headerTitle) {
      headerTitle.textContent = task.text;
    }

    // Création de la carte
    let card = document.createElement("div");
    card.className = "card mx-auto my-4";
    card.style.maxWidth = "500px";

    let cardBody = document.createElement("div");
    cardBody.className = "card-body";

    //  Badge si supprimée
    if (isDeleted) {
      let badge = document.createElement("div");
      badge.className = "alert alert-warning text-center";
      badge.innerText = "Cette tâche a été supprimée localement";
      cardBody.appendChild(badge);
    }

    // Titre
    let element = document.createElement("h5");
    element.className = "card-title";
    element.textContent = task.text;
    cardBody.appendChild(element);

    // Date
    let date = document.createElement("p");
    date.className = "card-text";
    date.textContent = `Créé le ${task.created_at}`;
    cardBody.appendChild(date);

    // Tags (editable)
    let tags = document.createElement("input");
    tags.type = "text";
    tags.className = "form-control mb-2";
    tags.value = Array.isArray(task.Tags)
      ? task.Tags.join(", ")
      : task.Tags || "";
    tags.placeholder = "Tags (séparés par des virgules)";
    cardBody.appendChild(tags);

    // Statut (editable)
    let status = document.createElement("select");
    status.className = "form-select mb-2";

    let optionEnCours = document.createElement("option");
    optionEnCours.value = "false";
    optionEnCours.text = "En cours";
    if (!task.is_complete) optionEnCours.selected = true;
    status.appendChild(optionEnCours);

    let optionComplete = document.createElement("option");
    optionComplete.value = "true";
    optionComplete.text = "Complète";
    if (task.is_complete) optionComplete.selected = true;
    status.appendChild(optionComplete);

    cardBody.appendChild(status);

    // Bouton enregistrer
    let saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-success";
    saveBtn.textContent = "Enregistrer";
    saveBtn.addEventListener("click", function () {
      let updatedTask = {
        ...task,
        Tags: tags.value.split(",").map((t) => t.trim()),
        is_complete: status.value === "true",
      };

      fetch(itemUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      })
        .then((res) => {
          if (res.ok) {
            alert("Modifications enregistrées !");
            window.location.href = "tasks.html";
          } else {
            alert("Erreur lors de la sauvegarde.");
          }
        })
        .catch(() => alert("Erreur lors de la sauvegarde."));
    });
    cardBody.appendChild(saveBtn);

    // Bouton supprimer (suppression locale uniquement)
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger ms-2";
    deleteBtn.textContent = "Supprimer";
    deleteBtn.addEventListener("click", function () {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        markTaskAsDeleted(task.id);
        alert("Tâche supprimée localement !");
        window.location.href = "tasks.html";
      }
    });
    cardBody.appendChild(deleteBtn);

    card.appendChild(cardBody);
    // @ts-ignore
    app.appendChild(card);
  })
  .catch(() => {
    // @ts-ignore
    app.innerHTML =
      "<div class='alert alert-danger'>Erreur lors du chargement de la tâche.</div>";
  });
