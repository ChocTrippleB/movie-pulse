# CineSearch

> Discover what's trending, search any movie, and stay in the loop — no Netflix subscription needed.

A responsive movie discovery app built with **React + Vite**, powered by the **TMDB API** for real-time movie data and **Appwrite** as a backend to track the most-searched movies across all users.

---

## Live Demo

> https://moviepulse.vercel.app

---

## Preview

![CineSearch Hero](public/hero.png)

---

## Features

- **Live Movie Search** — search any movie title with a 500ms debounce so the API isn't hammered on every keystroke
- **Trending Searches** — Appwrite tracks how many times each movie is searched across all users and surfaces the top 5 most-searched movies in a carousel
- **Popular Movies Feed** — landing page shows the most popular movies right now via TMDB's discovery endpoint
- **Movie Cards** — each card shows poster, title, star rating, language, and release year
- **Error Handling** — friendly messages when the API fails or returns no results
- **Fully Responsive** — mobile-first grid that scales from 1 to 4 columns

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6 |
| Styling | Tailwind CSS v4 |
| Movie Data | TMDB API (The Movie Database) |
| Backend / DB | Appwrite (BaaS) |
| Debounce Hook | `react-use` |

---

## How It Works

```
User types in search bar
      ↓
500ms debounce fires
      ↓
TMDB API returns matching movies
      ↓
Appwrite logs the search term + increments count
      ↓
Top 5 most-searched movies update in the trending carousel
```

Appwrite stores each unique search term as a document with a `count` field. Every search either creates a new document or increments the existing one. The trending section queries the top 5 by count — meaning the trending list reflects real usage from every visitor.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- An [Appwrite](https://appwrite.io) project with a database and collection

### Appwrite Collection Schema

Create a collection with these attributes:

| Attribute | Type | Required |
|---|---|---|
| `searchTerm` | String | Yes |
| `count` | Integer | Yes |
| `movie_id` | Integer | Yes |
| `poster_url` | String | Yes |

### Installation

```bash
git clone https://github.com/your-username/cinesearch.git
cd cinesearch
npm install
```

### Environment Variables

Create a `.env` file in the root (use `.env.example` as a template):

```env
VITE_TMDB_API_KEY=your_tmdb_bearer_token
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=your_appwrite_collection_id
```

> **Note:** `VITE_TMDB_API_KEY` is the full Bearer token from TMDB, not the short API key.

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── MovieCard.jsx     # Movie card UI
│   ├── search.jsx        # Search input
│   └── spinner.jsx       # Loading spinner
├── appwrite.js           # Appwrite DB functions (updateSearchCount, getTrendingMovies)
├── App.jsx               # Root component — orchestrates all state and API calls
└── index.css             # Tailwind + custom theme variables and component styles
```

---

## What I Learned / Demonstrated

- Integrating a third-party REST API (TMDB) with `fetch` and Bearer token auth
- Using Appwrite as a lightweight BaaS to persist and query data without a custom backend
- Debouncing user input with `useDebounce` from `react-use` to avoid API spam
- Building a search analytics system — tracking search frequency and surfacing trends
- Responsive UI design with Tailwind CSS v4 using a mobile-first grid approach
- Clean state management with `useState` and `useEffect` in React 19

---

## Environment Variable Reference

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB API Read Access Token (Bearer) |
| `VITE_APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `VITE_APPWRITE_DATABASE_ID` | The database ID inside Appwrite |
| `VITE_APPWRITE_COLLECTION_ID` | The collection used for search tracking |

---

## License

MIT
