# Travila - Travel Booking Website

Travila is a responsive, front-end travel discovery and booking prototype. It lets users explore tours, destinations, activities, travel content, and booking-related UI in one modern interface.

> **Project type:** Front-end prototype / single-page website  
> **Technology:** HTML5, Tailwind CSS v4, vanilla JavaScript, JSON

## Project Objective

The objective of Travila is to make travel discovery simple and engaging. Visitors can browse curated tours and destinations, narrow choices through filters, use a global search, interact with booking and sign-in forms, and access common travel information through a built-in FAQ and chatbot.

The project demonstrates how a rich travel platform can be built without a framework by combining semantic HTML, responsive CSS utilities, modular JavaScript functions, and data-driven rendering.

## Key Features

- Responsive layout for mobile, tablet, and desktop screens.
- Hero search with tabs for tours, hotels, rentals, and activities.
- Featured tours loaded dynamically from JSON.
- Tour filtering by category, duration, rating, and price range.
- "Load more" tours interaction.
- Popular destinations and promotional carousels.
- Popular-spots filters for category, duration, rating, and budget.
- Global search across tours, destinations, spots, and blog posts.
- Booking and sign-in modal interfaces with client-side validation.
- Wishlist and article-save interactions.
- FAQ accordion, newsletter validation, and toast notifications.
- Language/currency UI controls and a dark-theme preference saved in browser storage.
- Rule-based travel chatbot for common questions.
- Accessible details including semantic landmarks, ARIA labels, keyboard-focus styling, a skip link, and reduced-motion support.
- Lazy-loaded images and scroll-triggered animations for a smoother experience.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Structure | HTML5 | Semantic page sections, forms, dialogs, and navigation |
| Styling | Tailwind CSS v4 + custom CSS | Responsive design, theme, component styling, animations |
| Behaviour | Vanilla JavaScript | Rendering, filtering, modals, validation, carousels, chatbot |
| Content | Local JSON files | Tours, destinations, spots, blog posts, testimonials |
| Assets | Local images, SVGs, Manrope fonts | Visual design and typography |
| Persistence | `localStorage` | Newsletter emails, selected currency, dark-theme preference |

## Project Structure

```text
Travila/
|-- index.html              # Main single-page application markup
|-- src/
|   |-- input.css           # Tailwind source and custom styles
|   |-- output.css          # Generated CSS used by the page
|   `-- script.js           # Client-side application logic
|-- data/
|   |-- tours.json          # Tour card data
|   |-- destinations.json   # Destination data
|   |-- spots.json          # Popular-spot data
|   |-- blog-posts.json     # News and guide data
|   `-- testimonials.json   # Customer review data
|-- assets/                 # Images and icons organised by page section
|-- fonts/                  # Local Manrope font files
|-- package.json            # Tailwind development command and dependencies
|-- manifest.json           # Web-app metadata
`-- sw.js                   # Removes an older service worker during development
```

## How the Application Works

When the page finishes loading, `src/script.js` fetches all five JSON data files in parallel using `Promise.allSettled()`. The returned records are converted into HTML cards and inserted into their respective page sections.

```text
JSON data files -> fetch() -> JavaScript render functions -> HTML cards -> user interactions
```

For example, each tour object contains properties such as its title, image, price, rating, category, duration key, and price range. These values are used both to render the tour card and to filter it without reloading the page.

## Main Modules in `src/script.js`

| Module | Responsibility |
| --- | --- |
| Data loading | Fetches local JSON files and handles loading failures gracefully |
| Dynamic rendering | Creates tour, blog, destination, spot, and testimonial UI from data |
| Search and filters | Filters tours/spots and searches all loaded content in the browser |
| Carousels | Controls destination, promotional, and testimonial horizontal sliders |
| Forms and modals | Handles booking, sign-in, newsletter, contact, and demo interfaces |
| UI preferences | Manages theme and currency selection using `localStorage` |
| Accessibility/UI polish | Focus states, toast messages, mobile navigation, animation observer |
| Chatbot | Matches common travel-related keywords to predefined answers |

## Running the Project

### Prerequisites

- Node.js (recommended for rebuilding Tailwind CSS)
- A local web server

### Install dependencies

```bash
npm install
```

### Rebuild CSS while developing

```bash
npm run dev
```

This watches `src/input.css` and writes the compiled stylesheet to `src/output.css`.

### Serve the website

Use a local server rather than opening `index.html` directly. The app uses `fetch()` to read JSON files, and browsers commonly block those requests from `file://` URLs.

For example, use VS Code's Live Server extension, or any static-file server that serves this project folder. Then open the local address shown by the server.

## Suggested Presentation Flow

1. Start at the hero area and explain that Travila brings tours, hotels, rentals, tickets, and activities into one travel-discovery experience.
2. Demonstrate the tabbed search interface and responsive navigation.
3. Show **Featured Tours** and apply multiple filters; explain that cards are generated from `data/tours.json`.
4. Click **Load More**, open a booking modal, and point out client-side form validation.
5. Demonstrate destination/testimonial carousels and Popular Spots filters.
6. Use global search to show that multiple datasets are searched in memory.
7. Open the chatbot, FAQ, theme toggle, and newsletter form to highlight user interaction and local persistence.
8. Close by clarifying the scope: it is a polished front-end prototype, ready to connect to real APIs and a backend.

## Important Scope Note

The current project is a **front-end demonstration**. Booking confirmation, sign-in, newsletter subscription, payment, inventory, and chatbot answers are simulated in the browser. No real user account, payment gateway, database, email provider, or external travel API is connected.

This is a strength to explain clearly during a presentation: the UI and client-side workflow are complete enough to demonstrate the user experience, while production services are a planned integration layer.

## Future Enhancements

- Connect tour, hotel, and activity inventory to a real travel API.
- Add a backend with a database for users, bookings, favourites, and newsletters.
- Implement secure authentication with password hashing and session/token management.
- Integrate a payment provider such as Stripe or Razorpay.
- Replace the rule-based chatbot with an API-backed AI assistant.
- Add server-side validation, booking availability checks, email confirmations, and admin management.
- Add automated unit, integration, accessibility, and end-to-end tests.
- Add proper offline caching only after defining a safe service-worker caching strategy.

## Presentation / Viva Questions and Answers

### 1. What problem does Travila solve?

Travila brings travel discovery into one interface. A user can explore tours, destinations, activities, and travel guidance without moving between multiple sites.

### 2. Why did you choose a single-page design?

It keeps browsing fast and focused. Sections, modals, filters, and carousels can update instantly in the browser without requiring a new page load for every interaction.

### 3. Which technologies did you use and why?

I used HTML5 for semantic structure, Tailwind CSS for responsive styling, vanilla JavaScript for interactions, and JSON files as a lightweight data source. This combination is simple, fast, and suitable for a front-end prototype.

### 4. Why use Tailwind CSS?

Tailwind makes responsive and consistent styling quicker through reusable utility classes. I also used custom CSS where component-specific behaviour, animations, and accessibility styling were needed.

### 5. How is the content loaded dynamically?

JavaScript uses `fetch()` to load local JSON files. Renderer functions then map each JSON object into an HTML card and place it in the corresponding section.

### 6. Why store content in JSON rather than hard-code it in HTML?

JSON separates data from presentation. Adding a tour or blog post only requires changing a data file; the same rendering function creates its UI automatically. This is closer to how a real API-driven application works.

### 7. How do the tour filters work?

Each rendered tour card receives `data-*` attributes such as category, duration, rating, and price range. When the user changes a filter, JavaScript compares those values and hides cards that do not match.

### 8. How does the global search work?

After the data has loaded, the search compares the user's query with text from tours, destinations, popular spots, and blog posts. Matching results are grouped and displayed in the search interface.

### 9. Is the booking system connected to a real payment system?

No. The booking flow is currently a front-end simulation with client-side validation and confirmation feedback. In production, it would submit securely to a backend, check availability, create a booking, and call a payment gateway.

### 10. How does the chatbot work?

It is a rule-based chatbot. It checks the user's message for travel-related keywords and returns predefined responses. It demonstrates the chat interface; an AI or backend service can replace this rule set later.

### 11. What is `localStorage` used for?

It stores small browser-side preferences, including the selected theme and currency, plus demo newsletter addresses. The data stays in that browser until it is cleared; it is not a replacement for a secure server database.

### 12. How did you make the website responsive?

The design uses Tailwind responsive breakpoints and flexible grids. Navigation changes for mobile, cards reflow from multiple columns to one column, and controls adapt to smaller screens.

### 13. What accessibility measures are included?

The site uses semantic landmarks, meaningful alternative text, ARIA labels for interactive controls, visible keyboard focus states, a skip-to-content link, and reduced-motion support for users who prefer less animation.

### 14. What performance optimizations are present?

Images below the first screen use lazy loading, local font files are available, data is loaded concurrently, and `IntersectionObserver` is used for scroll animations. This reduces work needed during the initial view.

### 15. Why is a local server required during development?

The browser loads JSON through `fetch()`. For security reasons, browsers can block fetch requests when a page is opened directly from the file system, so a local HTTP server is needed.

### 16. What would you change before deploying this to real users?

I would add a backend, secure authentication, server-side validation, real booking availability, payment processing, API error handling, testing, monitoring, and a carefully designed caching strategy.

### 17. What is the difference between client-side and server-side validation?

Client-side validation gives fast feedback in the browser, such as checking an email format. Server-side validation runs on the server and is essential because browser validation can be bypassed; it protects the application and its data.

### 18. What was the main technical challenge in this project?

Keeping a large interactive page organised without a framework. The solution was to separate data loading, rendering, filters, carousels, modal behaviour, and form handling into focused JavaScript functions.

## Short Project Summary for Presentation

"Travila is a responsive travel-booking front-end prototype built with HTML, Tailwind CSS, vanilla JavaScript, and JSON-based data. It provides dynamic tour cards, filtering, search, carousels, booking UI, user-preference storage, validation, and a rule-based chatbot. The current version focuses on a polished client-side experience and is designed to be extended with real APIs, authentication, and payments."

## License

This project currently has no explicitly defined project license. Add one before public distribution.
