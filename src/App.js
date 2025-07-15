);

// --- API Helper Functions ---
const fetchFromTMDB = async (endpoint, params = '') => {
    try {
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&${params}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching from TMDB:", error);
        return null;
    }
};

const formatMovieData = (movie) => ({
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}w500${movie.poster_path}` : 'https://placehold.co/400x600/1f2937/ffffff?text=No+Image',
    imageUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}original${movie.backdrop_path}` : 'https://placehold.co/1920x1080/1f2937/ffffff?text=No+Image',
});

// --- Components ---

const Header = ({ user, onSearch }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const headerClasses = isScrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${headerClasses}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-red-600 tracking-wider">CINEVERSE</h1>
                        <nav className="hidden md:flex items-center space-x-6">
                            <a href="#" className="text-sm font-semibold hover:text-gray-300 transition-colors">Home</a>
                            <a href="#" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">My Curations</a>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search movies..."
                                className="bg-gray-800/50 border border-gray-700 rounded-full py-1.5 px-4 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                            </button>
                        </form>
                        {user && <img src={`https://placehold.co/40x40/7c3aed/ffffff?text=${user.uid.substring(0,1).toUpperCase()}`} alt="User Avatar" className="h-8 w-8 rounded-md object-cover" />}
                    </div>
                </div>
            </div>
        </header>
    );
};

const HeroSection = ({ movie, onWatchClick, onAddToList, isInMyList }) => {
    if (!movie) {
        return <div className="h-[65vh] md:h-[95vh] w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }
    return (
        <section className="relative h-[65vh] md:h-[95vh] w-full flex items-center">
            <div className="absolute inset-0">
                <img src={movie.imageUrl} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1920x1080/000000/ffffff?text=Movie+Scene'; }} alt="Hero Movie Scene" className="w-full h-full object-cover"/>
                <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(to right, #141414 10%, transparent 60%), linear-gradient(to top, #141414 5%, transparent 40%)'}}></div>
            </div>
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mt-2">{movie.title}</h2>
                <p className="mt-4 text-md md:text-lg text-gray-300 max-w-lg line-clamp-3">{movie.description}</p>
                <div className="mt-8 flex space-x-4">
                    <button onClick={() => onWatchClick(movie)} className="flex items-center justify-center bg-white text-black font-bold py-3 px-8 rounded-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                        <PlayIcon /> Where to Watch
                    </button>
                    <button onClick={() => onAddToList(movie)} className="flex items-center justify-center bg-gray-700/70 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-600/80 transition-all duration-300 transform hover:scale-105 w-48">
                        {isInMyList ? <><CheckIcon /> In My List</> : <><AddToListIcon /> Add to My List</>}
                    </button>
                </div>
            </div>
        </section>
    );
};

const MovieCard = ({ movie, onCardClick }) => (
    <div onClick={() => onCardClick(movie)} className="flex-shrink-0 w-40 md:w-48 group cursor-pointer">
        <img src={movie.posterUrl} alt={`Poster for ${movie.title}`} className="rounded-lg w-full h-auto transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg"/>
    </div>
);

const MovieCarousel = ({ title, movies, onMovieClick, isLoading, onClear, query }) => {
    if (isLoading) {
        return <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-64 flex items-center"><LoadingSpinner /></div>;
    }
    if (!movies || movies.length === 0) {
        if (onClear) { // This means it's a search result with no movies
            return (
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl md:text-2xl font-bold">No results for "{query}"</h3>
                        <button onClick={onClear} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Clear Search</button>
                    </div>
                </div>
            )
        }
        return null;
    }
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
                {onClear && <button onClick={onClear} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Clear Search</button>}
            </div>
            <div className="relative"><div className="flex space-x-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
                {movies.map(movie => <MovieCard key={movie.id} movie={movie} onCardClick={onMovieClick} />)}
            </div></div>
        </div>
    );
};

const ProviderSection = ({ title, providers }) => {
    if (!providers || providers.length === 0) return null;
    return (
        <div>
            <h4 className="text-sm font-bold tracking-wider text-gray-400 mb-3 uppercase">{title}</h4>
            <div className="space-y-3">
                {providers.map(p => (
                    <div key={p.provider_id} className="flex items-center bg-gray-800 p-3 rounded-lg">
                        <img src={`${IMAGE_BASE_URL}w92${p.logo_path}`} alt={p.provider_name} className="w-10 h-10 rounded-md mr-4"/>
                        <span className="font-semibold">{p.provider_name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WatchModal = ({ movie, onClose }) => {
    const [streamProviders, setStreamProviders] = useState([]);
    const [rentProviders, setRentProviders] = useState([]);
    const [buyProviders, setBuyProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!movie) return;
        setIsLoading(true);
        fetchFromTMDB(`/movie/${movie.id}/watch/providers`).then(data => {
            const usData = data?.results?.US;
            setStreamProviders(usData?.flatrate || []);
            setRentProviders(usData?.rent || []);
            setBuyProviders(usData?.buy || []);
            setIsLoading(false);
        });
    }, [movie]);

    if (!movie) return null;
    const hasProviders = streamProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 w-full max-w-md relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
                <h3 className="text-2xl font-bold text-white mb-2">Watch '{movie.title}' on:</h3>
                {isLoading ? (
                    <div className="h-48 flex justify-center items-center"><LoadingSpinner /></div>
                ) : (
                    hasProviders ? (
                        <div className="space-y-6 mt-6 max-h-[60vh] overflow-y-auto pr-2">
                            <ProviderSection title="Stream" providers={streamProviders} />
                            <ProviderSection title="Rent" providers={rentProviders} />
                            <ProviderSection title="Buy" providers={buyProviders} />
                        </div>
                    ) : (
                        <p className="text-gray-400 mt-6">Not available to stream, rent, or buy in the US.</p>
                    )
                )}
            </div>
        </div>
    );
};

const Footer = () => (
     <footer className="mt-16 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <p>&copy; 2024 Cineverse. All Rights Reserved. A React prototype by Gemini.</p>
            <p className="text-xs mt-2">Movie data provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">TMDB</a>. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
    </footer>
);

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [myList, setMyList] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [freeMovies, setFreeMovies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);

    // --- Firebase Initialization ---
    useEffect(() => {
        if (firebaseConfig.apiKey) {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);
            onAuthStateChanged(authInstance, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(authInstance, __initial_auth_token).catch(console.error);
                    } else {
                        await signInAnonymously(authInstance).catch(console.error);
                    }
                }
            });
        }
    }, []);

    // --- Fetch Initial Movie Data from TMDB ---
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            
            // Fetch Trending
            const trendingData = await fetchFromTMDB('/trending/movie/week');
            if (trendingData?.results) {
                const formatted = trendingData.results.map(formatMovieData);
                setHeroMovie(formatted[0]);
                setTrendingMovies(formatted);
            }

            // Fetch Top Rated
            const topRatedData = await fetchFromTMDB('/movie/top_rated');
            if (topRatedData?.results) {
                setTopRatedMovies(topRatedData.results.map(formatMovieData));
            }

            // Fetch Free to Watch Movies
            const freeMoviesData = await fetchFromTMDB('/discover/movie', 'with_watch_monetization_types=free&watch_region=US');
            if (freeMoviesData?.results) {
                setFreeMovies(freeMoviesData.results.map(formatMovieData));
            }

            setIsLoading(false);
        };
        init();
    }, []);

    // --- Firestore "My List" Listener ---
    useEffect(() => {
        if (!user || !db) {
            setMyList([]);
            return;
        }
        const myListCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'myList');
        const unsubscribe = onSnapshot(myListCollection, (snapshot) => {
            setMyList(snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id })));
        });
        return () => unsubscribe();
    }, [user, db]);

    const handleAddToList = useCallback(async (movie) => {
        if (!user || !db) return;
        const myListCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'myList');
        const q = query(myListCollection, where("id", "==", movie.id));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(myListCollection, { id: movie.id, title: movie.title, posterUrl: movie.posterUrl });
        } else {
            querySnapshot.forEach(doc => deleteDoc(doc.ref));
        }
    }, [user, db]);

    const handleOpenModal = (movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleSearch = async (query) => {
        if (!query) return;
        setIsSearchLoading(true);
        setIsSearching(true);
        setSearchQuery(query);
        const searchData = await fetchFromTMDB('/search/movie', `query=${encodeURIComponent(query)}`);
        if (searchData?.results) {
            setSearchResults(searchData.results.map(formatMovieData));
        }
        setIsSearchLoading(false);
    };

    const clearSearch = () => {
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery('');
    };

    const myListIds = new Set(myList.map(item => item.id));

    return (
        <div className="bg-black text-white" style={{fontFamily: "'Inter', sans-serif"}}>
            <Header user={user} onSearch={handleSearch} />
            <main>
                {!isSearching && <HeroSection 
                    movie={heroMovie} 
                    onWatchClick={handleOpenModal}
                    onAddToList={handleAddToList}
                    isInMyList={heroMovie && myListIds.has(heroMovie.id)}
                />}
                <section className={`py-4 md:py-8 space-y-8 md:space-y-12 ${isSearching ? 'pt-24' : ''}`}>
                    {isSearching ? (
                        <MovieCarousel 
                            title={`Search Results for "${searchQuery}"`}
                            movies={searchResults} 
                            onMovieClick={handleOpenModal} 
                            isLoading={isSearchLoading}
                            onClear={clearSearch}
                            query={searchQuery}
                        />
                    ) : (
                        <>
                            {user && <MovieCarousel title="My List" movies={myList} onMovieClick={handleOpenModal} isLoading={false} />}
                            <MovieCarousel title="Trending This Week" movies={trendingMovies} onMovieClick={handleOpenModal} isLoading={isLoading} />
                            <MovieCarousel title="Free to Watch with Ads" movies={freeMovies} onMovieClick={handleOpenModal} isLoading={isLoading} />
                            <MovieCarousel title="Top Rated Movies" movies={topRatedMovies} onMovieClick={handleOpenModal} isLoading={isLoading} />
                        </>
                    )}
                </section>
            </main>
            <Footer />
            {isModalOpen && <WatchModal movie={selectedMovie} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}
