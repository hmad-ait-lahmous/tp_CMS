// Function to open the IndexedDB for the cart
function openCartDB() {
    const dbRequest = indexedDB.open("CoffeeShopDB", 3);

    return new Promise((resolve, reject) => {
        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("cart")) {
                db.createObjectStore("cart", { keyPath: "id" });
            }
        };

        dbRequest.onsuccess = (event) => {
            resolve(event.target.result);
        };

        dbRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Function to load cart items from IndexedDB
async function loadCartItems() {
    try {
        const db = await openCartDB();
        const transaction = db.transaction("cart", "readonly");
        const cartStore = transaction.objectStore("cart");

        const getAllRequest = cartStore.getAll();

        getAllRequest.onsuccess = (event) => {
            const cartItems = event.target.result;
            if (cartItems.length > 0) {
                displayCartItems(cartItems);
            } else {
                document.getElementById('cart-items').innerHTML = "<tr><td colspan='5'>Votre panier est vide</td></tr>";
                document.getElementById('cart-total').textContent = "Total : 0 dh";
            }
        };

        getAllRequest.onerror = (event) => {
            console.error("Error fetching cart items:", event.target.error);
        };
    } catch (error) {
        console.error("Error loading cart items:", error);
    }
}

// Function to display cart items in the table
function displayCartItems(cartItems) {
    const cartTable = document.getElementById('cart-items');
    cartTable.innerHTML = ""; // Clear the table before adding new items

    let total = 0; // Variable to store the total price

    cartItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="product-details">
                <img src="${item.image_url}" alt="${item.name}" class="product-image">
                <span>${item.name}</span>
            </td>
            <td>${item.price.toFixed(2)} dh</td>
            <td>
                <button class="quantity-decrement" data-id="${item.id}">-</button>
<input type="number" disabled value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                <button class="quantity-increment" data-id="${item.id}">+</button>
            </td>
            <td>${(item.price * item.quantity).toFixed(2)} dh</td>
            <td><button class="remove-item" data-id="${item.id}">×</button></td>
        `;
        cartTable.appendChild(row);

        total += item.price * item.quantity; // Add to the total price
    });

    // Update the total price display
    document.getElementById('cart-total').textContent = `Total : ${total.toFixed(2)} dh`;

    // Add event listeners for quantity change, increment, decrement, and item removal
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });

    document.querySelectorAll('.quantity-increment').forEach(button => {
        button.addEventListener('click', incrementQuantity);
    });

    document.querySelectorAll('.quantity-decrement').forEach(button => {
        button.addEventListener('click', decrementQuantity);
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeItemFromCart);
    });
}

// Function to update the quantity of an item in the cart
async function updateQuantity(event) {
    const productId = event.target.getAttribute('data-id');
    const newQuantity = parseInt(event.target.value);

    if (newQuantity < 1) return; // Prevent quantity from being less than 1

    const db = await openCartDB();
    const transaction = db.transaction("cart", "readwrite");
    const cartStore = transaction.objectStore("cart");

    const getRequest = cartStore.get(productId);

    getRequest.onsuccess = (event) => {
        const item = event.target.result;
        if (item) {
            item.quantity = newQuantity;
            cartStore.put(item); // Update the item in the cart
            loadCartItems(); // Reload the cart to reflect the changes
        }
    };
}

// Function to increment the quantity of an item
async function incrementQuantity(event) {
    const productId = event.target.getAttribute('data-id');

    const db = await openCartDB();
    const transaction = db.transaction("cart", "readwrite");
    const cartStore = transaction.objectStore("cart");

    const getRequest = cartStore.get(productId);

    getRequest.onsuccess = (event) => {
        const item = event.target.result;
        if (item) {
            item.quantity += 1; // Increment quantity
            cartStore.put(item); // Update the item in the cart
            loadCartItems(); // Reload the cart to reflect the changes
        }
    };
}

// Function to decrement the quantity of an item
async function decrementQuantity(event) {
    const productId = event.target.getAttribute('data-id');

    const db = await openCartDB();
    const transaction = db.transaction("cart", "readwrite");
    const cartStore = transaction.objectStore("cart");

    const getRequest = cartStore.get(productId);

    getRequest.onsuccess = (event) => {
        const item = event.target.result;
        if (item && item.quantity > 1) { // Ensure quantity doesn't go below 1
            item.quantity -= 1; // Decrement quantity
            cartStore.put(item); // Update the item in the cart
            loadCartItems(); // Reload the cart to reflect the changes
        }
    };
}

// Function to remove an item from the cart
async function removeItemFromCart(event) {
    const productId = event.target.getAttribute('data-id');

    const db = await openCartDB();
    const transaction = db.transaction("cart", "readwrite");
    const cartStore = transaction.objectStore("cart");

    const deleteRequest = cartStore.delete(productId);

    deleteRequest.onsuccess = () => {
        loadCartItems(); // Reload the cart to reflect the removal
    };

    deleteRequest.onerror = (event) => {
        console.error("Error removing item from cart:", event.target.error);
    };
}

// Load the cart items when the page loads
document.addEventListener('DOMContentLoaded', loadCartItems);
