let cartItems = [], selectedProduct = null;
let selectedSize = null;
let selectedQuantity = 1;
let isBuyNow = false;

function addToCart(name, price, size, quantity, imageUrl) {
  if (!isLoggedIn()) {
    showToast('Please login to add items to cart!', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  // Validate and default size and quantity
  size = parseInt(size);
  if (isNaN(size) || size < 36 || size > 43) size = 36;
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) quantity = 1;

  // Get current cart from sessionStorage
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  // Add new item (now includes imageUrl)
  cartItems.push({ 
    id: Date.now(), // Use a more unique ID
    name, 
    price: parseFloat(price), 
    size: size,
    quantity: quantity, 
    imageUrl: imageUrl, // Directly use the passed imageUrl
    selected: true 
  });
  
  // Save to sessionStorage
  sessionStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Update cart in localStorage for the current user
  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
      users[userIndex].cart = cartItems;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  updateCart();
  showToast("Successfully added to cart!", "success");
}

function updateCart() {
  const cont = document.getElementById("cart-items");
  if (!cont) return;

  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  cont.innerHTML = '';
  cartItems.forEach(item => {
    const el = document.createElement('div');
    el.classList.add('cart-item');
    el.innerHTML = `
      <div class="cart-item-checkbox">
        <input type="checkbox" id="item-${item.id}" onclick="toggleSelection(${item.id})" ${item.selected ? 'checked' : ''} />
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-specs">
          <div class="cart-size-selector">
            <select onchange="updateCartItemSize(${item.id}, this.value)" class="cart-size-select">
              ${[36, 37, 38, 39, 40, 41, 42, 43].map(size => 
                `<option value="${size}" ${parseInt(item.size) === size ? 'selected' : ''}>${size}</option>`
              ).join('')}
            </select>
          </div>
          <div class="cart-quantity-controls">
            <button class="cart-quantity-btn" onclick="decreaseCartQuantity(${item.id})">-</button>
            <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" 
                   onchange="updateCartQuantity(${item.id}, this.value)">
            <button class="cart-quantity-btn" onclick="increaseCartQuantity(${item.id})">+</button>
          </div>
        </div>
      </div>
      <div class="cart-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
      <button onclick="deleteCartItem(${item.id})" class="delete-btn" title="Delete">🗑️</button>
    `;
    cont.appendChild(el);
  });
  
  // Update cart count in navbar
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems || '0';
  }
  
  // Update cart items count in modal
  const cartItemsCount = document.getElementById("cart-items-count");
  if (cartItemsCount) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  }
  
  calculateSelectedTotal();
  updateSelectAllCartCheckbox();
}

function toggleSelection(id) {
  // Get current cart from sessionStorage
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  // Find the item with the matching id
  const itemIndex = cartItems.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    // Toggle selection
    cartItems[itemIndex].selected = !cartItems[itemIndex].selected;
    
    // Save back to sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      
      if (userIndex !== -1) {
        users[userIndex].cart = cartItems;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  }

  calculateSelectedTotal();
}

// --- Modal Scroll Lock Utilities ---
function lockBodyScroll() {
  document.body.classList.add('modal-open');
}
function unlockBodyScrollIfNoModals() {
  // Check if any modal is still open
  const anyModalOpen = [
    document.getElementById('cartModal'),
    document.getElementById('customerModal'),
    document.getElementById('receiptModal'),
    document.getElementById('checkout-modal'),
    document.getElementById('productSelectionModal'),
    document.querySelector('.quick-view-modal')
  ].some(modal => modal && modal.classList.contains('active'));
  if (!anyModalOpen) document.body.classList.remove('modal-open');
}

// --- Update modal open/close functions ---

function showCart() {
  const cartModal = document.getElementById('cartModal');
  console.log('[DEBUG] showCart called, setting cartModal display to flex', cartModal);
  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const cartItemsContainer = document.getElementById('cart-items');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartFooter = document.querySelector('.cart-footer');
  const cartSelectAllSection = document.querySelector('.cart-select-all-section');
  if (cartModal) cartModal.classList.add('active');
  lockBodyScroll();
  
  if (cartItems.length > 0) {
    // Show cart with items
    cartEmptyState.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    cartFooter.style.display = 'block';
    cartSelectAllSection.style.display = 'block';
    updateCart();
  } else {
    // Show empty cart state
    cartEmptyState.style.display = 'block';
    cartItemsContainer.style.display = 'none';
    cartFooter.style.display = 'none';
    cartSelectAllSection.style.display = 'none';
  }
}

const closeCart = () => {
  const cartModal = document.getElementById('cartModal');
  console.log('[DEBUG] closeCart called, setting cartModal display to none', cartModal);
  if (cartModal) cartModal.classList.remove('active');
  unlockBodyScrollIfNoModals();
};

function checkoutCart() {
  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const selected = cartItems.filter(i => i.selected);
  
  if (selected.length > 0) {
    closeCart();
    showCustomerForm(selected);
  } else {
    showToast("Please select items to checkout.", "error");
  }
}

function showCustomerForm(items) {
  const modal = document.getElementById('customerModal');
  console.log('[DEBUG] showCustomerForm called, setting customerModal display to flex', modal);
  if (modal) modal.classList.add('active');
  lockBodyScroll();
  window.itemsForCheckout = items; // This will hold the items for checkout
}

const closeCustomerForm = () => {
    const modal = document.getElementById('customerModal');
  console.log('[DEBUG] closeCustomerForm called, setting customerModal display to none', modal);
  if (modal) modal.classList.remove('active');
  unlockBodyScrollIfNoModals();
    
    const form = document.getElementById('customerForm');
    if (form) form.reset();

    // Clear the global state to prevent side effects
    window.itemsForCheckout = null;
};

function submitCustomerForm(e) {
    e.preventDefault();
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (name && email && phone && paymentMethod) {
        const itemsToProcess = window.itemsForCheckout || [];
        
        if (itemsToProcess.length === 0) {
            showToast("No items to checkout.", "error");
            return;
        }

        const now = new Date();
        const expectedDeliveryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day later
        const deliveryDeadline = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours later
        const newOrder = {
            date: now.toISOString(),
            dateDisplay: now.toLocaleString(),
            customer: { name, email, phone },
            paymentMethod,
            expectedDeliveryDate: expectedDeliveryDate.toISOString(),
            expectedDeliveryDisplay: expectedDeliveryDate.toLocaleDateString(),
            deliveryDeadline: deliveryDeadline.toISOString(),
            status: "Pending",
            items: itemsToProcess.map(item => ({
                name: item.name,
                brand: item.brand || 'N/A',
                price: item.price,
                size: item.size,
                quantity: item.quantity,
                imageUrl: item.imageUrl || '' // Ensure imageUrl is saved
            })),
            total: itemsToProcess.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        const currentUser = getCurrentUser();
        if (currentUser) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let user = users.find(u => u.email === currentUser.email);
            if (user) {
                if (!user.orderHistory) user.orderHistory = [];
                user.orderHistory.push(newOrder);
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
        
        // If checking out from cart, remove items.
        // Remove from cart if items match by id (preferred) or by name+size (fallback for missing id)
        let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
        if (itemsToProcess.length > 0 && cartItems.length > 0) {
          let remainingItems;
          if (itemsToProcess[0].id !== undefined) {
            // Remove by id
            const checkedOutIds = new Set(itemsToProcess.map(i => i.id));
            remainingItems = cartItems.filter(item => !checkedOutIds.has(item.id));
          } else {
            // Remove by name+size (fallback)
            remainingItems = cartItems.filter(cartItem => {
              return !itemsToProcess.some(checkedOutItem =>
                cartItem.name === checkedOutItem.name &&
                cartItem.size === checkedOutItem.size &&
                cartItem.price === checkedOutItem.price
              );
            });
          }
          sessionStorage.setItem('cart', JSON.stringify(remainingItems));
          if (currentUser) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let user = users.find(u => u.email === currentUser.email);
            if(user) {
              user.cart = remainingItems;
              localStorage.setItem('users', JSON.stringify(users));
            }
          }
        }
        
        showReceipt(newOrder);
        
        closeCustomerForm();
        updateCart();
    } else {
        showToast("Please fill in all the fields.", "error");
    }
}

function showReceipt(order) {
    const receiptModal = document.getElementById('receiptModal');
  console.log('[DEBUG] showReceipt called, setting receiptModal display to flex', receiptModal);
    if (!receiptModal) return;

    document.getElementById('orderDateTime').textContent = order.dateDisplay;
    document.getElementById('customerNameReceipt').textContent = order.customer.name;
    document.getElementById('customerEmailReceipt').textContent = order.customer.email;
    document.getElementById('customerPhoneReceipt').textContent = order.customer.phone;
    // Add payment method and expected delivery date to receipt if elements exist
    if(document.getElementById('paymentMethodReceipt'))
      document.getElementById('paymentMethodReceipt').textContent = order.paymentMethod;
    if(document.getElementById('expectedDeliveryReceipt'))
      document.getElementById('expectedDeliveryReceipt').textContent = order.expectedDeliveryDisplay;
    
    const productDetailsContainer = document.getElementById('product-details');
    productDetailsContainer.innerHTML = '';
    order.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'receipt-item';
        itemDiv.innerHTML = `
            <div class="receipt-item-details">
              <div class="receipt-item-name">${item.name}</div>
              <div class="receipt-item-specs">
                <span>Size: ${item.size}</span>
                <span>Qty: ${item.quantity}</span>
              </div>
            </div>
            <div class="receipt-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
        `;
        productDetailsContainer.appendChild(itemDiv);
    });

    document.getElementById('total-price').textContent = `₱${order.total.toFixed(2)}`;
    if (receiptModal) receiptModal.classList.add('active');
    lockBodyScroll();
}

const closeReceipt = () => {
    const modal = document.getElementById('receiptModal');
  console.log('[DEBUG] closeReceipt called, setting receiptModal display to none', modal);
  if(modal) modal.classList.remove('active');
  unlockBodyScrollIfNoModals();
};

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
  const modal = document.getElementById('checkout-modal');
  console.log('[DEBUG] buyNow called, setting checkout-modal display to flex', modal);
  if (modal) modal.classList.add('active');
  lockBodyScroll();
  document.getElementById('product-name').innerHTML = `<strong>Product:</strong> ${name}`;
  document.getElementById('product-price').innerHTML = `<strong>Price:</strong> ${price}`;
  document.getElementById('product-description').innerHTML = `<strong>Description:</strong> ${desc}`;
  selectedProduct = { name, price: price.toString().replace(/[₱,]/g, ''), description: desc };
}

const closeModal = () => {
  const modal = document.getElementById('checkout-modal');
  console.log('[DEBUG] closeModal called, setting checkout-modal display to none', modal);
  if (modal) modal.classList.remove('active');
  unlockBodyScrollIfNoModals();
};

const submitCheckout = () => (closeModal(), document.getElementById('customerModal').classList.add('active'));

function deleteCartItem(id) {
  // Get current cart from sessionStorage
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  
  // Remove item
  cartItems = cartItems.filter(i => i.id !== id);
  cartItems.forEach((item, i) => item.id = i);
  
  // Save back to sessionStorage
  sessionStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Update cart in localStorage for the current user
  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
      users[userIndex].cart = cartItems;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  updateCart();
  showToast("Item removed from cart.", "success");
}

function calculateSelectedTotal() {
  const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const total = cartItems
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (i.price * i.quantity), 0);
  
  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    totalElement.textContent = total.toFixed(2);
  }
}

// Removed conflicting event listener - buttons now use onclick handlers for showProductSelection

// Authentication Functions
function handleRegister(event) {
  event.preventDefault();
  console.log('Registration form submitted');
  
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  console.log('Form values:', { fullName, email, password, confirmPassword });

  // Validate passwords match
  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return false;
  }

  // Get existing users or initialize empty array
  const users = JSON.parse(localStorage.getItem('users')) || [];
  console.log('Existing users:', users);

  // Check if email already exists
  if (users.some(user => user.email === email)) {
    showToast('Email already registered!', 'error');
    return false;
  }

  // Add new user
  const newUser = {
    fullName,
    email,
    password, // Note: In a real application, you should hash the password
    cart: []
  };
  
  users.push(newUser);
  console.log('New user added:', newUser);

  // Save to localStorage
  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Users saved to localStorage');
    
    showToast('Registration successful! Please login.', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    console.error('Error saving user:', error);
    showToast('Error during registration. Please try again.', 'error');
  }

  return false;
}

function handleLogin(event) {
  event.preventDefault();
  console.log('Login form submitted');
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log('Login attempt for email:', email);

  // Get users from localStorage
  let users;
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Retrieved users from localStorage:', users);
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    showToast('Error during login. Please try again.', 'error');
    return false;
  }

  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  console.log('User found:', user ? 'Yes' : 'No');

  if (user) {
    try {
      // Store current user in sessionStorage
      const userData = {
        email: user.email,
        fullName: user.fullName
      };
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('User data stored in sessionStorage:', userData);

      // Load user's cart if it exists
      if (user.cart && user.cart.length > 0) {
        sessionStorage.setItem('cart', JSON.stringify(user.cart));
        console.log('User cart loaded:', user.cart);
      } else {
        sessionStorage.setItem('cart', JSON.stringify([]));
      }

      showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (error) {
      console.error('Error during login process:', error);
      showToast('Error during login. Please try again.', 'error');
    }
  } else {
    console.log('Login failed: Invalid credentials');
    showToast('Invalid email or password!', 'error');
  }

  return false;
}

// Function to check if user is logged in
function isLoggedIn() {
  return sessionStorage.getItem('currentUser') !== null;
}

// Function to get current user
function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser'));
}

// Function to logout
function logout() {
  // Save cart to user's data before logging out
  const currentUser = getCurrentUser();
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
      const currentCart = JSON.parse(sessionStorage.getItem('cart')) || [];
      users[userIndex].cart = currentCart;
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Cart saved before logout:', currentCart);
    }
  }

  // Clear session storage
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('cart');
  
  showToast('Logged out successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// Function to handle auth link click
function handleAuthClick(event) {
    event.preventDefault();
    if (isLoggedIn()) {
        logout();
    } else {
        window.location.href = 'login.html';
    }
}

// Update auth link text based on login status
function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        authLink.textContent = isLoggedIn() ? 'Logout' : 'Login';
    }
}

// Function to fix existing order history image paths
function fixOrderHistoryImagePaths() {
  try {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let hasChanges = false;
    
    // Product name to image filename mapping
    const productImageMap = {
      'Vomero 5': 'product1-removebg-preview.png',
      'Samba': 'product2-removebg-preview.png',
      '530': 'product3-removebg-preview.png',
      'New Balance 530': 'product3-removebg-preview.png',
      'Dunk Low Retro': 'product4-removebg-preview.png',
      'Chuck Taylor All Star': 'product5-removebg-preview.png',
      'Gel-1130': 'product6-removebg-preview.png',
      'Air Force 1': 'product7-removebg-preview.png',
      'Novablast 5': 'product8-removebg-preview.png'
    };
    
    users.forEach(user => {
      if (user.orderHistory && user.orderHistory.length > 0) {
        user.orderHistory.forEach(order => {
          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              let needsUpdate = false;
              let newImageUrl = item.imageUrl;
              
              // Case 1: imageUrl is missing or empty - try to infer from product name
              if (!item.imageUrl || item.imageUrl === '') {
                const inferredImage = productImageMap[item.name];
                if (inferredImage) {
                  newImageUrl = 'assets/img/' + inferredImage;
                  needsUpdate = true;
                  console.log(`Inferred image for ${item.name}: ${newImageUrl}`);
                }
              }
              // Case 2: imageUrl exists but doesn't have assets/img/ prefix
              else if (item.imageUrl && 
                  (item.imageUrl.includes('product') || item.imageUrl.includes('logoshoepee')) && 
                  !item.imageUrl.startsWith('assets/img/') && 
                  !item.imageUrl.startsWith('http')) {
                newImageUrl = 'assets/img/' + item.imageUrl;
                needsUpdate = true;
                console.log(`Fixed image path for ${item.name}: ${newImageUrl}`);
              }
              // Case 3: imageUrl has old img/ prefix (from before assets reorganization)
              else if (item.imageUrl && item.imageUrl.startsWith('img/')) {
                newImageUrl = 'assets/' + item.imageUrl;
                needsUpdate = true;
                console.log(`Updated old img/ path for ${item.name}: ${newImageUrl}`);
              }
              
              if (needsUpdate) {
                item.imageUrl = newImageUrl;
                hasChanges = true;
              }
            });
          }
        });
      }
    });
    
    if (hasChanges) {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Fixed order history image paths');
      return true; // Indicate that changes were made
    }
    return false; // No changes made
  } catch (error) {
    console.error('Error fixing order history image paths:', error);
    return false;
  }
}

// Call updateAuthLink when page loads
document.addEventListener('DOMContentLoaded', function() {
    fixOrderHistoryImagePaths(); // Fix existing order history image paths
    updateAuthLink();
    // If user is logged in, load their cart
    if (isLoggedIn()) {
        const currentUser = getCurrentUser();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === currentUser.email);
        if (user && user.cart) {
            sessionStorage.setItem('cart', JSON.stringify(user.cart));
            updateCart();
        } else {
            sessionStorage.setItem('cart', JSON.stringify([]));
        }
    }
});

// Add contact form handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Message sent successfully! We will get back to you soon.', 'success');
            // Clear the form
            this.reset();
        });
    }
});

function showProductSelection(name, price, brand, imageUrl, buyNowMode = false) {
  const modal = document.getElementById('productSelectionModal');
  if (!modal) {
    console.error('[ERROR] productSelectionModal not found in DOM');
    return;
  }
  console.log('[DEBUG] productSelectionModal innerHTML at showProductSelection:', modal.innerHTML);
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    showToast('Please login to continue!', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  selectedProduct = { name, price, brand, imageUrl };
    selectedSize = null;
    selectedQuantity = 1;
    isBuyNow = buyNowMode;
  const selectionProductImage = document.getElementById('selectionProductImage');
  if (!selectionProductImage) { console.error('[ERROR] selectionProductImage not found in DOM'); return; }
  selectionProductImage.src = imageUrl;
  const selectionProductName = document.getElementById('selectionProductName');
  if (!selectionProductName) { console.error('[ERROR] selectionProductName not found in DOM'); return; }
  selectionProductName.textContent = `${brand} - ${name}`;
  const pricePerItem = document.getElementById('pricePerItem');
  if (!pricePerItem) { console.error('[ERROR] pricePerItem not found in DOM'); return; }
  pricePerItem.textContent = price;
  const quantityInput = document.getElementById('quantityInput');
  if (!quantityInput) { console.error('[ERROR] quantityInput not found in DOM'); return; }
  quantityInput.value = '1';
  const summaryQuantity = document.getElementById('summaryQuantity');
  if (!summaryQuantity) { console.error('[ERROR] summaryQuantity not found in DOM'); return; }
  summaryQuantity.textContent = '1';
  const totalPrice = document.getElementById('totalPrice');
  if (!totalPrice) { console.error('[ERROR] totalPrice not found in DOM'); return; }
  totalPrice.textContent = price;
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
  console.log('[DEBUG] showProductSelection called, setting productSelectionModal display to flex', modal);
  if (modal) modal.classList.add('active');
  lockBodyScroll();
}

function closeProductSelection() {
    const modal = document.getElementById('productSelectionModal');
    console.log('[DEBUG] closeProductSelection called, setting productSelectionModal display to none', modal);
    if (modal) modal.classList.remove('active');
    unlockBodyScrollIfNoModals();
    selectedProduct = null;
    selectedSize = null;
    selectedQuantity = 1;
    isBuyNow = false;
}

function selectSize(element) {
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedSize = element.textContent;
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    selectedQuantity = parseInt(input.value) + 1;
    input.value = selectedQuantity;
    document.getElementById('summaryQuantity').textContent = selectedQuantity;
    updateTotalPrice();
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) {
        selectedQuantity = parseInt(input.value) - 1;
        input.value = selectedQuantity;
        document.getElementById('summaryQuantity').textContent = selectedQuantity;
        updateTotalPrice();
    }
}

function updateQuantity() {
    const input = document.getElementById('quantityInput');
    selectedQuantity = parseInt(input.value) || 1;
    if (selectedQuantity < 1) {
        selectedQuantity = 1;
        input.value = 1;
    }
    document.getElementById('summaryQuantity').textContent = selectedQuantity;
    updateTotalPrice();
}

function updateTotalPrice() {
    if (selectedProduct) {
        const total = selectedProduct.price * selectedQuantity;
        document.getElementById('totalPrice').textContent = total.toFixed(2);
    }
}

function addSelectedToCart() {
    if (!selectedSize) {
        showToast('Please select a size first!', 'error');
        return;
    }

    const { name, price, imageUrl } = selectedProduct;
    const quantity = parseInt(document.getElementById('quantityInput').value, 10);
    
    addToCart(name, price, selectedSize, quantity, imageUrl);
    closeProductSelection();
}

function buySelectedNow() {
    if (!selectedSize) {
        showToast('Please select a size!', 'error');
        return;
    }

    const item = {
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        size: selectedSize,
        quantity: selectedQuantity,
        imageUrl: selectedProduct.imageUrl || ''
    };

    closeProductSelection();
    showCustomerForm([item]);
}

function updateCartItemSize(itemId, newSize) {
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    cartItems[itemIndex].size = parseInt(newSize);
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].cart = cartItems;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    updateCart();
    showToast('Size updated!', 'success');
  }
}

function updateCartQuantity(itemId, newQuantity) {
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) newQuantity = 1;
    
    cartItems[itemIndex].quantity = newQuantity;
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].cart = cartItems;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    updateCart();
    showToast('Quantity updated!', 'success');
  }
}

function increaseCartQuantity(itemId) {
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity += 1;
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].cart = cartItems;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    updateCart();
    showToast('Quantity increased!', 'success');
  }
}

function decreaseCartQuantity(itemId) {
  let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1 && cartItems[itemIndex].quantity > 1) {
    cartItems[itemIndex].quantity -= 1;
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].cart = cartItems;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    updateCart();
    showToast('Quantity decreased!', 'success');
  }
}

// Quick View Functionality
function showQuickView(element) {
  // Create modal if it doesn't exist
  let modal = document.querySelector('.quick-view-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    document.body.appendChild(modal);
  }

  // Get the product image
  const productCard = element.closest('.product-card');
  const productImage = productCard.querySelector('.product-image img');
  const productName = productCard.querySelector('h3').textContent;
  const productPrice = productCard.querySelector('.price-tag').textContent;
  const productDescription = productCard.getAttribute('data-description') || '';

  // Create modal content
  modal.innerHTML = `
    <div class="quick-view-content">
      <button class="close-quick-view">&times;</button>
      <img src="${productImage.src}" alt="${productName}">
      <h3>${productName}</h3>
      <p class="price">${productPrice}</p>
      <p class="description">${productDescription}</p>
    </div>
  `;

  // Show modal
  modal.classList.add('active');
  lockBodyScroll();

  // Add close functionality
  const closeButton = modal.querySelector('.close-quick-view');
  closeButton.addEventListener('click', () => {
    modal.classList.remove('active');
    unlockBodyScrollIfNoModals();
  });

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      unlockBodyScrollIfNoModals();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      unlockBodyScrollIfNoModals();
    }
  });
}

function toggleSelectAllCart() {
    let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cartItems.length === 0) return;
    const allSelected = cartItems.every(item => item.selected);
    cartItems.forEach(item => item.selected = !allSelected);
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
    // Update cart in localStorage for the current user
    const currentUser = getCurrentUser();
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].cart = cartItems;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    updateCart();
    updateSelectAllCartCheckbox();
}

function updateSelectAllCartCheckbox() {
    let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
    const checkbox = document.getElementById('selectAllCartCheckbox');
    const label = document.getElementById('selectAllCartLabel');
    if (!checkbox || !label) return;
    if (cartItems.length === 0) {
        checkbox.checked = false;
        checkbox.disabled = true;
        label.textContent = 'Select All';
        return;
    }
    checkbox.disabled = false;
    const allSelected = cartItems.every(item => item.selected);
    checkbox.checked = allSelected;
    label.textContent = allSelected ? 'Unselect All' : 'Select All';
}

// Call updateSelectAllCartCheckbox after updating cart
const originalUpdateCart = updateCart;
updateCart = function() {
    originalUpdateCart.apply(this, arguments);
    updateSelectAllCartCheckbox();
}
