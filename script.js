let cartItems = [], selectedProduct = null;

function addToCart(name, price, qty = 1) {
  cartItems.push({ name, price: parseFloat(price), quantity: qty, id: cartItems.length, selected: false });
  updateCart();
  showToast("Successfully added to cart!", "success");
}

function updateCart() {
  const cont = document.getElementById("cart-items");
  cont.innerHTML = '';
  cartItems.forEach(item => {
    const el = document.createElement('div');
    el.classList.add('cart-item');
    el.innerHTML = `
      <input type="checkbox" id="item-${item.id}" onclick="toggleSelection(${item.id})" ${item.selected ? 'checked' : ''} />
      <span>${item.name} - ₱${item.price}</span>
      <button onclick="deleteCartItem(${item.id})" class="delete-btn" title="Delete">🗑️</button>
    `;
    cont.appendChild(el);
  });
  document.getElementById("cart-count").textContent = cartItems.length || '';
  calculateSelectedTotal();
}

function toggleSelection(id) {
  cartItems[id].selected = !cartItems[id].selected;
  calculateSelectedTotal();
}

function showCart() {
  cartItems.length ? (document.getElementById('cartModal').style.display = 'block', updateCart()) :
    showToast("Your cart is empty!", "error");
}

const closeCart = () => document.getElementById('cartModal').style.display = 'none';

function checkoutCart() {
  const selected = cartItems.filter(i => i.selected);
  selected.length ? (closeCart(), showCustomerForm(selected)) :
    showToast("Please select items to checkout.", "error");
}

function showCustomerForm(selected) {
  document.getElementById('customerModal').style.display = 'block';
  window.selectedItemsForCheckout = selected;
}

const closeCustomerForm = () => document.getElementById('customerModal').style.display = 'none';

function submitCustomerForm(e) {
  e.preventDefault();
  const name = document.getElementById('customerName').value,
        email = document.getElementById('customerEmail').value,
        phone = document.getElementById('customerPhone').value;
  if (name && email && phone) {
    const items = selectedProduct ? [{
      name: selectedProduct.name,
      price: parseFloat(selectedProduct.price.toString().replace(/[₱,]/g, ''))
    }] : window.selectedItemsForCheckout;
    showReceipt(name, email, phone, items);
    selectedProduct = null;
    closeCustomerForm();
    showToast("Checkout complete! Showing receipt...", "success");
  } else showToast("Please fill in all the fields.", "error");
}

function showReceipt(name, email, phone, items) {
  const receiptModal = document.getElementById('receiptModal'),
        receiptItems = document.getElementById('receipt-items'),
        totalPriceEl = document.getElementById('total-price');

  document.getElementById('customerNameReceipt').innerHTML = name;
  document.getElementById('customerEmailReceipt').innerHTML = email;
  document.getElementById('customerPhoneReceipt').innerHTML = phone;

  receiptItems.innerHTML = '';
  let total = 0;
  items.forEach(item => {
    const price = parseFloat(item.price.toString().replace(/[₱,]/g, ''));
    const el = document.createElement('div');
    el.classList.add('receipt-item');
    el.innerHTML = `
      <span class="receipt-product">${item.name}</span>
      <span class="receipt-price">₱${price.toFixed(2)}</span>
    `;
    receiptItems.appendChild(el);
    total += price;
  });
  totalPriceEl.innerHTML = `₱${total.toFixed(2)}`;
  receiptModal.style.display = 'block';
}

const closeReceipt = () => document.getElementById('receiptModal').style.display = 'none';

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container'),
        toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('fade-out'), 10);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function buyNow(name, price, desc) {
  document.getElementById("checkout-modal").style.display = "flex";
  document.getElementById("product-name").innerHTML = `<strong>Product:</strong> ${name}`;
  document.getElementById("product-price").innerHTML = `<strong>Price:</strong> ${price}`;
  document.getElementById("product-description").innerHTML = `<strong>Description:</strong> ${desc}`;
  selectedProduct = { name, price: price.toString().replace(/[₱,]/g, ''), description: desc };
}

const closeModal = () => document.getElementById('checkout-modal').style.display = 'none';

const submitCheckout = () => (closeModal(), document.getElementById('customerModal').style.display = 'block');

function deleteCartItem(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  cartItems.forEach((item, i) => item.id = i);
  updateCart();
  showToast("Item removed from cart.", "success");
}

function calculateSelectedTotal() {
  const total = cartItems.filter(i => i.selected)
                         .reduce((sum, i) => sum + parseFloat(i.price), 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', function () {
    const card = this.closest('.product-card'),
          name = card.getAttribute('data-name'),
          price = parseFloat(card.getAttribute('data-price')),
          qty = parseInt(card.querySelector('.product-qty').value) || 1;
    addToCart(name, price, qty);
  });
});
