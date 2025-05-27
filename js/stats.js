//  Lire les ID supprimés localement
function getDeletedTaskIds() {
  return JSON.parse(localStorage.getItem("deletedTasks") || "[]");
}

//  Menu burger
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
  statsLink.href = "tasks.html";
  statsLink.textContent = "Liste des tâches";
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

// Création du diagramme
function loadChartJs(callback) {
  // @ts-ignore
  if (window.Chart) {
    callback();
    return;
  }
  let script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = callback;
  document.head.appendChild(script);
}

function startTaskChart() {
  let url = "https://todolist-back-tau.vercel.app/todos/";
  let app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";

  let container = document.createElement("div");
  container.className = "container";
  let row = document.createElement("div");
  row.className = "row justify-content-center align-items-start";

  let listCol = document.createElement("div");
  listCol.className = "col-md-6 mb-4";
  listCol.id = "taskListContainer";

  let chartCol = document.createElement("div");
  chartCol.className = "col-md-6 mb-4 d-flex justify-content-center";

  let card = document.createElement("div");
  card.className = "card";
  card.style.maxWidth = "500px";

  let cardBody = document.createElement("div");
  cardBody.className = "card-body text-center";

  let totalDiv = document.createElement("h4");
  totalDiv.id = "totalTasks";
  totalDiv.className = "mb-3";
  cardBody.appendChild(totalDiv);

  let canvas = document.createElement("canvas");
  canvas.id = "taskChart";
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.width = "400px";
  canvas.style.height = "400px";
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";
  cardBody.appendChild(canvas);
  card.appendChild(cardBody);
  chartCol.appendChild(card);

  row.appendChild(listCol);
  row.appendChild(chartCol);
  container.appendChild(row);
  app.appendChild(container);

  let ctx = canvas.getContext("2d");
  let chart = null;

  function fetchAndRenderChart() {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let tasks = data[0]?.todolist || [];
        let deletedIds = getDeletedTaskIds();

        let deletedTasks = tasks.filter((t) => deletedIds.includes(t.id));
        let visibleTasks = tasks.filter((t) => !deletedIds.includes(t.id));

        let enCours = visibleTasks.filter(
          (t) => t.is_complete === false
        ).length;
        let complete = visibleTasks.filter(
          (t) => t.is_complete === true
        ).length;
        let deleted = deletedTasks.length;

        let total = enCours + complete + deleted;
        let totalDiv = document.getElementById("totalTasks");
        if (totalDiv) {
          totalDiv.textContent = `Total des tâches : ${total}`;
        }

        updateChart(enCours, complete, deleted);
        updateTaskList(visibleTasks, deletedTasks);
      })
      .catch((err) => console.error("Erreur chargement tâches :", err));
  }

  function updateChart(enCours, complete, deleted) {
    let data = {
      labels: ["En cours", "Complètes", "Supprimées"],
      datasets: [
        {
          data: [enCours, complete, deleted],
          backgroundColor: ["#f39c12", "#28a745", "#dc3545"],
          hoverOffset: 10,
        },
      ],
    };

    let options = {
      responsive: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "État des tâches" },
      },
    };

    if (chart) {
      chart.data.datasets[0].data = [enCours, complete, deleted];
      chart.update();
    } else {
      // @ts-ignore
      chart = new Chart(ctx, {
        type: "doughnut",
        data: data,
        options: options,
      });
    }
  }

  function updateTaskList(tasks, deletedTasks) {
    listCol.innerHTML = "";
    let rowLists = document.createElement("div");
    rowLists.className = "row";

    // En cours
    let enCoursCol = document.createElement("div");
    enCoursCol.className = "col-12 mb-3";
    let enCoursTitle = document.createElement("h5");
    enCoursTitle.textContent = "Tâches en cours";
    enCoursTitle.className = "text-primary";
    enCoursCol.appendChild(enCoursTitle);

    let enCoursList = document.createElement("ul");
    enCoursList.className = "list-group";

    let enCours = tasks.filter((t) => t.is_complete === false);
    if (enCours.length === 0) {
      enCoursList.innerHTML =
        '<li class="list-group-item text-muted">Aucune tâche</li>';
    } else {
      enCours.forEach((t) => {
        let li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = t.text;
        enCoursList.appendChild(li);
      });
    }
    enCoursCol.appendChild(enCoursList);

    //  Complètes
    let completeCol = document.createElement("div");
    completeCol.className = "col-12 mb-3";
    let completeTitle = document.createElement("h5");
    completeTitle.textContent = "Tâches complètes";
    completeTitle.className = "text-success";
    completeCol.appendChild(completeTitle);

    let completeList = document.createElement("ul");
    completeList.className = "list-group";

    let complete = tasks.filter((t) => t.is_complete === true);
    if (complete.length === 0) {
      completeList.innerHTML =
        '<li class="list-group-item text-muted">Aucune tâche</li>';
    } else {
      complete.forEach((t) => {
        let li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = t.text;
        completeList.appendChild(li);
      });
    }
    completeCol.appendChild(completeList);

    //  Supprimées
    let deletedCol = document.createElement("div");
    deletedCol.className = "col-12 mb-3";
    let deletedTitle = document.createElement("h5");
    deletedTitle.textContent = "Tâches supprimées";
    deletedTitle.className = "text-danger";
    deletedCol.appendChild(deletedTitle);

    let deletedList = document.createElement("ul");
    deletedList.className = "list-group";

    if (deletedTasks.length === 0) {
      deletedList.innerHTML =
        '<li class="list-group-item text-muted">Aucune tâche supprimée</li>';
    } else {
      deletedTasks.forEach((t) => {
        let li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = t.text;
        deletedList.appendChild(li);
      });
    }
    deletedCol.appendChild(deletedList);

    rowLists.append(enCoursCol, completeCol, deletedCol);
    listCol.appendChild(rowLists);
  }

  setInterval(fetchAndRenderChart, 5000);
  fetchAndRenderChart();
}

document.addEventListener("DOMContentLoaded", function () {
  loadChartJs(function () {
    startTaskChart();
  });
});
