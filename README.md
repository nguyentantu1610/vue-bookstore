# E-commerce Platform Frontend

This is the frontend for the E-commerce platform, built with **Vue.js**. It communicates with a [RESTful API backend](https://github.com/nguyentantu1610/bookstore) (powered by Laravel) to manage suppliers, categories, products, users and orders.

This is a Single Page Application (SPA) that offers a smooth user experience and dynamic page updates without reloading the entire page.

## Features

- **Product Management**: View available products in various categories, users can search, sort and filter results.
- **User Authentication**: Login, registration, and password reset functionality.
- **Shopping Cart**: Add, remove, and manage items in the shopping cart.
- **Order Placement**: Place orders and track order history.

## Installation

Follow these steps to set up the frontend application locally.

### 1. Clone the repository

```bash
git clone https://github.com/nguyentantu1610/vue-bookstore.git
cd vue-bookstore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Compile and Hot-Reload for Development

```bash
npm run dev
```

### 4. Type-Check, Compile and Minify for Production

```bash
npm run build
```

## Technologies Used

- **Vue.js**: A progressive JavaScript framework for building user interfaces.
- **Vue Router**: Handles client-side routing and protects route.
- **Pinia**: Used for state management in the Vue application.
- **Tailwind CSS**: A utility-first CSS framework for building custom designs.
- **Primevue**: A comprehensive UI component suite for Vue.js.

## API Documentation

The API documentation for the backend is available [here](https://github.com/nguyentantu1610/bookstore).

## Acknowledgements

- Vue.js for providing an approachable, performant, and versatile framework for building web user interfaces.
- Tailwind CSS for offering flexible CSS classes with predefined rules.
- Primevue for providing a rich set of UI components and icons.
