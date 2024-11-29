// Instantiation database indexDB
function openDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 3);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };

    return dbRequest;
}
// Lancer l'application quand le DOM est chargé
openDB();
document.addEventListener('DOMContentLoaded', getProducts);

//Récupérer les données des produits depuis l'API
let products = []; 

async function getProducts() {
    try {
        const response = await fetch('https://fake-coffee-api.vercel.app/api');

        if (!response.ok) {
            throw new Error('Erreur de connexion');
        }

        const data = await response.json();
        products = data;
        console.log(products);

        // Afficher les produits après récupération
        addProductsToDB(products);
        displayProducts(products);

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        loadProductsFromDB();
    }
}

function addToCart(productId) {
    let product_detail = products.find(p => p.id == productId);

    const cartItem = {
        id: productId,
        image_url: product_detail.image_url,
        name: product_detail.name,
        price: product_detail.price,
        quantity: 1
    };

    const dbRequest = openDB();

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("cart", "readwrite");
        const cartStore = transaction.objectStore("cart");

        const addRequest = cartStore.add(cartItem);

        addRequest.onsuccess = () => {
            console.log("Produit ajouté au panier avec succès !");
        };

        addRequest.onerror = (error) => {
            console.error("Erreur lors de l'ajout du produit au panier:", error);
        };
    };

    dbRequest.onerror = (error) => {
        console.error("Erreur lors de l'ouverture de la base de données:", error);
    };
}

function loadProductsFromDB() {
    const dbRequest = openDB();
    dbRequest.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction("products", "readonly");
        const objectstore = transaction.objectStore("products");
        const getAllRequest = objectstore.getAll();

        getAllRequest.onsuccess = (e) => {
            const products = e.target.result;
            console.log(products);
            displayProducts(products);
            // setGridView();
        };

        getAllRequest.onerror = (e) => {
            console.error("Error fetching products:", event.target.error);
        };

    }
}

function addProductsToDB(products) {
    const dbRequest = openDB();
    dbRequest.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction("products", "readwrite");
        const objectstore = transaction.objectStore("products");

        products.forEach(product => {
            objectstore.add(product);
        });

        transaction.oncomplete = () => {
            console.log("Good good");
        };

        transaction.onerror = (e) => {
            console.log("Error error", e.target.error);
        };

    };
    dbRequest.onerror = (e) => {
        console.log("Erreur lors de l'ouverture de la base de données:", e.target.error);
    };
}

// Question 3 : Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <div class="product-info">
            <h4 class="price">${product.price} dh</h4>
            <p class="description">${product.description}</p>
            <button onclick="addToCart('${product.id}')" class="add-to-cart">+</button>
        </div>
    `;

    return card;
}

// Afficher les produits
function displayProducts(products) {
    const container = document.querySelector('.product-content'); // Sélectionne le conteneur des produits

    // Vide le contenu existant
    container.innerHTML = '';

    // Crée et ajoute chaque carte de produit
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });

    setGridView();
}

//Question 4 :
// Mode view
// Ajouter les écouteurs d'événements aux icônes

const productContainer = document.querySelector('.product-content');
const gridIcon = document.getElementById('grid');
const listIcon = document.getElementById('list');

listIcon.addEventListener('click', setListView);
gridIcon.addEventListener('click', setGridView);


// Fonction pour passer en vue grille
function setGridView() {
    // Set the product container to a grid layout
    productContainer.style.display = 'grid';
    // productContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    productContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    productContainer.style.gap = '20px';

    // Adjust each product card for grid view
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.width = '100%';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
    });
}


// Fonction pour passer en vue liste
function setListView() {
    // Set the product container to display in list format
    productContainer.style.display = 'flex';
    productContainer.style.width = '100%';

    // Adjust each product card for list view
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.alignItems = 'center';
    });

    document.querySelectorAll(".product-card button").forEach(btn => {
        btn.style.alignSelf = 'flex-end';
    });

    document.querySelectorAll('.product-card img').forEach(img => {
        img.style.width = '150px';
        img.style.marginRight = '20px';
    });
}



// Initialiser la vue par défaut (grille)
setGridView();



//Question 5:
// Fonction pour filtrer les produits
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase(); // Récupère la recherche en minuscules
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts); // Affiche seulement les produits filtrés
}
// // Écouteur d'événement pour le champ de recherche

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', filterProducts); // Appelle filterProducts à chaque entrée de texte



