// Function to log in an user
function loginController() {
  if (
    document.getElementById("login").value === "" ||
    document.getElementById("password").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    login: document.getElementById("login").value,
    password: document.getElementById("password").value,
  };
  window.electron.login(data)
}
