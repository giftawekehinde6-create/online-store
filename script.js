/* =========================================================
   Couture & Chic — script.js
   Renders the products and handles the shopping bag.
   ========================================================= */

// 1. The products shown on the page.
//    Each product has an id, name, category, price and image path.
const products = [
  {
    id: 1,
    name: "Dusty Rose Midi Dress",
    category: "Dresses",
    price: 89,
    image: "images/dusty-rose-midi-dress.jpg",
    isNew: true,
  },
  {
    id: 2,
    name: "Espresso Satin Slip Dress",
    category: "Dresses",
    price: 112,
    image: "images/espresso-satin-slip-dress.jpg",
    isNew: false,
  },
  {
    id: 3,
    name: "Cream Ribbed Knit Dress",
    category: "Dresses",
    price: 96,
    image: "images/cream-ribbed-knit-dress.jpg",
    isNew: false,
  },
  {
    id: 4,
    name: "Olive Wide-Leg Trousers",
    category: "Trousers",
    price: 78,
    image: "images/olive-wide-leg-trousers.jpg",
    isNew: false,
  },
  {
    id: 5,
    name: "Wine Straight-Leg Trousers",
    category: "Trousers",
    price: 68,
    image: "images/wine-straight-trousers.jpg",
    isNew: false,
  },
  {
    id: 6,
    name: "Sage Wrap Blouse",
    category: "Tops",
    price: 54,
    image: "images/sage-wrap-blouse.jpg",
    isNew: true,
  },
  {
    id: 7,
    name: "Cream Ribbed Knit Top",
    category: "Tops",
    price: 45,
    image: "images/cream-ribbed-knit-top.jpg",
    isNew: false,
  },
  {
    id: 8,
    name: "Wine Platform Sandals",
    category: "Shoes",
    price: 82,
    image: "images/wine-platform-sandals.jpg",
    isNew: false,
  },
  {
    id: 9,
    name: "Burgundy Patent Heels",
    category: "Shoes",
    price: 98,
    image: "images/burgundy-patent-heels.jpg",
    isNew: false,
  },
  {
    id: 10,
    name: "Cream Retro Sneakers",
    category: "Shoes",
    price: 74,
    image: "images/cream-retro-sneakers.jpg",
    isNew: false,
  },
];

// 2. Find the page elements we need to work with.
const productGrid = document.getElementById("product-grid");
const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const cartPanelCount = document.getElementById("cart-panel-count");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartFooter = document.getElementById("cart-footer");
const cartSubtotal = document.getElementById("cart-subtotal");
const checkoutButton = document.getElementById("checkout-button");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// The cart is an array of objects: { id, quantity }.
let cart = [];
let toastTimer;

// 3. Build a product card for every item in the products array.
function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-media">
            <img
              src="${product.image}"
              alt="${product.name}"
              width="800"
              height="1000"
              loading="lazy"
            />
            ${product.isNew ? '<span class="product-badge">New</span>' : ""}
          </div>

          <div class="product-details">
            <div class="product-title-row">
              <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
              </div>
              <p class="product-price">$${product.price}</p>
            </div>

            <button
              class="add-button"
              type="button"
              data-id="${product.id}"
              aria-label="Add ${product.name} to bag"
            >
              Add to Cart
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

// A small helper so we can find a product by its id.
function findProduct(id) {
  return products.find((product) => product.id === id);
}

// 4. Add a product to the cart (or increase its quantity).
function addToCart(id) {
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: id, quantity: 1 });
  }

  updateCart();

  const product = findProduct(id);
  showToast(`${product.name} added to your bag`);

  // Restart the little badge animation each time an item is added.
  cartCount.classList.remove("bump");
  void cartCount.offsetWidth;
  cartCount.classList.add("bump");
}

// 5. Keep the badge, drawer and subtotal in sync with the cart.
function updateCart() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = findProduct(item.id);
    return total + product.price * item.quantity;
  }, 0);

  cartCount.textContent = totalItems;
  cartButton.setAttribute(
    "aria-label",
    `Open bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`
  );
  cartPanelCount.textContent = `(${totalItems})`;
  cartSubtotal.textContent = `$${subtotal}`;

  const isCartEmpty = cart.length === 0;
  cartEmpty.hidden = !isCartEmpty;
  cartItems.hidden = isCartEmpty;
  cartFooter.hidden = isCartEmpty;

  renderCartItems();
}

// 6. Draw the items inside the slide-out bag.
function renderCartItems() {
  cartItems.innerHTML = cart
    .map((item) => {
      const product = findProduct(item.id);

      return `
        <li class="cart-item">
          <img
            class="cart-item-image"
            src="${product.image}"
            alt=""
            width="68"
            height="85"
          />

          <div class="cart-item-info">
            <div>
              <h3>${product.name}</h3>
              <p>$${product.price}</p>
            </div>

            <div class="cart-item-actions">
              <div class="quantity-control">
                <button
                  type="button"
                  data-action="decrease"
                  data-id="${item.id}"
                  aria-label="Decrease quantity of ${product.name}"
                >&minus;</button>
                <span>${item.quantity}</span>
                <button
                  type="button"
                  data-action="increase"
                  data-id="${item.id}"
                  aria-label="Increase quantity of ${product.name}"
                >+</button>
              </div>

              <button
                class="remove-button"
                type="button"
                data-action="remove"
                data-id="${item.id}"
              >Remove</button>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
}

// 7. Change how many of one product are in the cart.
function changeQuantity(id, amount) {
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== id);
  }

  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
  showToast("Removed from your bag");
}

// 8. Open and close the bag panel.
function openCart() {
  document.body.classList.add("cart-open");
  cartPanel.setAttribute("aria-hidden", "false");
  cartButton.setAttribute("aria-expanded", "true");
  cartClose.focus();
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartButton.setAttribute("aria-expanded", "false");
  cartButton.focus();
}

// 9. Show a short message at the bottom of the screen.
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

// 10. Listen for clicks and key presses.
productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-button");
  if (!button) return;

  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") changeQuantity(id, 1);
  if (action === "decrease") changeQuantity(id, -1);
  if (action === "remove") removeFromCart(id);
});

cartButton.addEventListener("click", () => {
  const isOpen = document.body.classList.contains("cart-open");

  if (isOpen) {
    closeCart();
  } else {
    openCart();
  }
});

cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("cart-open")) {
    closeCart();
  }
});

checkoutButton.addEventListener("click", () => {
  showToast("Checkout is a demo only — thank you for shopping!");
});

// 11. Start the page.
renderProducts();
updateCart();
