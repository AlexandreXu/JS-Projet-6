let listWorks = [];
let WorksFiltered = [];
let currentSelectedCategoryId = null;
let modalInitialized = false;
const addPhotoButton = document.querySelector('.add-photo');
const addPhotoModal = document.getElementById('add-photo-modal');
const previousButton = document.querySelector('.previous');

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

        // Vide le contenu du conteneur .modal-items avant d'ajouter de nouveaux éléments
        modalItemsContainer.innerHTML = '';

        // Ajoute les images des works dans le conteneur .modal-items
        works.forEach(work => {
            const modalItem = document.createElement("div");
            modalItem.className = "modalItem";
            modalItem.style.position = "relative"; // Ligne pour permettre la position absolue de la corbeille

            // Lignes pour créer et ajouter l'icône de corbeille
            const trashCanContainer = document.createElement("div");
            trashCanContainer.className = "trash-can-container";
            trashCanContainer.innerHTML = '<i class="far fa-trash-alt trash-can"></i>';

            modalItem.appendChild(trashCanContainer);

            // Gestion du clic sur la corbeille ici
            trashCanContainer.addEventListener('click', () => {
                const confirmation = confirm('Voulez-vous vraiment supprimer cette image et sa légende ?');
                if (confirmation) {
                    console.log(work.id);
                    deleteWork(work.id)
                    // Supprime l'image et sa légende du DOM
                    modalItem.remove();
                    // Supprime l'image et sa légende de la liste des works
                    listWorks = listWorks.filter(item => item.id !== work.id);
                    // Mettre à jour la galerie avec les works filtrés
                    updateGalleryWithFilteredWorks(currentSelectedCategoryId);
                    console.log('Image et légende supprimées');
                }
            });

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

function deleteWork(id) {
    try {
        const response = fetch(
            `http://localhost:5678/api/works/${id}`,
            {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`}
            }
        )
    } catch (error) {
        console.log(error);
    }
}

function addWork() {
    try {
        const formData = new FormData();
        const title = document.querySelector('#title')
        const category = document.querySelector('#category')
        const image = document.querySelector('#image-url')

        formData.append('title', title.value);
        formData.append('category', category.value);
        formData.append('image', image.files[0]);

        const response = fetch(
            `http://localhost:5678/api/works`,
            {
                body: formData,
                method: 'POST',
                headers: {'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`}
            }
        ).then((response)=> {
            // CHECK SI OK, SI OK ADD PHOTO EN TEMPS REEL
        })
    } catch (error) {
        console.log(error);
    }
}

function displayModalAdd() {
    const modal = document.querySelector("#myModal");
    const modalAdd = document.querySelector("#myModalAdd");
    const close = document.querySelector(".close-add");
    const arrowBack = document.querySelector(".arrow-back");
    const addPhotoButton = document.querySelector('.add-photo');
    const formSubmit = document.querySelector('#add-photo-form');
    const categories = document.querySelector('#category');


    addPhotoButton.addEventListener('click', () => {
        modal.style.display = 'none';
        modalAdd.style.display = 'block';
    })

    arrowBack.addEventListener('click', () => {
        modal.style.display = 'block';
        modalAdd.style.display = 'none';
    })

    close.addEventListener('click', () => {
        modalAdd.style.display = 'none';
    })

    fetch('http://localhost:5678/api/categories')
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de la récupération des données');
            }
        })
        .then((categoriesData) => {
            categoriesData.map((category) => {
                // Create Option with category
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categories.appendChild(option);
            })
        })
        .catch((error) => {
            console.error('Erreur :', error);
        });

    formSubmit.addEventListener('submit', (e) => {
        e.preventDefault();
        addWork(new FormData(formSubmit))
    });
}

window.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchWorks();
    checkAuth();
    displayModalAdd()
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

        // Ajoute cet événement "click" sur l'image
        img.addEventListener('click', () => {
            const imageModal = document.querySelector('#image-modal');
            const enlargedImage = document.querySelector('#enlarged-image');
            enlargedImage.src = img.src;
            enlargedImage.alt = img.alt;
            imageModal.style.display = 'block';
        });

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}