const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentMode = 'movie';
let currentContent = null;
let currentEpisodes = [];
let currentEpisodeIndex = 0;
let cookiesAllowed = false;
let librarySlideIndex = 0;
let librarySlideInterval;
let currentTheme = Cookies.get('theme') || 'orange';
let clickCount = {};
let currentImages = [
    'jpeg.jpeg', 'jpeg1.jpeg', 'jpeg2.jpeg', 'jpeg3.jpeg', 'jpeg4.jpeg', 'jpeg5.jpeg',
    'jpeg6.jpeg', 'jpeg7.jpeg', 'jpeg8.jpeg', 'jpeg9.jpeg', 'jpeg10.jpeg', 'jpeg11.jpeg',
    'jpeg12.jpeg', 'jpeg13.jpeg', 'jpeg14.jpeg', 'jpeg15.jpeg', 'jpeg16.jpeg', 'jpeg17.jpeg',
    'jpeg18.jpeg', 'jpeg19.jpeg', 'jpeg20.jpeg', 'jpeg21.jpeg', 'jpeg22.jpeg', 'jpeg23.jpeg',
    'jpeg24.jpeg', 'jpeg25.jpeg', 'jpeg26.jpeg', 'jpeg27.jpeg', 'jpeg28.jpeg', 'jpeg29.jpeg',
    'jpeg30.jpeg', 'jpeg31.jpeg', 'jpeg32.jpeg', 'jpeg33.jpeg', 'jpeg34.jpeg', 'jpeg35.jpeg',
    'jpeg36.jpeg', 'jpeg37.jpeg', 'jpeg38.jpeg', 'jpeg39.jpeg', 'jpeg40.jpeg',
    '1.jpeg', '2.jpeg',
    'UC.webp', 'UC1.webp', 'UC2.webp', 'UC3.webp', 'UC4.webp', 'UC5.webp', 'UC6.webp'
];
let currentImageIndex = 0;
let castSession = null;

function checkCookieConsent() {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
        document.getElementById('cookieConsent').style.display = 'block';
    } else {
        cookiesAllowed = consent === 'accepted';
        if (cookiesAllowed) {
            loadAllContent();
            loadLibrary();
            checkName();
            applyTheme(currentTheme);
            initializeCast();
        }
        initLibrarySlider();
    }
}

function acceptCookies() {
    Cookies.set('cookieConsent', 'accepted', { expires: 365 });
    cookiesAllowed = true;
    document.getElementById('cookieConsent').style.display = 'none';
    loadAllContent();
    loadLibrary();
    checkName();
    initLibrarySlider();
    applyTheme(currentTheme);
    initializeCast();
}

function declineCookies() {
    Cookies.set('cookieConsent', 'declined', { expires: 365 });
    cookiesAllowed = false;
    document.getElementById('cookieConsent').style.display = 'none';
}

function loadAllContent() {
    loadPopularMovies();
    loadAllAnimeSections();
}

function checkName() {
    const name = Cookies.get('userName');
    if (!name) {
        document.getElementById('namePrompt').style.display = 'block';
    } else {
        showWelcomeMessage(name);
    }
}

function saveName() {
    const name = document.getElementById('userName').value.trim();
    if (name) {
        Cookies.set('userName', name, { expires: 365 });
        document.getElementById('namePrompt').style.display = 'none';
        showWelcomeMessage(name);
    } else {
        alert('Please enter a name.');
    }
}

function showWelcomeMessage(name) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.innerHTML = `Hi, ${name}<span style="color: #9370DB; font-weight: bold;">!</span><br><span style="color: #808080; font-size: 0.9rem;">Welcome to UTILIX CINEMA. Enjoy Watching</span>`;
    welcomeMessage.style.display = 'block';
    setTimeout(() => {
        welcomeMessage.style.display = 'none';
    }, 2000); // Display for 2 seconds
}

function initLibrarySlider() {
    librarySlideIndex = 0;
    showLibrarySlide(librarySlideIndex);
    startLibrarySlider();
}

function startLibrarySlider() {
    librarySlideInterval = setInterval(() => {
        librarySlideIndex = (librarySlideIndex + 1) % 7;
        showLibrarySlide(librarySlideIndex);
    }, 5000);
}

function showLibrarySlide(index) {
    const libraryImages = document.querySelectorAll('.library-image');
    libraryImages.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
    console.log(`Showing library slide ${index + 1} (index: ${index})`);
}

function nextLibrarySlide() {
    librarySlideIndex = (librarySlideIndex + 1) % 7;
    showLibrarySlide(librarySlideIndex);
    resetLibraryInterval();
}

function prevLibrarySlide() {
    librarySlideIndex = (librarySlideIndex - 1 + 7) % 7;
    showLibrarySlide(librarySlideIndex);
    resetLibraryInterval();
}

function resetLibraryInterval() {
    clearInterval(librarySlideInterval);
    startLibrarySlider();
}

// Keyboard controls for library slider
document.addEventListener('keydown', (e) => {
    if (currentMode === 'library') {
        if (e.key === 'ArrowLeft') prevLibrarySlide();
        if (e.key === 'ArrowRight') nextLibrarySlide();
    }
});

async function switchMode(mode) {
    currentMode = mode;
    document.getElementById('movieMode').classList.toggle('active', mode === 'movie');
    document.getElementById('animeMode').classList.toggle('active', mode === 'anime');
    document.getElementById('libraryMode').classList.toggle('active', mode === 'library');
    document.getElementById('movieNav').style.display = mode === 'movie' ? 'block' : 'none';
    document.getElementById('movieSection').style.display = mode === 'movie' ? 'block' : 'none';
    document.getElementById('tvSection').style.display = mode === 'movie' ? 'block' : 'none';
    document.getElementById('animeSection').style.display = mode === 'anime' ? 'block' : 'none';
    document.getElementById('librarySection').style.display = mode === 'library' ? 'block' : 'none';

    const movieGrids = ['movieGrid', 'tvGrid'];
    const animeGrids = ['animeMovieGrid', 'animeSeriesGrid', 'trendingGrid', 'popularGrid', 'recommendedGrid', 'topGrid', 'latestGrid'];
    const libraryGrids = ['libraryMovieGrid', 'librarySeriesGrid'];
    movieGrids.forEach(id => document.getElementById(id).innerHTML = '');
    animeGrids.forEach(id => document.getElementById(id).innerHTML = '');
    libraryGrids.forEach(id => document.getElementById(id).innerHTML = '');

    if (mode === 'movie') {
        loadPopularMovies();
    } else if (mode === 'anime') {
        loadAllAnimeSections();
    } else if (mode === 'library') {
        loadLibrary();
    }
    document.getElementById('sidebar').classList.remove('active');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function toggleCategoriesPopup() {
    const popup = document.getElementById('categoriesPopup');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function closeCategoriesPopup() {
    document.getElementById('categoriesPopup').style.display = 'none';
}

function loadCategoryAndClose(genre) {
    loadCategory(genre);
    closeCategoriesPopup();
}

async function searchContent() {
    const searchInput = document.getElementById('searchInput').value;
    if (currentMode === 'movie') {
        const movieGrid = document.getElementById('movieGrid');
        const tvGrid = document.getElementById('tvGrid');
        movieGrid.innerHTML = '';
        tvGrid.innerHTML = '';
        try {
            const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchInput)}`);
            const data = await response.json();
            const movies = data.results.filter(item => item.media_type === 'movie');
            const tvShows = data.results.filter(item => item.media_type === 'tv');
            displayResults(movies, movieGrid);
            displayResults(tvShows, tvGrid);
        } catch (error) {
            console.error('Error searching movies:', error);
        }
    } else if (currentMode === 'anime') {
        const grids = ['animeMovieGrid', 'animeSeriesGrid', 'trendingGrid', 'popularGrid', 'recommendedGrid', 'topGrid', 'latestGrid'];
        grids.forEach(id => document.getElementById(id).innerHTML = '');
        try {
            const movieResponse = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchInput)}&with_genres=16`);
            const seriesResponse = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchInput)}&with_genres=16`);
            const movieData = await movieResponse.json();
            const seriesData = await seriesResponse.json();
            displayResults(movieData.results, document.getElementById('animeMovieGrid'));
            displayResults(seriesData.results, document.getElementById('animeSeriesGrid'));
        } catch (error) {
            console.error('Error searching anime:', error);
        }
    }
}

async function showSuggestions(query) {
    const suggestions = document.getElementById('suggestions');
    if (!query || query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        suggestions.innerHTML = '';
        data.results.slice(0, 5).forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/50x75'}" alt="${item.title || item.name}">
                <span>${item.title || item.name} (${item.media_type})</span>
            `;
            suggestion.onclick = () => {
                document.getElementById('searchInput').value = item.title || item.name;
                suggestions.style.display = 'none';
                showContentPlayer(item);
            };
            suggestions.appendChild(suggestion);
        });
        suggestions.style.display = 'block';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

async function loadCategory(genre) {
    const genreMap = {
        action: 28, adventure: 12, comedy: 35, drama: 18, horror: 27, thriller: 53, mystery: 9648,
        'sci-fi': 878, fantasy: 14, romance: 10749, animation: 16, documentary: 99, musical: 10402,
        crime: 80, war: 10752, western: 37
    };

    const movieGrid = document.getElementById('movieGrid');
    const tvGrid = document.getElementById('tvGrid');
    movieGrid.innerHTML = '';
    tvGrid.innerHTML = '';

    try {
        if (genreMap[genre]) {
            const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreMap[genre]}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            displayResults(data.results, movieGrid);
        }
    } catch (error) {
        console.error('Error loading category:', error);
    }

    try {
        if (genreMap[genre]) {
            const endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreMap[genre]}`;
            const response = await fetch(endpoint);
            const data = await response.json();
            displayResults(data.results, tvGrid);
        }
    } catch (error) {
        console.error('Error loading category for TV:', error);
    }
}

async function loadAllAnimeSections() {
    const sections = {
        animeMovie: { grid: 'animeMovieGrid', endpoint: `/discover/movie?with_genres=16` },
        animeSeries: { grid: 'animeSeriesGrid', endpoint: `/discover/tv?with_genres=16` },
        trending: { grid: 'trendingGrid', endpoint: `/trending/tv/week?with_genres=16` },
        popular: { grid: 'popularGrid', endpoint: `/tv/popular?with_genres=16` },
        recommended: { grid: 'recommendedGrid', endpoint: `/tv/top_rated?with_genres=16` },
        top: { grid: 'topGrid', endpoint: `/tv/top_rated?with_genres=16` },
        latest: { grid: 'latestGrid', endpoint: `/tv/on_the_air?with_genres=16` }
    };

    for (const [section, { grid, endpoint }] of Object.entries(sections)) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}${endpoint}&api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            displayResults(data.results, document.getElementById(grid));
        } catch (error) {
            console.error(`Error loading ${section}:`, error);
            document.getElementById(grid).innerHTML = '<p>Error loading content.</p>';
        }
    }
}

function displayResults(results, grid) {
    if (results && results.length > 0) {
        for (const item of results) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/200'}" alt="${item.title || item.name}">
                <h3>${item.title || item.name}</h3>
                <p>${item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : 'N/A'} | Rating: ${item.vote_average || 'N/A'}</p>
            `;
            movieCard.onclick = () => showContentPlayer(item);
            grid.appendChild(movieCard);
        }
    } else {
        grid.innerHTML = '<p>No results found</p>';
    }
}

async function showContentPlayer(item) {
    currentContent = item;
    const modal = document.getElementById('playerModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const contentTitle = document.getElementById('contentTitle');
    const contentDescription = document.getElementById('contentDescription');
    const serverSelect = document.getElementById('serverSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const libraryButton = document.getElementById('libraryButton');
    const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');
    const castButton = document.getElementById('castButton');

    contentTitle.textContent = item.title || item.name;
    contentDescription.textContent = item.overview || 'No description available.';
    videoPlayer.innerHTML = '<p>Please select a server to watch</p>';
    serverSelect.value = '';
    episodeSelect.style.display = 'none';
    nextEpisodeBtn.style.display = 'none';

    updateLibraryButton(libraryButton, item.id);

    if (item.media_type === 'tv' || item.first_air_date) {
        await loadEpisodes(item.id);
    }
    await loadRecommendations(item.id, item.media_type || 'movie');

    modal.style.display = 'block';
    initializeCastButton(castButton);
}

async function loadEpisodes(seriesId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        currentEpisodes = data.seasons.flatMap(season =>
            Array.from({ length: season.episode_count }, (_, i) => ({
                season: season.season_number,
                episode: i + 1
            }))
        );
        const episodeSelect = document.getElementById('episodeSelect');
        episodeSelect.innerHTML = '<option value="">Select Episode</option>';
        currentEpisodes.forEach((ep, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `S${ep.season} E${ep.episode}`;
            episodeSelect.appendChild(option);
        });
        episodeSelect.style.display = 'block';
        document.getElementById('nextEpisodeBtn').style.display = 'block';
    } catch (error) {
        console.error('Error loading episodes:', error);
    }
}

async function loadRecommendations(contentId, mediaType) {
    const recGrid = document.getElementById('recGrid');
    recGrid.innerHTML = '';
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/${contentId}/recommendations?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        displayResults(data.results.slice(0, 5), recGrid);
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

function toggleLibrary(item) {
    if (!cookiesAllowed) {
        alert('Please accept cookies to use the library feature.');
        return;
    }

    const library = getLibrary();
    const isSeries = item.media_type === 'tv' || item.first_air_date;
    const key = isSeries ? 'series' : 'movies';
    const index = library[key].findIndex(i => i.id === item.id);

    if (index === -1) {
        library[key].push(item);
    } else {
        library[key].splice(index, 1);
    }

    Cookies.set('library', JSON.stringify(library), { expires: 365 });
    updateLibraryButton(document.getElementById('libraryButton'), item.id);
    if (currentMode === 'library') loadLibrary();
}

function getLibrary() {
    const libraryCookie = Cookies.get('library');
    return libraryCookie ? JSON.parse(libraryCookie) : { movies: [], series: [] };
}

function updateLibraryButton(button, id) {
    if (!button) return;
    const library = getLibrary();
    const isSeries = library.series.some(i => i.id === id);
    const isMovie = library.movies.some(i => i.id === id);
    const inLibrary = isSeries || isMovie;
    button.textContent = inLibrary ? 'Remove from Library' : 'Add to Library';
    button.classList.toggle('in-library', inLibrary);
    button.dataset.id = id;
}

async function loadLibrary() {
    const library = getLibrary();
    const movieGrid = document.getElementById('libraryMovieGrid');
    const seriesGrid = document.getElementById('librarySeriesGrid');
    const imageThumbnails = document.getElementById('imageThumbnails');
    movieGrid.innerHTML = '';
    seriesGrid.innerHTML = '';
    imageThumbnails.innerHTML = '';

    // Display Movies
    if (library.movies.length > 0) {
        displayResults(library.movies, movieGrid);
    } else {
        movieGrid.innerHTML = '<p>No movies in library.</p>';
    }

    // Display Series
    if (library.series.length > 0) {
        displayResults(library.series, seriesGrid);
    } else {
        seriesGrid.innerHTML = '<p>No series in library.</p>';
    }

    // Load all specified image files from the root directory
    currentImages = [
        'jpeg.jpeg', 'jpeg1.jpeg', 'jpeg2.jpeg', 'jpeg3.jpeg', 'jpeg4.jpeg', 'jpeg5.jpeg',
        'jpeg6.jpeg', 'jpeg7.jpeg', 'jpeg8.jpeg', 'jpeg9.jpeg', 'jpeg10.jpeg', 'jpeg11.jpeg',
        'jpeg12.jpeg', 'jpeg13.jpeg', 'jpeg14.jpeg', 'jpeg15.jpeg', 'jpeg16.jpeg', 'jpeg17.jpeg',
        'jpeg18.jpeg', 'jpeg19.jpeg', 'jpeg20.jpeg', 'jpeg21.jpeg', 'jpeg22.jpeg', 'jpeg23.jpeg',
        'jpeg24.jpeg', 'jpeg25.jpeg', 'jpeg26.jpeg', 'jpeg27.jpeg', 'jpeg28.jpeg', 'jpeg29.jpeg',
        'jpeg30.jpeg', 'jpeg31.jpeg', 'jpeg32.jpeg', 'jpeg33.jpeg', 'jpeg34.jpeg', 'jpeg35.jpeg',
        'jpeg36.jpeg', 'jpeg37.jpeg', 'jpeg38.jpeg', 'jpeg39.jpeg', 'jpeg40.jpeg',
        '1.jpeg', '2.jpeg',
        'UC.webp', 'UC1.webp', 'UC2.webp', 'UC3.webp', 'UC4.webp', 'UC5.webp', 'UC6.webp'
    ];

    currentImages.forEach((src, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.innerHTML = `<img src="${src}" alt="Thumbnail ${index + 1}">`;
        thumbnail.onclick = () => handleThumbnailClick(src, thumbnail);
        imageThumbnails.appendChild(thumbnail);
    });
}

function handleThumbnailClick(src, thumbnail) {
    const key = src;
    clickCount[key] = (clickCount[key] || 0) + 1;

    if (clickCount[key] === 1) {
        showImageViewer(src);
    }
}

function showImageViewer(src) {
    currentImageIndex = currentImages.indexOf(src);
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = src;
    viewerImage.className = 'viewer-image'; // Default to normal view
    document.getElementById('viewSizeSelect').value = 'normal';
    document.getElementById('imageViewerModal').style.display = 'block';
}

function closeImageViewer() {
    document.getElementById('imageViewerModal').style.display = 'none';
}

function changeViewSize() {
    const size = document.getElementById('viewSizeSelect').value;
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.className = `viewer-image ${size}`;
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = currentImages[currentImageIndex];
    document.getElementById('viewSizeSelect').value = 'normal'; // Reset to normal on navigation
    viewerImage.className = 'viewer-image';
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = currentImages[currentImageIndex];
    document.getElementById('viewSizeSelect').value = 'normal'; // Reset to normal on navigation
    viewerImage.className = 'viewer-image';
}

function changeServer() {
    const server = document.getElementById('serverSelect').value;
    const videoPlayer = document.getElementById('videoPlayer');
    const contentId = currentContent.id;

    if (!server || !contentId) return;

    videoPlayer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('scrolling', 'no');

    let src = '';
    if (currentContent.media_type === 'tv' || currentContent.first_air_date) {
        const ep = currentEpisodes[currentEpisodeIndex];
        switch (server) {
            case 'vidsrcDev': src = `https://vidsrc.dev/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'vidsrcXyz': src = `https://vidsrc.xyz/embed/tv?tmdb=${contentId}&season=${ep.season}&episode=${ep.episode}`; break;
            case 'vidsrcCc': src = `https://vidsrc.cc/v2/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'embedSu': src = `https://embed.su/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'vidlink': src = `https://vidlink.pro/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'vidsrcIcu': src = `https://vidsrc.icu/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'autoembed': src = `https://player.autoembed.cc/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
            case 'vidsrcTo': src = `https://vidsrc.to/embed/tv/${contentId}/${ep.season}/${ep.episode}`; break;
        }
    } else {
        switch (server) {
            case 'vidsrcDev': src = `https://vidsrc.dev/embed/movie/${contentId}`; break;
            case 'vidsrcXyz': src = `https://vidsrc.xyz/embed/movie?tmdb=${contentId}`; break;
            case 'vidsrcCc': src = `https://vidsrc.cc/v2/embed/movie/${contentId}`; break;
            case 'embedSu': src = `https://embed.su/embed/movie/${contentId}`; break;
            case 'vidlink': src = `https://vidlink.pro/movie/${contentId}`; break;
            case 'vidsrcIcu': src = `https://vidsrc.icu/embed/movie/${contentId}`; break;
            case 'autoembed': src = `https://player.autoembed.cc/embed/movie/${contentId}`; break;
            case 'vidsrcTo': src = `https://vidsrc.to/embed/movie/${contentId}`; break;
        }
    }

    iframe.src = src;
    videoPlayer.appendChild(iframe);
}

function changeEpisode() {
    currentEpisodeIndex = parseInt(document.getElementById('episodeSelect').value);
    changeServer();
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
    document.getElementById('videoPlayer').innerHTML = '';
    document.getElementById('serverSelect').value = '';
    document.getElementById('episodeSelect').style.display = 'none';
    currentEpisodeIndex = 0;
    if (castSession) {
        castSession.endSession(true);
        castSession = null;
    }
}

function rewindVideo() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[-5,true]}', '*');
}

function forwardVideo() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[5,true]}', '*');
}

function togglePlayPause() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":[]}', '*');
}

function toggleFullscreen() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.requestFullscreen();
}

function initializeCast() {
    if (!window.cast || !window.chrome || !window.chrome.cast) {
        console.error('Google Cast SDK not loaded or not supported.');
        return;
    }

    const castContext = cast.framework.CastContext.getInstance();
    castContext.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    castContext.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        if (event.sessionState === 'SESSION_STARTED') {
            castSession = castContext.getCurrentSession();
            console.log('Cast session started:', castSession);
        } else if (event.sessionState === 'SESSION_ENDED') {
            castSession = null;
            console.log('Cast session ended.');
        }
    });
}

function initializeCastButton(button) {
    if (!window.cast || !window.chrome || !window.chrome.cast) {
        console.error('Google Cast SDK not loaded or not supported.');
        button.disabled = true;
        return;
    }

    button.onclick = () => castToAndroidTV();
}

function castToAndroidTV() {
    if (!cookiesAllowed) {
        alert('Please accept cookies to use the casting feature.');
        return;
    }

    if (!navigator.onLine) {
        alert('Please ensure your device is connected to the internet and WiFi.');
        return;
    }

    const isSameNetwork = confirm('Are your device and Android TV connected to the same WiFi network?');
    if (!isSameNetwork) {
        alert('Please connect both devices to the same WiFi network for Google Cast.');
        return;
    }

    const castContext = cast.framework.CastContext.getInstance();
    const availableReceivers = castContext.getAvailableReceivers();
    if (!availableReceivers || availableReceivers.length === 0) {
        alert('No Android TV/Google TV devices found on the same WiFi network. Ensure your TV has Chromecast Built-In and is on the same network.');
        return;
    }

    // Simulate device selection (Google Cast SDK handles this automatically in a real app)
    let deviceList = '';
    availableReceivers.forEach((receiver, index) => {
        deviceList += `${index + 1}. ${receiver.friendlyName} (${receiver.ipAddress})\n`;
    });

    let deviceChoice = prompt(`Select an Android TV/Google TV to cast to:\n${deviceList}`);
    if (!deviceChoice || isNaN(deviceChoice) || deviceChoice < 1 || deviceChoice > availableReceivers.length) {
        alert('No device selected or invalid choice. Casting canceled.');
        return;
    }

    const selectedReceiver = availableReceivers[deviceChoice - 1];
    castContext.requestSession().then(session => {
        castSession = session;
        const mediaInfo = new chrome.cast.media.MediaInfo(
            document.getElementById('videoPlayer').querySelector('iframe')?.src || '',
            'video/mp4'
        );
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request).then(() => {
            alert(`Casting video to ${selectedReceiver.friendlyName} via Google Cast on the same WiFi network.`);
        }).catch(error => {
            console.error('Error loading media:', error);
            alert('Failed to cast video. Please ensure your Android TV supports Google Cast and is DLNA-certified.');
        });
    }).catch(error => {
        console.error('Error requesting Cast session:', error);
        alert('Failed to start casting. Please ensure Google Cast is enabled on your Android TV and both devices are on the same WiFi.');
    });
}

function openPopupPlayer() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) {
        const popup = window.open(iframe.src, 'Video Player', 'width=800,height=450');
        popup.focus();
    }
}

function nextEpisode() {
    if (currentEpisodeIndex + 1 < currentEpisodes.length) {
        currentEpisodeIndex++;
        document.getElementById('episodeSelect').value = currentEpisodeIndex;
        changeServer();
    }
}

async function loadPopularMovies() {
    const movieGrid = document.getElementById('movieGrid');
    const tvGrid = document.getElementById('tvGrid');
    movieGrid.innerHTML = '';
    tvGrid.innerHTML = '';
    try {
        const movieResponse = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
        const tvResponse = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`);
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();
        displayResults(movieData.results, movieGrid);
        displayResults(tvData.results, tvGrid);
    } catch (error) {
        console.error('Error loading popular content:', error);
    }
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function changeTheme(theme) {
    const themes = {
        orange: { color: '#ff4500', rgb: '255, 69, 0' },
        red: { color: '#ff0000', rgb: '255, 0, 0' },
        blue: { color: '#0000ff', rgb: '0, 0, 255' },
        green: { color: '#00ff00', rgb: '0, 255, 0' },
        purple: { color: '#9370DB', rgb: '147, 112, 219' },
        yellow: { color: '#FFFF00', rgb: '255, 255, 0' },
        pink: { color: '#FFC0CB', rgb: '255, 192, 203' },
        gray: { color: '#808080', rgb: '128, 128, 128' }
    };
    const selectedTheme = themes[theme];
    document.documentElement.style.setProperty('--theme-color', selectedTheme.color);
    document.documentElement.style.setProperty('--theme-rgb', selectedTheme.rgb);
    Cookies.set('theme', theme, { expires: 365 });
    currentTheme = theme;
}

async function getRandomMovie() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${Math.floor(Math.random() * 10) + 1}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            showContentPlayer(data.results[randomIndex]);
        } else {
            alert('No movies available.');
        }
    } catch (error) {
        console.error('Error loading random movie:', error);
        alert('Failed to load a random movie.');
    }
}

async function getRandomSeries() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${Math.floor(Math.random() * 10) + 1}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            showContentPlayer(data.results[randomIndex]);
        } else {
            alert('No series available.');
        }
    } catch (error) {
        console.error('Error loading random series:', error);
        alert('Failed to load a random series.');
    }
}

function closeCastDevicePopup() {
    document.getElementById('castDevicePopup').style.display = 'none';
}

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchContent();
});

window.onload = () => {
    checkCookieConsent();
};