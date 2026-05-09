import React, { useEffect, useState } from 'react'
import Search from "./components/search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetail from "./components/MovieDetail.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzA4OWYxZWE3NTI2OTg1NDNjZTYzOWFhMjhjNjJkZCIsIm5iZiI6MTc0OTgwNTMxMS4xMDA5OTk4LCJzdWIiOiI2ODRiZThmZjY0MDE1OWRlNzgyOTQzZTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ABJGfyDiJKnZdIBwS8FSodS0xNlahLSvAjkJgAJb5SA';

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '', page = 1) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) throw new Error('Failed to fetch movies');

            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
            setTotalPages(Math.min(data.total_pages || 1, 500));

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (e) {
            console.error('Error getting trendingMovies');
        }
    }

    // Reset to page 1 whenever the search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchMovies(debouncedSearchTerm, currentPage);
    }, [debouncedSearchTerm, currentPage]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (selectedMovieId) {
        return <MovieDetail movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} onMovieSelect={setSelectedMovieId} />
    }

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner/>
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <>
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard movie={movie} key={movie.id} onClick={() => setSelectedMovieId(movie.id)}/>
                                ))}
                            </ul>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-dark-100 border border-white/10 hover:border-light-200/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Prev
                                    </button>

                                    {pageNumbers.map((p, i) =>
                                        p === '...' ? (
                                            <span key={`dots-${i}`} className="text-gray-100 px-1 select-none">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => goToPage(p)}
                                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                                                    p === currentPage
                                                        ? 'bg-light-100/20 text-light-100 border border-light-100/50 shadow-sm shadow-light-100/20'
                                                        : 'text-gray-100 bg-dark-100 border border-white/10 hover:border-light-200/40 hover:text-white'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-dark-100 border border-white/10 hover:border-light-200/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}
export default App
