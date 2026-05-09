import React, {useEffect, useState, use} from 'react'
import Search from "./components/search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetail from "./components/MovieDetail.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzA4OWYxZWE3NTI2OTg1NDNjZTYzOWFhMjhjNjJkZCIsIm5iZiI6MTc0OTgwNTMxMS4xMDA5OTk4LCJzdWIiOiI2ODRiZThmZjY0MDE1OWRlNzgyOTQzZTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ABJGfyDiJKnZdIBwS8FSodS0xNlahLSvAjkJgAJb5SA';

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce( () => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);



    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length > 0) {
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

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies()
    })


    if (selectedMovieId) {
        return <MovieDetail movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} onMovieSelect={setSelectedMovieId} />
    }

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
                                    <img src={movie.poster_url} alt={movie.title} />
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
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard movie={movie} key={movie.id} onClick={() => setSelectedMovieId(movie.id)} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>

        </main>
    )
}
export default App