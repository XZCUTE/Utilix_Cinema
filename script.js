// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAFODTsHwTCpthvJjzs6GQjDBish6r3oQs",
    authDomain: "utilixcinema.firebaseapp.com",
    databaseURL: "https://utilixcinema-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "utilixcinema",
    storageBucket: "utilixcinema.appspot.com",
    messagingSenderId: "851957022660",
    appId: "1:851957022660:web:395e193451af05b401ae91",
    measurementId: "G-T5G9KEN7ZE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Supabase Configuration
const supabaseUrl = 'https://dwzucqiiclqzygmalslb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enVjcWlpY2xxenlnbWFsc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDAwNjIsImV4cCI6MjA1Njc3NjA2Mn0.EKEBejFrejDo0V56AeVS21lREQ5rahFGaInzACI03XA';
let supabaseClient = null;

async function initializeSupabase(maxRetries = 5, delay = 500) {
    let retries = 0;
    while (retries < maxRetries) {
        if (typeof supabase !== 'undefined') {
            try {
                supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
                const user = auth.currentUser;
                if (user) {
                    const token = await user.getIdToken(true);
                    const { data, error } = await supabaseClient.auth.setSession({ access_token: token });
                    if (error) console.error('Error setting Supabase session:', error.message);
                }
                return true;
            } catch (err) {
                console.error('Error initializing Supabase:', err.message);
                return false;
            }
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
    }
    console.error('Failed to load Supabase SDK after maximum retries.');
    return false;
}

const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentMode = 'movie';
let clickCount = {};
let currentScreenshots = [];

let moviePage = 1;
let movieTotalPages = 1;
let tvPage = 1;
let tvTotalPages = 1;
let isLoadingMovies = false;
let isLoadingTV = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.id === 'movieSentinel' && !isLoadingMovies) loadMoreMovies();
            else if (entry.target.id === 'tvSentinel' && !isLoadingTV) loadMoreTVShows();
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.1 });

function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        const loginPrompt = document.getElementById('loginPrompt');
        if (user) {
            if (loginPrompt) loginPrompt.remove();
            document.getElementById('signOutBtn').style.display = 'inline-block';
            showWelcomeMessage(user.displayName || 'Guest');
            loadAndApplyTheme(user.uid);
            loadAllContent();
            loadLibrary();
            checkRoomLink();
            switchModeFromUrl();
            initializeSupabase();
        } else {
            if (!loginPrompt) showLoginPrompt();
        }
    });
}

function showLoginPrompt() {
    const loginPrompt = document.createElement('div');
    loginPrompt.id = 'loginPrompt';
    loginPrompt.className = 'name-prompt';
    loginPrompt.innerHTML = `
        <h2>Please Sign In</h2>
        <button id="googleSignInBtn" aria-label="Sign in with Google">Sign in with Google</button>
        <button id="emailPassSignInBtn" aria-label="Sign in with Email/Password">Sign in with Email/Password</button>
        <button id="emailLinkSignInBtn" aria-label="Sign in with Email Link">Sign in with Email Link</button>
        <button id="qrSignInBtn" aria-label="Sign in with QR">Sign in with QR</button>
        <button id="phoneSignInBtn" aria-label="Sign in with Phone">Sign in with Phone</button>
        <button id="guestSignInBtn" aria-label="Sign in as Guest">Sign in as Guest</button>
    `;
    document.body.appendChild(loginPrompt);

    document.getElementById('googleSignInBtn').addEventListener('click', signInWithGoogle);
    document.getElementById('emailPassSignInBtn').addEventListener('click', showEmailPassSignInForm);
    document.getElementById('emailLinkSignInBtn').addEventListener('click', showEmailLinkSignInForm);
    document.getElementById('qrSignInBtn').addEventListener('click', showQRSignIn);
    document.getElementById('phoneSignInBtn').addEventListener('click', showPhoneSignInForm);
    document.getElementById('guestSignInBtn').addEventListener('click', signInAsGuest);
}

function showEmailPassSignInForm() {
    const loginPrompt = document.getElementById('loginPrompt');
    loginPrompt.innerHTML = `
        <h2>Sign In with Email/Password</h2>
        <input type="email" id="emailInput" placeholder="Email" aria-label="Email">
        <input type="password" id="passwordInput" placeholder="Password" aria-label="Password">
        <button id="emailPassSignIn" aria-label="Sign In">Sign In</button>
        <p id="errorMessage" style="color: red; display: none;"></p>
        <button id="backBtn" aria-label="Back">Back</button>
    `;
    document.getElementById('emailPassSignIn').addEventListener('click', signInWithEmailPassword);
    document.getElementById('backBtn').addEventListener('click', () => window.location.reload());
}

function showEmailLinkSignInForm() {
    const loginPrompt = document.getElementById('loginPrompt');
    loginPrompt.innerHTML = `
        <h2>Sign In with Email Link</h2>
        <input type="email" id="emailInput" placeholder="Email" aria-label="Email">
        <button id="sendLinkBtn" aria-label="Send Sign-In Link">Send Sign-In Link</button>
        <p id="message" style="color: green; display: none;"></p>
        <p id="errorMessage" style="color: red; display: none;"></p>
        <button id="backBtn" aria-label="Back">Back</button>
    `;
    document.getElementById('sendLinkBtn').addEventListener('click', sendSignInLink);
    document.getElementById('backBtn').addEventListener('click', () => window.location.reload());
}

function showQRSignIn() {
    const loginPrompt = document.getElementById('loginPrompt');
    loginPrompt.innerHTML = `
        <h2>Sign In with QR</h2>
        <p>Scan this QR code with your phone to sign in with Google</p>
        <canvas id="qrcode" style="margin: 10px auto; display: block;"></canvas>
        <p id="message" style="color: green; display: none;">Waiting for QR scan...</p>
        <p id="errorMessage" style="color: red; display: none;"></p>
        <button id="backBtn" aria-label="Back">Back</button>
    `;

    // Generate a unique session ID
    const sessionId = db.ref('qrSessions').push().key;
    const qrUrl = `https://utilix-cinema.pages.dev/signin?method=qr&sessionId=${sessionId}`;

    // Load QRCode library and generate QR code
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
    script.onload = () => {
        QRCode.toCanvas(document.getElementById('qrcode'), qrUrl, { width: 200 }, (error) => {
            if (error) {
                console.error('Error generating QR code:', error);
                document.getElementById('errorMessage').textContent = 'Failed to generate QR code.';
                document.getElementById('errorMessage').style.display = 'block';
            } else {
                document.getElementById('message').textContent = 'Waiting for QR scan...';
                document.getElementById('message').style.display = 'block';
                listenForQRSignIn(sessionId);
            }
        });
    };
    script.onerror = () => {
        document.getElementById('errorMessage').textContent = 'Failed to load QR code library.';
        document.getElementById('errorMessage').style.display = 'block';
    };
    document.body.appendChild(script);

    document.getElementById('backBtn').addEventListener('click', () => {
        db.ref(`qrSessions/${sessionId}`).remove(); // Clean up session
        window.location.reload();
    });
}

function listenForQRSignIn(sessionId) {
    const sessionRef = db.ref(`qrSessions/${sessionId}`);
    sessionRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.authenticated) {
            auth.signInWithPopup(googleProvider)
                .then(() => {
                    sessionRef.remove(); // Clean up after successful sign-in
                    document.getElementById('loginPrompt').remove();
                    initializeSupabase();
                })
                .catch((error) => {
                    document.getElementById('errorMessage').textContent = 'Sign-in failed: ' + error.message;
                    document.getElementById('errorMessage').style.display = 'block';
                });
        }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
        sessionRef.off();
        if (document.getElementById('loginPrompt')) {
            document.getElementById('errorMessage').textContent = 'QR code expired. Please try again.';
            document.getElementById('errorMessage').style.display = 'block';
        }
    }, 5 * 60 * 1000);
}

function showPhoneSignInForm() {
    const loginPrompt = document.getElementById('loginPrompt');
    loginPrompt.innerHTML = `
        <h2>Sign In with Phone</h2>
        <input type="tel" id="phoneInput" placeholder="+1234567890" aria-label="Phone Number">
        <div id="recaptcha-container"></div>
        <button id="sendPhoneCodeBtn" aria-label="Send Verification Code">Send Code</button>
        <input type="text" id="verificationCode" placeholder="Enter Code" aria-label="Verification Code" style="display: none;">
        <button id="verifyCodeBtn" aria-label="Verify Code" style="display: none;">Verify</button>
        <p id="message" style="color: green; display: none;"></p>
        <p id="errorMessage" style="color: red; display: none;"></p>
        <button id="backBtn" aria-label="Back">Back</button>
    `;
    document.getElementById('sendPhoneCodeBtn').addEventListener('click', sendPhoneVerificationCode);
    document.getElementById('verifyCodeBtn').addEventListener('click', verifyPhoneCode);
    document.getElementById('backBtn').addEventListener('click', () => window.location.reload());

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': () => document.getElementById('sendPhoneCodeBtn').disabled = false
    });
    recaptchaVerifier.render();
}

function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then(() => {
            document.getElementById('loginPrompt').remove();
            initializeSupabase();
        })
        .catch((error) => {
            alert('Failed to sign in: ' + error.message);
        });
}

function signInWithEmailPassword() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!email || !password) {
        errorMessage.textContent = 'Please enter email and password.';
        errorMessage.style.display = 'block';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('loginPrompt').remove();
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
}

function sendSignInLink() {
    const email = document.getElementById('emailInput').value;
    const message = document.getElementById('message');
    const errorMessage = document.getElementById('errorMessage');

    if (!email) {
        errorMessage.textContent = 'Please enter your email.';
        errorMessage.style.display = 'block';
        return;
    }

    const actionCodeSettings = {
        url: 'https://utilix-cinema.pages.dev/finishSignUp',
        handleCodeInApp: true,
    };

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            message.textContent = 'Sign-in link sent to your email. Check your inbox!';
            message.style.display = 'block';
            errorMessage.style.display = 'none';
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            message.style.display = 'none';
        });
}

function handleEmailLinkSignIn() {
    if (auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) email = prompt('Please provide your email for confirmation');

        auth.signInWithEmailLink(email, window.location.href)
            .then(() => {
                window.localStorage.removeItem('emailForSignIn');
                document.getElementById('loginPrompt').remove();
            })
            .catch((error) => {
                alert('Failed to sign in: ' + error.message);
            });
    }
}

function sendPhoneVerificationCode() {
    const phoneNumber = document.getElementById('phoneInput').value;
    const message = document.getElementById('message');
    const errorMessage = document.getElementById('errorMessage');

    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            message.textContent = 'Verification code sent to your phone.';
            message.style.display = 'block';
            errorMessage.style.display = 'none';
            document.getElementById('verificationCode').style.display = 'block';
            document.getElementById('verifyCodeBtn').style.display = 'block';
            document.getElementById('sendPhoneCodeBtn').style.display = 'none';
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            message.style.display = 'none';
        });
}

function verifyPhoneCode() {
    const code = document.getElementById('verificationCode').value;
    const errorMessage = document.getElementById('errorMessage');

    window.confirmationResult.confirm(code)
        .then(() => {
            document.getElementById('loginPrompt').remove();
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
}

function signInAsGuest() {
    auth.signInAnonymously()
        .then(() => {
            document.getElementById('loginPrompt').remove();
        })
        .catch((error) => {
            alert('Failed to sign in as guest: ' + error.message);
        });
}

function signOut() {
    auth.signOut()
        .then(() => {
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error during sign-out:', error);
        });
}

function checkRoomLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    if (room) {
        db.ref(`rooms/${room}`).once('value', (snapshot) => {
            const roomData = snapshot.val();
            if (roomData) {
                window.location.href = `player.html?contentId=${roomData.contentId}&mediaType=${roomData.mediaType}&room=${room}`;
            }
        });
    }
}

function loadAllContent() {
    if (currentMode === 'movie') {
        loadMoreMovies();
        loadMoreTVShows();
    } else if (currentMode === 'anime') {
        loadAllAnimeSections();
    } else if (currentMode === 'library') {
        loadLibrary();
    }
}

function showWelcomeMessage(name) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.innerHTML = `Hi, ${name}!<br><span style="color: #808080; font-size: 0.9rem;">Welcome to UTILIX CINEMA</span>`;
    welcomeMessage.style.display = 'block';
    setTimeout(() => welcomeMessage.style.display = 'none', 2000);
}

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
        moviePage = 1;
        tvPage = 1;
        movieTotalPages = 1;
        tvTotalPages = 1;
        loadMoreMovies();
        loadMoreTVShows();
    } else if (mode === 'anime') {
        loadAllAnimeSections();
    } else if (mode === 'library') {
        loadLibrary();
    }
}

function switchModeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode && ['movie', 'anime', 'library'].includes(mode)) switchMode(mode);
}

function toggleSettings() {
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
}

function toggleCategories() {
    const categoriesPopup = document.getElementById('categoriesPopup');
    categoriesPopup.style.display = categoriesPopup.style.display === 'block' ? 'none' : 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function closeCategories() {
    document.getElementById('categoriesPopup').style.display = 'none';
}

function loadCategoryAndClose(genre) {
    loadCategory(genre);
    closeCategories();
}

async function searchContent() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    if (!searchInput) return;

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
            movieGrid.innerHTML = '<p>Error searching movies.</p>';
            tvGrid.innerHTML = '<p>Error searching TV shows.</p>';
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
            document.getElementById('animeMovieGrid').innerHTML = '<p>Error searching anime movies.</p>';
            document.getElementById('animeSeriesGrid').innerHTML = '<p>Error searching anime series.</p>';
        }
    } else if (currentMode === 'library') {
        const user = auth.currentUser;
        if (!user) return;

        const movieGrid = document.getElementById('libraryMovieGrid');
        const seriesGrid = document.getElementById('librarySeriesGrid');
        const imageThumbnails = document.getElementById('imageThumbnails');
        movieGrid.innerHTML = '<p>Searching movies...</p>';
        seriesGrid.innerHTML = '<p>Searching series...</p>';
        imageThumbnails.innerHTML = '<p>Searching screenshots...</p>';

        try {
            const librarySnapshot = await db.ref(`users/${user.uid}/library`).once('value');
            const library = librarySnapshot.val() || { movies: [], series: [], screenshots: [] };

            const filteredMovies = (library.movies || []).filter(movie => movie.title.toLowerCase().includes(searchInput));
            const filteredSeries = (library.series || []).filter(series => series.title.toLowerCase().includes(searchInput));
            const filteredScreenshots = Object.values(library.screenshots || {}).filter(src => src.toLowerCase().includes(searchInput));

            displayResults(filteredMovies, movieGrid);
            displayResults(filteredSeries, seriesGrid);

            if (filteredScreenshots.length > 0) {
                imageThumbnails.innerHTML = '';
                currentScreenshots = filteredScreenshots;
                currentScreenshots.forEach((src, index) => {
                    const thumbnail = document.createElement('div');
                    thumbnail.className = 'thumbnail';
                    thumbnail.innerHTML = `<img src="${src}" alt="Screenshot ${index + 1}" loading="lazy">`;
                    thumbnail.onclick = () => handleThumbnailClick(src, thumbnail);
                    imageThumbnails.appendChild(thumbnail);
                });
            } else {
                imageThumbnails.innerHTML = '<p>No matching screenshots found.</p>';
            }
        } catch (error) {
            console.error('Error searching library:', error);
            movieGrid.innerHTML = '<p>Error searching movies.</p>';
            seriesGrid.innerHTML = '<p>Error searching series.</p>';
            imageThumbnails.innerHTML = '<p>Error searching screenshots.</p>';
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
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/50x75'}" alt="${item.title || item.name}" loading="lazy">
                <span>${item.title || item.name} (${item.media_type})</span>
            `;
            suggestion.onclick = () => {
                document.getElementById('searchInput').value = item.title || item.name;
                suggestions.style.display = 'none';
                window.location.href = `player.html?contentId=${item.id}&mediaType=${item.media_type}`;
            };
            suggestions.appendChild(suggestion);
        });
        suggestions.style.display = 'block';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    const suggestions = document.getElementById('suggestions');
    if (!searchContainer.contains(e.target)) suggestions.style.display = 'none';
});

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

function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<p>Loading more content...</p>';
    return loadingDiv;
}

function removeLoadingIndicator(grid) {
    const loadingIndicator = grid.querySelector('.loading-indicator');
    if (loadingIndicator) loadingIndicator.remove();
}

function displayResults(results, grid, append = false) {
    if (!append) grid.innerHTML = '';
    if (results && results.length > 0) {
        for (const item of results) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/200'}" alt="${item.title || item.name}" loading="lazy">
                <h3>${item.title || item.name}</h3>
                <p>${item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : 'N/A'} | Rating: ${item.vote_average || 'N/A'}</p>
            `;
            movieCard.onclick = () => {
                const mediaType = item.media_type || (item.release_date ? 'movie' : 'tv');
                window.location.href = `player.html?contentId=${item.id}&mediaType=${mediaType}`;
            };
            grid.appendChild(movieCard);
        }
    } else {
        grid.innerHTML += '<p>No more results found</p>';
    }
}

async function loadMoreMovies() {
    if (isLoadingMovies || moviePage > movieTotalPages) return;
    isLoadingMovies = true;
    const movieGrid = document.getElementById('movieGrid');
    const existingSentinel = document.getElementById('movieSentinel');
    if (existingSentinel) {
        observer.unobserve(existingSentinel);
        existingSentinel.remove();
    }
    const loadingIndicator = createLoadingIndicator();
    movieGrid.appendChild(loadingIndicator);
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${moviePage}`);
        const data = await response.json();
        movieTotalPages = data.total_pages;
        displayResults(data.results, movieGrid, true);
        if (moviePage < movieTotalPages) {
            const sentinel = document.createElement('div');
            sentinel.id = 'movieSentinel';
            movieGrid.appendChild(sentinel);
            observer.observe(sentinel);
        } else {
            movieGrid.appendChild(document.createElement('p')).innerText = 'No more movies to load.';
        }
        moviePage++;
    } catch (error) {
        console.error('Error loading more movies:', error);
        movieGrid.appendChild(document.createElement('p')).innerText = 'Failed to load more movies.';
    } finally {
        removeLoadingIndicator(movieGrid);
        isLoadingMovies = false;
    }
}

async function loadMoreTVShows() {
    if (isLoadingTV || tvPage > tvTotalPages) return;
    isLoadingTV = true;
    const tvGrid = document.getElementById('tvGrid');
    const existingSentinel = document.getElementById('tvSentinel');
    if (existingSentinel) {
        observer.unobserve(existingSentinel);
        existingSentinel.remove();
    }
    const loadingIndicator = createLoadingIndicator();
    tvGrid.appendChild(loadingIndicator);
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${tvPage}`);
        const data = await response.json();
        tvTotalPages = data.total_pages;
        displayResults(data.results, tvGrid, true);
        if (tvPage < tvTotalPages) {
            const sentinel = document.createElement('div');
            sentinel.id = 'tvSentinel';
            tvGrid.appendChild(sentinel);
            observer.observe(sentinel);
        } else {
            tvGrid.appendChild(document.createElement('p')).innerText = 'No more TV shows to load.';
        }
        tvPage++;
    } catch (error) {
        console.error('Error loading more TV shows:', error);
        tvGrid.appendChild(document.createElement('p')).innerText = 'Failed to load more TV shows.';
    } finally {
        removeLoadingIndicator(tvGrid);
        isLoadingTV = false;
    }
}

async function loadLibrary() {
    const user = auth.currentUser;
    if (!user) return;

    const movieGrid = document.getElementById('libraryMovieGrid');
    const seriesGrid = document.getElementById('librarySeriesGrid');
    const imageThumbnails = document.getElementById('imageThumbnails');
    movieGrid.innerHTML = '<p>Loading movies...</p>';
    seriesGrid.innerHTML = '<p>Loading series...</p>';
    imageThumbnails.innerHTML = '<p>Loading screenshots...</p>';

    try {
        const librarySnapshot = await db.ref(`users/${user.uid}/library`).once('value');
        const library = librarySnapshot.val() || { movies: [], series: [], screenshots: [] };

        if (library.movies && library.movies.length > 0) displayResults(library.movies, movieGrid);
        else movieGrid.innerHTML = '<p>No movies in library.</p>';

        if (library.series && library.series.length > 0) displayResults(library.series, seriesGrid);
        else seriesGrid.innerHTML = '<p>No series in library.</p>';

        if (library.screenshots && Object.keys(library.screenshots).length > 0) {
            imageThumbnails.innerHTML = '';
            currentScreenshots = Object.values(library.screenshots);
            currentScreenshots.forEach((src, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';
                thumbnail.innerHTML = `<img src="${src}" alt="Screenshot ${index + 1}" loading="lazy">`;
                thumbnail.onclick = () => handleThumbnailClick(src, thumbnail);
                imageThumbnails.appendChild(thumbnail);
            });
        } else {
            imageThumbnails.innerHTML = '<p>No screenshots available.</p>';
        }
    } catch (error) {
        console.error('Error loading library:', error);
        movieGrid.innerHTML = '<p>Error loading movies.</p>';
        seriesGrid.innerHTML = '<p>Error loading series.</p>';
        imageThumbnails.innerHTML = '<p>Error loading screenshots.</p>';
    }
}

async function deleteScreenshot(src) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to delete screenshots.');
        return;
    }

    if (!supabaseClient && !await initializeSupabase()) {
        alert('Failed to initialize storage. Please refresh and try again.');
        return;
    }

    try {
        const filePath = src.split('/screenshots/')[1];
        if (!filePath) throw new Error('Invalid file path: ' + src);
        const { error: storageError } = await supabaseClient.storage.from('screenshots').remove([filePath]);
        if (storageError) throw storageError;

        const screenshotsRef = db.ref(`users/${user.uid}/library/screenshots`);
        const snapshot = await screenshotsRef.once('value');
        const screenshots = snapshot.val() || {};
        const keyToDelete = Object.keys(screenshots).find(key => screenshots[key] === src);

        if (keyToDelete) await screenshotsRef.child(keyToDelete).remove();
        closeImageViewer();
        loadLibrary();
        alert('Screenshot deleted successfully!');
    } catch (error) {
        console.error('Error deleting screenshot:', error);
        alert('Failed to delete screenshot: ' + error.message);
    }
}

function handleThumbnailClick(src, thumbnail) {
    const key = src;
    clickCount[key] = (clickCount[key] || 0) + 1;
    if (clickCount[key] === 1) showImageViewer(src);
}

function showImageViewer(src) {
    const currentImageIndex = currentScreenshots.indexOf(src);
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = src;
    viewerImage.className = 'viewer-image';
    document.getElementById('viewSizeSelect').value = 'normal';

    const modalContent = document.querySelector('#imageViewerModal .modal-content');
    let deleteBtn = document.getElementById('deleteScreenshotBtn');
    if (!deleteBtn) {
        deleteBtn = document.createElement('button');
        deleteBtn.id = 'deleteScreenshotBtn';
        deleteBtn.textContent = 'Delete Screenshot';
        deleteBtn.style.marginTop = '10px';
        deleteBtn.style.backgroundColor = '#ff4444';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.borderRadius = '5px';
        modalContent.appendChild(deleteBtn);
    }
    deleteBtn.onclick = () => deleteScreenshot(src);

    document.getElementById('imageViewerModal').style.display = 'block';
}

function closeImageViewer() {
    document.getElementById('imageViewerModal').style.display = 'none';
    Object.keys(clickCount).forEach(key => clickCount[key] = 0);
}

function changeViewSize() {
    const size = document.getElementById('viewSizeSelect').value;
    document.getElementById('viewerImage').className = `viewer-image ${size}`;
}

function prevImage() {
    const currentImageIndex = currentScreenshots.indexOf(document.getElementById('viewerImage').src);
    const newIndex = (currentImageIndex - 1 + currentScreenshots.length) % currentScreenshots.length;
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = currentScreenshots[newIndex];
    document.getElementById('viewSizeSelect').value = 'normal';
    viewerImage.className = 'viewer-image';
    document.getElementById('deleteScreenshotBtn').onclick = () => deleteScreenshot(currentScreenshots[newIndex]);
}

function nextImage() {
    const currentImageIndex = currentScreenshots.indexOf(document.getElementById('viewerImage').src);
    const newIndex = (currentImageIndex + 1) % currentScreenshots.length;
    const viewerImage = document.getElementById('viewerImage');
    viewerImage.src = currentScreenshots[newIndex];
    document.getElementById('viewSizeSelect').value = 'normal';
    viewerImage.className = 'viewer-image';
    document.getElementById('deleteScreenshotBtn').onclick = () => deleteScreenshot(currentScreenshots[newIndex]);
}

function changeTheme(theme) {
    const user = auth.currentUser;
    if (!user) return;

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
    const selectedTheme = themes[theme] || themes['orange'];
    document.documentElement.style.setProperty('--theme-color', selectedTheme.color);
    document.documentElement.style.setProperty('--theme-rgb', selectedTheme.rgb);

    db.ref(`users/${user.uid}`).update({ theme }).catch(error => console.error('Error saving theme:', error));
}

function applyTheme(theme) {
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
    const selectedTheme = themes[theme] || themes['orange'];
    document.documentElement.style.setProperty('--theme-color', selectedTheme.color);
    document.documentElement.style.setProperty('--theme-rgb', selectedTheme.rgb);
}

function loadAndApplyTheme(uid) {
    db.ref(`users/${uid}/theme`).once('value', (snapshot) => {
        const theme = snapshot.val() || 'orange';
        applyTheme(theme);
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = theme;
    }).catch(() => applyTheme('orange'));
}

async function getRandomMovie() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${Math.floor(Math.random() * 10) + 1}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            window.location.href = `player.html?contentId=${data.results[randomIndex].id}&mediaType=movie`;
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
            window.location.href = `player.html?contentId=${data.results[randomIndex].id}&mediaType=tv`;
        } else {
            alert('No series available.');
        }
    } catch (error) {
        console.error('Error loading random series:', error);
        alert('Failed to load a random series.');
    }
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchContent();
});

window.onload = () => {
    initializeSupabase();
    checkAuthState();
    handleEmailLinkSignIn();
};