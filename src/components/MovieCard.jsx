import React from 'react'

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language }, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[2/3] bg-dark-100 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-light-100/10"
        >
            {/* Poster — zooms subtly on hover */}
            <img
                src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Language badge — top left */}
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded-md tracking-wide">
                {original_language}
            </span>

            {/* Rating badge — top right */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md">
                <img src="/star.svg" alt="rating" className="w-3 h-3" />
                <span className="text-white text-xs font-bold">
                    {vote_average ? vote_average.toFixed(1) : 'N/A'}
                </span>
            </div>

            {/* Persistent bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

            {/* Play button — fades in on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white ml-1">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>

            {/* Title + year — always visible at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-1">
                    {title}
                </h3>
                <p className="text-light-200 text-xs">
                    {release_date ? release_date.split('-')[0] : 'N/A'}
                </p>
            </div>
        </div>
    )
}

export default MovieCard
