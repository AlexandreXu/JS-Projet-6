document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("Erreur lors de la connexion");
                    }
                })
                .then((data) => {
                    // Stock le token d'authentification et redirige l'utilisateur vers la page d'édition ou la page principale
                    localStorage.setItem("authToken", data.token);
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Erreur:", error);
                    // Affiche un message d'erreur à l'utilisateur
                    const errorMessageElement = document.getElementById("error-message");
                    errorMessageElement.textContent = "Erreur lors de la connexion. Veuillez vérifier vos identifiants et réessayer.";
                    errorMessageElement.style.display = "block";
                });
        });
    }
});