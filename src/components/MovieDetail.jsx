import React, { useEffect, useState } from 'react'
import Spinner from './spinner.jsx'

const API_BASE_URL = 'https://api.themoviedb.org/3'

const formatMoney = (n) => {
    if (!n || n === 0) return null
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    return `$${n.toLocaleString()}`
}

const formatRuntime = (mins) => {
    if (!mins || mins === 0) return null
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const MovieDetail = ({ movieId, onClose, onMovieSelect }) => {
    const [movie, setMovie] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true)
            setMovie(null)
            try {
                const res = await fetch(
                    `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,videos,similar`,
                    {
                        headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
                        }
                    }
                )
                const data = await res.json()
                setMovie(data)
            } catch (e) {
                console.error('Failed to fetch movie details')
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [movieId])

    if (loading) return (
        <div className="min-h-screen bg-primary flex items-center justify-center">
            <Spinner />
        </div>
    )

    if (!movie) return null

    const director   = movie.credits?.crew?.find(c => c.job === 'Director')
    const writers    = movie.credits?.crew?.filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job)).slice(0, 3)
    const cast       = movie.credits?.cast?.slice(0, 10)
    const trailer    = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
        ?? movie.videos?.results?.find(v => v.site === 'YouTube')
    const similar    = movie.similar?.results?.filter(m => m.poster_path).slice(0, 10)
    const studios    = movie.production_companies?.filter(c => c.logo_path).slice(0, 4)
    const budget     = formatMoney(movie.budget)
    const revenue    = formatMoney(movie.revenue)
    const runtime    = formatRuntime(movie.runtime)

    return (
        <main className="min-h-screen bg-primary relative overflow-x-hidden">
            <div className="pattern" />

            {/* ── Backdrop ── */}
            <div className="relative h-72 sm:h-[440px] overflow-hidden">
                {movie.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                        alt=""
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="w-full h-full bg-dark-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />

                <button
                    onClick={onClose}
                    className="absolute top-5 left-5 flex items-center gap-2 text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer z-10"
                >
                    ← Back
                </button>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-5xl mx-auto px-5 xs:px-10 -mt-40 relative z-10 pb-24 flex flex-col gap-14">

                {/* Hero row: poster + core info */}
                <div className="flex flex-col sm:flex-row gap-8 items-end sm:items-end">

                    <img
                        src={movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : '/no-movie.png'}
                        alt={movie.title}
                        className="w-40 sm:w-52 rounded-2xl shadow-2xl shadow-black/70 shrink-0 self-start sm:self-auto"
                    />

                    <div className="flex flex-col gap-4 pb-1 flex-1">

                        {/* Title */}
                        <p className="text-white text-3xl sm:text-[42px] font-bold leading-tight">
                            {movie.title}
                        </p>

                        {movie.tagline && (
                            <p className="text-light-200 italic text-sm -mt-2">&ldquo;{movie.tagline}&rdquo;</p>
                        )}

                        {/* Genre pills */}
                        <div className="flex flex-wrap gap-2">
                            {movie.genres?.map(g => (
                                <span key={g.id} className="px-3 py-1 bg-light-100/10 text-light-100 text-xs rounded-full border border-light-100/20">
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-100">
                            <span className="flex items-center gap-1.5">
                                <img src="/star.svg" alt="rating" className="w-4 h-4" />
                                <span className="text-white font-bold text-base">{movie.vote_average?.toFixed(1)}</span>
                                <span className="text-xs text-gray-100">/ 10</span>
                            </span>
                            <span className="text-xs text-gray-100">({movie.vote_count?.toLocaleString()} votes)</span>
                            <span className="mx-1">•</span>
                            <span>{movie.release_date?.split('-')[0]}</span>
                            {runtime && <><span>•</span><span>{runtime}</span></>}
                            <span>•</span>
                            <span className="uppercase">{movie.original_language}</span>
                            {movie.status && (
                                <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                    movie.status === 'Released'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {movie.status}
                                </span>
                            )}
                        </div>

                        {/* Overview */}
                        {movie.overview && (
                            <p className="text-light-200 text-sm leading-relaxed max-w-2xl">
                                {movie.overview}
                            </p>
                        )}

                        {/* Director / Writers */}
                        <div className="flex flex-col gap-1.5 text-sm border-t border-white/10 pt-4 mt-1">
                            {director && (
                                <div className="flex gap-2">
                                    <span className="text-gray-100 w-16 shrink-0">Director</span>
                                    <span className="text-white font-medium">{director.name}</span>
                                </div>
                            )}
                            {writers?.length > 0 && (
                                <div className="flex gap-2">
                                    <span className="text-gray-100 w-16 shrink-0">Writers</span>
                                    <span className="text-white font-medium">{writers.map(w => w.name).join(', ')}</span>
                                </div>
                            )}
                            {(budget || revenue) && (
                                <div className="flex gap-6 mt-1 pt-1">
                                    {budget && (
                                        <div>
                                            <p className="text-gray-100 text-xs mb-0.5">Budget</p>
                                            <p className="text-white font-semibold">{budget}</p>
                                        </div>
                                    )}
                                    {revenue && (
                                        <div>
                                            <p className="text-gray-100 text-xs mb-0.5">Box Office</p>
                                            <p className="text-white font-semibold">{revenue}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Trailer button */}
                        {trailer && (
                            <a
                                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold px-6 py-2.5 rounded-full w-fit hover:bg-light-100 transition-colors mt-1"
                            >
                                ▶&nbsp; Watch Trailer
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Cast ── */}
                {cast?.length > 0 && (
                    <section>
                        <h2 className="mb-5">Top Cast</h2>
                        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2">
                            {cast.map(person => (
                                <div key={person.cast_id ?? person.id} className="flex flex-col items-center gap-2 min-w-[72px] max-w-[72px]">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-100 shrink-0 ring-2 ring-white/10">
                                        <img
                                            src={person.profile_path
                                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                                : '/no-movie.png'}
                                            alt={person.name}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    </div>
                                    <p className="text-white text-xs font-semibold text-center leading-tight">{person.name}</p>
                                    <p className="text-gray-100 text-[10px] text-center leading-tight line-clamp-2">{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Production Companies ── */}
                {studios?.length > 0 && (
                    <section>
                        <h2 className="mb-5">Production</h2>
                        <div className="flex flex-wrap items-center gap-6">
                            {studios.map(c => (
                                <div key={c.id} className="flex items-center gap-2">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${c.logo_path}`}
                                        alt={c.name}
                                        className="h-7 object-contain brightness-0 invert opacity-70"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── More Like This ── */}
                {similar?.length > 0 && (
                    <section>
                        <h2 className="mb-5">More Like This</h2>
                        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                            {similar.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => onMovieSelect(m.id)}
                                    className="min-w-[130px] max-w-[130px] cursor-pointer group"
                                >
                                    <div className="overflow-hidden rounded-xl">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                                            alt={m.title}
                                            className="w-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <p className="text-white text-xs mt-2 font-medium leading-tight line-clamp-2">{m.title}</p>
                                    <p className="text-gray-100 text-[11px] mt-0.5">{m.release_date?.split('-')[0]}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}

export default MovieDetail
