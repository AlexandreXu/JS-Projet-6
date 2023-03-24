let listWorks = [];
let WorksFiltered = [];
let currentSelectedCategoryId = null;
let modalInitialized = false;

function fetchCategories() {
    fetch('http://localhost:5678/api/categories')
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de la récupération des données');
            }
        })
        .then((categories) => {
            const categorySelector = document.querySelector('.category-selector');
            let categoryOptions = '';

            // Ajouter le filtre "Tous" avec un identifiant de catégorie nul
            categoryOptions += `<li data-id="">Tous</li>`;

            categories.forEach((category) => {
                categoryOptions += `<li data-id="${category.id}">${category.name}</li>`;
            });

            categorySelector.innerHTML = categoryOptions;
            handleFilters();
        })
        .catch((error) => {
            console.error('Erreur :', error);
        });
}

function fetchWorks() {
    fetch('http://localhost:5678/api/works')
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de la récupération des données');
            }
        })
        .then((works) => {
            listWorks = works;
            updateGalleryWithFilteredWorks(null);
            displayModal(works)
        })
        .catch((error) => {
            console.error('Erreur :', error);
        });
}

function checkAuth() {
    const loginButton = document.querySelector('.connexion');
    if (window.localStorage.getItem('authToken')) {
        loginButton.innerHTML = `<a class="logout" href="index.html">Logout</a>`
        const logout = document.querySelector('.logout');
        const myProjects = document.querySelector('.my-projects');
        logout.addEventListener('click', () => {
            window.localStorage.removeItem('authToken');
        })
        const div = document.createElement('div');
        div.className = 'edit'
        div.innerHTML = '<i></i><span class="modify">Modifier</span>'
        myProjects.appendChild(div);
    } else {
        loginButton.innerHTML = `<a href="login.html">Login</a>`
    }
    //loginButton.innerHTML = window.localStorage.getItem('authToken') ? `<a href="index.html">Logout</a>` : `<a href="login.html">Login</a>`
}

function displayModal(works) {
    const modal = document.querySelector("#myModal");
    const modify = document.querySelector(".modify");
    const close = document.querySelector(".close");
    const modalItemsContainer = document.querySelector(".modal-items");

    modify.onclick = function () {
        modal.style.display = "block";

        // Videz le contenu du conteneur .modal-items avant d'ajouter de nouveaux éléments
        modalItemsContainer.innerHTML = '';

        // Ajoutez les images des works dans le conteneur .modal-items
        works.forEach(work => {
            const modalItem = document.createElement("div");
            modalItem.className = "modalItem";
            modalItem.style.position = "relative"; // Ligne pour permettre la position absolue de la corbeille
    
            // Lignes pour créer et ajouter l'icône de corbeille
            const trashCanContainer = document.createElement("div");
            trashCanContainer.className = "trash-can-container";
    
            const trashCan = document.createElement("i");
            trashCan.className = "far fa-trash-alt trash-can";
    
            trashCanContainer.appendChild(trashCan);
            modalItem.appendChild(trashCanContainer);

            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;
    
            const title = document.createElement("figcaption");
            title.textContent = "Éditer";
            title.className = "edit-caption";
            title.addEventListener("click", () => {
                handleCaptionEditing(title, work);
            });

            title.addEventListener("click", () => {
                const existingEditInput = modalItem.querySelector(".edit-input");
                const existingSaveButton = modalItem.querySelector(".save-button");

                if (!existingEditInput && !existingSaveButton) {
                    const editInput = document.createElement("input");
                    editInput.type = "text";
                    editInput.value = work.title;
                    editInput.className = "edit-input";

                    const saveButton = document.createElement("button");
                    saveButton.textContent = "Sauvegarder";
                    saveButton.className = "save-button";

                    saveButton.addEventListener("click", () => {
                        work.title = editInput.value;
                        title.textContent = editInput.value;
                        editInput.remove();
                        saveButton.remove();
                    });

                    modalItem.appendChild(editInput);
                    modalItem.appendChild(saveButton);
                }
            });

            modalItem.appendChild(img);
            modalItem.appendChild(title);
            modalItemsContainer.appendChild(modalItem);
        });
    };

    close.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
}


window.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchWorks();
    checkAuth();
});


function handleFilters() {
    const categoryItems = document.querySelectorAll('.category-selector li');
    categoryItems.forEach((categoryItem) => categoryItem.addEventListener('click', () => {
        const selectedCategoryId = categoryItem.dataset.id;

        if (currentSelectedCategoryId === selectedCategoryId) {
            currentSelectedCategoryId = null;
        } else {
            currentSelectedCategoryId = selectedCategoryId;
        }

        // Supprime la classe 'selected' de tous les éléments de catégorie
        categoryItems.forEach(item => item.classList.remove('selected'));

        // Ajoute la classe 'selected' à l'élément de catégorie sélectionné, si une catégorie est sélectionnée
        if (currentSelectedCategoryId !== null) {
            categoryItem.classList.add('selected');
        }

        updateGalleryWithFilteredWorks(currentSelectedCategoryId);
    }));
}

function updateGalleryWithFilteredWorks(categoryId) {
    const filteredWorks = categoryId ? listWorks.filter(work => work.category.id == categoryId) : listWorks;
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    filteredWorks.map(work => {
        const figure = document.createElement('figure');
        figure.dataset.id = work.id;

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

function createWorkCards(works) {
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'gallery modal-items';

    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.dataset.id = work.id;

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        cardsContainer.appendChild(figure);
    });

    return cardsContainer;
}
