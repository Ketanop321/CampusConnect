# CampusConnect Frontend Documentation

## Overview
CampusConnect is a modern, modular web application designed to connect students on campus. The frontend is built using React, Vite, and Tailwind CSS, following best practices for scalability, maintainability, and developer experience. This documentation serves as a comprehensive guide for developers and maintainers to understand the architecture, structure, and setup of the frontend platform.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
4. [Architecture & Implementation](#architecture--implementation)
5. [Component Overview](#component-overview)
6. [State Management & Auth](#state-management--auth)
7. [Routing](#routing)
8. [Styling](#styling)
9. [Local Setup Guide](#local-setup-guide)
10. [Contribution Guidelines](#contribution-guidelines)

---

## Project Structure
```
frontend/
├── src/
│   ├── assets/             # Static assets (images, logos)
│   ├── components/         # Reusable UI and feature components
│   │   ├── book-bank/
│   │   ├── lost-found/
│   │   └── ui/
│   ├── context/            # React Contexts (e.g., Auth)
│   ├── hooks/              # (Reserved for custom hooks)
│   ├── layouts/            # Layout components (e.g., MainLayout)
│   ├── lib/                # Utility libraries (e.g., classnames)
│   ├── pages/              # Route-level pages
│   │   ├── auth/
│   │   ├── book-bank/
│   │   ├── lost-found/
│   │   └── profile/
│   ├── services/           # API and service abstraction
│   ├── utils/              # (Reserved for utility functions)
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static public files
├── package.json            # Project metadata and dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── postcss.config.cjs      # PostCSS configuration
```

---

## Tech Stack
- **React 19**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Headless UI & Heroicons**: Accessible UI primitives and icons
- **React Hook Form & Yup**: Form state management and validation
- **React Hot Toast**: Toast notifications

---

## Key Features
- **Authentication**: Context-based, with mock logic for local demo
- **Lost & Found**: Report and browse lost/found items
- **Book Bank**: Exchange, lend, or borrow books
- **Profile Management**: View and edit user profile
- **Responsive Design**: Mobile-first, accessible UI
- **Reusable Components**: Button, Spinner, Logo, etc.
- **Modern State/Data Handling**: React Query, Context API

---

## Component Overview
- **/components/ui/**: Basic UI primitives (Button, Spinner, Logo)
- **/components/book-bank/**: Book item and form components
- **/components/lost-found/**: Lost/found item and form components
- **/layouts/**: MainLayout for authenticated sections
- **/pages/**: Route-level views (Home, Auth, Lost & Found, Book Bank, Profile)

---

## State Management & Auth
- **AuthContext** provides user state and authentication methods via React Context.
- **Mocked auth**: No real backend; login/register/logout are simulated.
- **Token**: Stored in localStorage for session persistence.

---

## Routing
- **App.jsx** defines all routes using `react-router-dom`:
  - `/login`, `/register`: Public auth pages
  - `/`: Protected routes (MainLayout)
    - `/lost-found`, `/book-bank`, `/profile`: Main features
  - `*`: 404 Not Found

---

## Styling
- **Tailwind CSS**: All components use Tailwind utility classes for styling.
- **Custom themes**: Defined in `tailwind.config.js` and `index.css`.
- **Responsive**: Layouts and components are mobile-friendly by default.

---

## Local Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Steps
1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd CamputsConnect/frontend
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
   **If above command doesn't works
   ```sh
   npm install --force
   ```

   Agar npm install kaam na kre to npm install --force use krna
3. **Start the development server**
   ```sh
   npm run dev
   ```
4. **Open the app**
   - Visit the local URL shown in the terminal (usually http://localhost:5173)


*This documentation is intended to help developers and maintainers quickly understand, run, and extend the CampusConnect frontend platform.*
