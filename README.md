# ☕ Café Tuscaney — Frontend
A fully configurable, build-your-own café ordering experience. This frontend is built using **React**, **Vite**, and **TailwindCSS**, and is deployed via **Amazon S3 + CloudFront** for global performance.

---

## 🌟 Project Overview
Café Tuscaney is a modern café ordering interface that lets users customize sandwiches, salads, soups, drinks, and sweet treats — all dynamically powered by a menu stored in DynamoDB.

This frontend:

- Fetches menu data from a serverless backend API.
- Allows customers to build custom meals.
- Shows real-time cart updates.
- Collects customer information (name + phone).
- Sends orders to a backend endpoint for processing.
- Provides a clean, mobile-friendly UI with Toast notifications (no popups!)
- Uses TailwindCSS for scalable styling and component design.

---

## 🚀 Live Deployment
Frontend hosted at:

🔗 **CloudFront URL:**  
`https://d37jecvs0g1sdw.cloudfront.net/`

Backend API (used internally by app):  
`https://6b6ni0suhd.execute-api.us-east-2.amazonaws.com`

---

## 🛠️ Technologies Used

### **Frontend Stack**
- React (Vite)
- TailwindCSS
- JavaScript (ES Modules)
- React Context for cart state management
- Custom hooks (`useMenu`, `useCart`)
- Toast-style inline notifications
- Dynamic forms based on backend config
- Mobile-first responsive layout

### **AWS Deployment**
- **Amazon S3** — Static site hosting
- **Amazon CloudFront** — CDN distribution, SSL, global caching
- Deployed using CloudFront Origin tied to S3 bucket
- SPA routing handled by CloudFront serving `index.html`

---

## 📂 Key Features
### ✅ Dynamic Menu Rendering
- Menu data is retrieved from the backend (DynamoDB → API Gateway → Lambda → Frontend)
- UI is auto-built based on backend configuration
- No hard-coded menu — fully data-driven

### ✅ Customizable Orders
Customers can build:
- Sandwiches  
- Soups  
- Salads  
- Drinks  
- Sweet treats  

Includes automatic grouping:
- Fruit vs Herb drink flavors  
- Hard vs soft cheeses  
- Sweet treat categories  

### ✅ Smart Cart System
- Tracks selections in React Context  
- Shows a live summarized order  
- Inline toast: “Item added to cart”  
- No intrusive alerts

### ✅ Order Submission
- Sends to backend `/orders`
- Includes:
  - Customer name
  - Phone number
  - All selected items
- Shows confirmation toast + clears cart

### ✅ Styling & UI
- Café-inspired color theme (#92400E brown, cream background)
- TailwindCSS card components
- Modern pill buttons (#289208 green)
- Clean, readable grouping

---

## 📁 Project Structure (Frontend)
src/
├── components/
│ └── MenuSection.jsx
├── context/
│ └── CartContext.jsx
├── hooks/
│ ├── useMenu.js
│ └── useCart.js
├── utils/
│ └── groupMenu.js
├── App.jsx
├── main.jsx
└── index.css


---

## 🧪 Future Enhancements
- Add quantity controls per item  
- Add “Special Instructions” field  
- Add order history (DynamoDB query)  
- Admin dashboard for editing menu  
- Coupons & promo codes  
- Push notifications when order is ready  
- Mobile app version using React Native  
- Authentication for staff interface  

---

## 🏁 Running Locally
npm install
npm run dev


Create a `.env`:


---

## 🧑‍🍳 Author
**Tuscaney Carraway**  
Full-stack developer in training — dedicated to clean code, AWS best practices, and professional development.

