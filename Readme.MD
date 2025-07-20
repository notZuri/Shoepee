<div align="center">
  <img src="assets/img/logoshoepee.png" alt="Shoepee Logo" width="200" height="auto">
</div>

# 🥾 Shoepee - E-commerce Web App

A modern, responsive e-commerce website for a premium shoe store. Shoepee offers an elegant shopping experience with real-time cart management, user authentication simulation, and a sleek UI/UX design.

📍 **Live Demo**: [https://shoepeee.netlify.app/]  
🛠️ **Tech Stack**: HTML5, CSS3, JavaScript (ES6)  
🎯 **Focus**: Frontend architecture, local data handling, responsive and interactive UI

---

## 🔑 Key Features

- 🛍️ **Product Catalog**: Browse premium shoes with quick views
- 📦 **Cart System**: Add/remove items, select size, real-time pricing
- 👤 **User Auth (Simulated)**: Register, login/logout, view order history
- 🎨 **Responsive Design**: Fully functional on mobile, tablet, desktop
- 💬 **UX Polish**: Animations, hover effects, modals, feedback messages

---

<details>
<summary>📚 Full Project Documentation</summary>

## 🛍️ Shopping Experience

- **Product Catalog**: Grid view of premium shoes
- **Search & Filter**: Search products by keyword or price range
- **Quick View Modals**: View product details in a popup
- **Size Selector**: Choose shoe sizes (36–43)
- **Clean Layout**: Clear, minimal layout focused on conversions

## 🛒 Cart & Checkout

- **Add to Cart**: Dynamic cart management via localStorage
- **Quantity Control**: Increase/decrease items in cart
- **Live Total Price**: Auto-updating total calculation
- **Checkout Flow**: Form for user info with simulated confirmation
- **Error Handling**: Prevent checkout with incomplete forms

## 👤 User Management (Simulated)

- **Register/Login**: Basic account simulation using local/session storage
- **Logout**: Clears session and returns to homepage
- **Order History**: Track recent checkouts with persistence

## 💡 UX & Design

- **Responsive Design**: Mobile-first with breakpoints for all devices
- **Glassmorphism UI**: Clean visuals, cards, and modal overlays
- **Keyboard Navigation**: ARIA-compliant where applicable
- **CSS Animations**: Transitions, hover effects, slide-in modals

---

## 🛠️ Technologies Used

### Frontend:
- **HTML5**: Semantic layout & structure
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript (ES6+)**: Functional logic and DOM control

### Browser APIs:
- **LocalStorage & SessionStorage**: Cart and auth persistence
- **Event Listeners**: For dynamic interaction
- **Form Validation**: Client-side checks

---

## 📁 Folder Structure

```
Shoepee/
├── assets/
│ ├── css/
│ │ ├── base.css
│ │ ├── navbar.css
│ │ ├── hero.css
│ │ ├── products.css
│ │ ├── cart.css
│ │ ├── modals.css
│ │ ├── forms.css
│ │ ├── footer.css
│ │ ├── order-history.css
│ │ └── utilities.css
│ ├── js/
│ │ ├── script.js
│ │ └── animations.js
│ └── img/
│ ├── logoshoepee.png
│ ├── product1-8.png
│ └── background.png
├── index.html
├── products.html
├── login.html
├── register.html
├── order-history.html
└── README.md
```

---

## 🧪 How to Run

### Option 1: Direct View
1. Download project files  
2. Open `index.html` in browser

### Option 2: Local Dev Server
```bash
# Python 3
python -m http.server 8000

# Or Node.js (if installed)
npx http-server
```

---

## 🔐 Security Features

- **Input Validation**: Frontend form validation
- **Auth Simulation**: Login system with local/session storage
- **Secure Data Handling**: No exposure of sensitive info (demo-only)
- **Cross-browser Tested**: Chrome, Firefox, Edge

---

## 🔧 Customization Tips

- **Add Products**: Insert new product data in HTML files and images in /img/
- **Change Styling**: Edit modular CSS files under /css/
- **Add Pages**: Clone and update HTML + JS files for new features

---

## 🎯 Future Enhancements

- **Backend Integration** (Node/PHP + Database)
- **Real Payment Gateway**
- **Product Reviews & Ratings**
- **Wishlist System**
- **Admin Panel**
- **Email Notifications**

---

## 👨‍💻 About the Developer

**Ian Christian Amistoso**  
🧑‍🎓 BSIT Student  
🌐 Focus: Frontend Development & UI/UX  
🛠️ Tools: HTML, CSS, JS, Git/Github, Local Storage

</details>
