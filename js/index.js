let form = document.getElementById("form");
let prenom = document.getElementById("prenom");

// @ts-ignore
form.addEventListener("submit", (e) => {
  e.preventDefault();
  // @ts-ignore
  if (prenom.value === "" || prenom.value.length < 4) {
    alert("Veuillez entrer votre prénom (4 caractères minimum).");
  } else {
    // @ts-ignore
    localStorage.setItem("prenom", prenom.value);
    window.location.href = "tasks.html";
  }
});
