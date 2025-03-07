// Firebase Configuration (for Auth and Realtime Database)
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

// Supabase Configuration (for Storage)
const supabaseUrl = 'https://dwzucqiiclqzygmalslb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enVjcWlpY2xxenlnbWFsc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDAwNjIsImV4cCI6MjA1Njc3NjA2Mn0.EKEBejFrejDo0V56AeVS21lREQ5rahFGaInzACI03XA';

let supabaseClient;
async function initializeSupabase() {
    if (typeof supabase === 'undefined') {
        console.log('Waiting for Supabase SDK to load...');
        setTimeout(initializeSupabase, 100);
        return;
    }
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken(true);
            const { data, error } = await supabaseClient.auth.setSession({ access_token: token });
            if (error) console.error('Error setting Supabase session:', error.message);
            else console.log('Supabase authenticated with Firebase token', data);
        } catch (err) {
            console.error('Error getting Firebase token:', err.message);
        }
    }
    startPlayer();
}

const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentContent = null;
let currentEpisodes = [];
let currentEpisodeIndex = 0;
let isCinemaMode = false;

function startPlayer() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('signOutBtn').style.display = 'inline-block';
        loadAndApplyTheme(user.uid);

        try {
            const token = await user.getIdToken();
            await supabaseClient.auth.setSession({ access_token: token });
            console.log('Supabase re-authenticated with Firebase token');
        } catch (err) {
            console.error('Error re-authenticating Supabase:', err.message);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const contentId = urlParams.get('contentId');
        const mediaType = urlParams.get('mediaType');
        const room = urlParams.get('room');

        console.log('Initializing player with:', { contentId, mediaType, room });

        if (contentId && mediaType) {
            await updateLibraryButton(contentId, mediaType); // Set button state first
            currentContent = { id: contentId, mediaType: mediaType };
            fetchContentDetails(contentId, mediaType);
            if (room) initializeWatchRoom(room);
        } else {
            document.getElementById('videoPlayer').innerHTML = '<p>No content selected. Please return to the homepage and select a title.</p>';
            document.getElementById('contentTitle').textContent = 'No Content Selected';
            document.getElementById('contentDescription').textContent = 'Please select a title from the homepage.';
            document.getElementById('recGrid').innerHTML = '<p>No recommendations available.</p>';
            document.getElementById('libraryButton').style.display = 'none';
        }

        document.getElementById('videoControls').style.display = 'block';
    });
}

async function fetchContentDetails(contentId, mediaType) {
    try {
        const url = `${TMDB_BASE_URL}/${mediaType}/${contentId}?api_key=${TMDB_API_KEY}&language=en-US`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        currentContent = { ...currentContent, ...data };
        document.getElementById('contentTitle').textContent = data.title || data.name || 'Unknown Title';
        document.getElementById('contentDescription').textContent = data.overview || 'No description available.';

        if (mediaType === 'tv') await loadEpisodes(contentId);
        await loadRecommendations(contentId, mediaType);
        changeServer(); // Auto-load video after fetching details
    } catch (error) {
        console.error('Error fetching content details:', error);
        document.getElementById('videoPlayer').innerHTML = `<p>Error loading content: ${error.message}</p>`;
        document.getElementById('contentTitle').textContent = 'Error Loading Title';
        document.getElementById('contentDescription').textContent = 'Failed to load description.';
        document.getElementById('recGrid').innerHTML = '<p>Failed to load recommendations.</p>';
    }
}

async function loadEpisodes(seriesId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}?api_key=${TMDB_API_KEY}&language=en-US`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        currentEpisodes = data.seasons.flatMap(season =>
            Array.from({ length: season.episode_count }, (_, i) => ({
                season: season.season_number,
                episode: i + 1
            }))
        ).filter(ep => ep.season !== 0); // Exclude season 0 (specials) if unwanted
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
        document.getElementById('episodeSelect').style.display = 'none';
    }
}

async function loadRecommendations(contentId, mediaType) {
    const recGrid = document.getElementById('recGrid');
    recGrid.innerHTML = '<p>Loading recommendations...</p>';
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/${contentId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        displayResults(data.results.slice(0, 5), recGrid);
    } catch (error) {
        console.error('Error loading recommendations:', error);
        recGrid.innerHTML = '<p>Failed to load recommendations.</p>';
    }
}

function displayResults(results, grid) {
    if (results && results.length > 0) {
        grid.innerHTML = '';
        for (const item of results) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/200'}" alt="${item.title || item.name}" loading="lazy">
                <h3>${item.title || item.name}</h3>
                <p>${item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : 'N/A'} | Rating: ${item.vote_average || 'N/A'}</p>
            `;
            movieCard.onclick = () => window.location.href = `player.html?contentId=${item.id}&mediaType=${item.media_type || (item.release_date ? 'movie' : 'tv')}`;
            grid.appendChild(movieCard);
        }
    } else {
        grid.innerHTML = '<p>No results found</p>';
    }
}

async function toggleLibrary() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to use the library feature.');
        return;
    }

    if (!currentContent || !currentContent.id || !currentContent.mediaType) {
        console.error('Invalid content data:', currentContent);
        alert('Cannot add to library: Invalid content data.');
        return;
    }

    const isSeries = currentContent.mediaType === 'tv';
    const key = isSeries ? 'series' : 'movies';

    try {
        const librarySnapshot = await db.ref(`users/${user.uid}/library`).once('value');
        let library = librarySnapshot.val() || { movies: [], series: [] };

        const contentList = library[key] || [];
        const contentIndex = contentList.findIndex(item => String(item.id) === String(currentContent.id));

        if (contentIndex === -1) {
            const contentData = {
                id: currentContent.id,
                title: currentContent.title || currentContent.name || 'Unknown Title',
                poster_path: currentContent.poster_path || null,
                media_type: currentContent.mediaType,
                date: isSeries ? (currentContent.first_air_date || null) : (currentContent.release_date || null),
                vote_average: currentContent.vote_average || null
            };
            contentList.push(contentData);
            console.log(`Added to ${key}:`, contentData);
        } else {
            contentList.splice(contentIndex, 1);
            console.log(`Removed from ${key}:`, currentContent);
        }

        library[key] = contentList;
        await db.ref(`users/${user.uid}/library`).set(library);
        await updateLibraryButton(currentContent.id, currentContent.mediaType);
    } catch (error) {
        console.error('Error updating library in Firebase:', error);
        alert('Failed to update library: ' + error.message);
    }
}

async function updateLibraryButton(contentId, mediaType) {
    const button = document.getElementById('libraryButton');
    if (!button || !contentId || !mediaType) {
        console.error('Invalid parameters for updateLibraryButton:', { contentId, mediaType });
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        button.style.display = 'none';
        return;
    }

    try {
        const librarySnapshot = await db.ref(`users/${user.uid}/library`).once('value');
        const library = librarySnapshot.val() || { movies: [], series: [] };
        const key = mediaType === 'tv' ? 'series' : 'movies';
        const contentList = library[key] || [];

        const inLibrary = contentList.some(item => String(item.id) === String(contentId));
        button.textContent = inLibrary ? 'Remove from Library' : 'Add to Library';
        button.classList.toggle('in-library', inLibrary);
        button.onclick = toggleLibrary;
        button.style.display = 'inline-block';
        console.log(`Button updated for contentId ${contentId}: ${button.textContent}`);
    } catch (error) {
        console.error('Error updating library button:', error);
        button.textContent = 'Add to Library';
        button.classList.remove('in-library');
        button.onclick = toggleLibrary;
        button.style.display = 'inline-block';
    }
}

function changeServer() {
    const server = document.getElementById('serverSelect').value;
    const videoPlayer = document.getElementById('videoPlayer');
    const contentId = currentContent.id;

    if (!server || !contentId) return;

    loadVideo(videoPlayer, server, contentId, currentEpisodeIndex, 0);
}

function changeEpisode() {
    currentEpisodeIndex = parseInt(document.getElementById('episodeSelect').value);
    changeServer();
}

function nextEpisode() {
    if (currentEpisodeIndex + 1 < currentEpisodes.length) {
        currentEpisodeIndex++;
        document.getElementById('episodeSelect').value = currentEpisodeIndex;
        changeServer();
    } else {
        alert('No more episodes available.');
    }
}

function loadVideo(videoPlayer, server, contentId, episodeIndex, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const servers = {
        vidsrcDev: `https://vidsrc.dev/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        vidsrcXyz: `https://vidsrc.xyz/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}-${currentEpisodes[episodeIndex].episode}` : ''}`,
        vidsrcCc: `https://vidsrc.cc/v2/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        embedSu: `https://embed.su/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        vidlink: `https://vidlink.pro/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        vidsrcIcu: `https://vidsrc.icu/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        autoembed: `https://autoembed.cc/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`,
        vidsrcTo: `https://vidsrc.to/embed/${currentContent.mediaType === 'tv' ? 'tv' : 'movie'}/${contentId}${currentContent.mediaType === 'tv' && episodeIndex >= 0 ? `/${currentEpisodes[episodeIndex].season}/${currentEpisodes[episodeIndex].episode}` : ''}`
    };

    const url = servers[server];
    if (!url) {
        videoPlayer.innerHTML = '<p>Please select a valid server.</p>';
        return;
    }

    videoPlayer.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen referrerPolicy="strict-origin-when-cross-origin"></iframe>`;

    // Check if iframe loads successfully
    const iframe = videoPlayer.querySelector('iframe');
    iframe.onerror = () => {
        console.error(`Failed to load iframe from ${url}, attempt ${retryCount + 1}/${maxRetries}`);
        if (retryCount < maxRetries) {
            setTimeout(() => loadVideo(videoPlayer, server, contentId, episodeIndex, retryCount + 1), retryDelay);
        } else {
            videoPlayer.innerHTML = '<p>Failed to load video after multiple attempts. Please try a different server.</p>';
        }
    };

    iframe.onload = () => {
        console.log(`Successfully loaded video from ${url}`);
    };
}

function rewindVideo() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('rewind', '*');
}

function forwardVideo() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('forward', '*');
}

function togglePlayPause() {
    const iframe = document.getElementById('videoPlayer').querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage('togglePlayPause', '*');
}

function toggleFullscreen() {
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
    } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
    } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
    }
}

function toggleCinemaMode() {
    isCinemaMode = !isCinemaMode;
    const videoPlayer = document.getElementById('videoPlayer');
    const playerContainer = document.querySelector('.player-container');
    videoPlayer.classList.toggle('cinema-mode', isCinemaMode);
    playerContainer.classList.toggle('cinema-mode', isCinemaMode);
    document.body.classList.toggle('cinema-background', isCinemaMode);
}

function captureScreenshot() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to capture screenshots.');
        return;
    }

    const videoPlayer = document.getElementById('videoPlayer');
    html2canvas(videoPlayer, {
        useCORS: true,
        scale: 2,
        logging: true,
        allowTaint: true,
        foreignObjectRendering: true
    }).then(canvas => {
        canvas.toBlob(blob => {
            const fileName = `${Date.now()}.jpeg`;
            supabaseClient.storage.from('screenshots')
                .upload(`users/${user.uid}/${fileName}`, blob, { contentType: 'image/jpeg' })
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error uploading to Supabase Storage:', error.message);
                        alert('Failed to upload screenshot: ' + error.message);
                        return;
                    }
                    const url = `${supabaseUrl}/storage/v1/object/public/screenshots/${data.path}`;
                    db.ref(`users/${user.uid}/library/screenshots`).push(url).then(() => {
                        console.log('Screenshot saved to Supabase Storage:', url);
                        alert('Screenshot saved to your library!');
                    }).catch(dbError => {
                        console.error('Error saving screenshot URL to database:', dbError.message);
                        alert('Failed to save screenshot URL: ' + dbError.message);
                    });
                });
        }, 'image/jpeg', 0.9);
    }).catch(error => {
        console.error('Error capturing screenshot:', error.message);
        alert('Failed to capture screenshot. This may be due to iframe restrictions. Try pausing the video or using a different server.');
    });
}

function initializeWatchRoom(roomId) {
    const watchTogetherPanel = document.createElement('div');
    watchTogetherPanel.className = 'watch-together-panel';
    watchTogetherPanel.innerHTML = `
        <p class="user-count">Users in room: <span id="userCount">1</span></p>
        <div class="chat-box">
            <div id="chatMessages" class="chat-messages"></div>
            <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') sendChatMessage('${roomId}')">
        </div>
        <button class="share-room-btn" onclick="shareRoom('${roomId}')">Share Room</button>
    `;
    document.querySelector('.video-player-wrapper').appendChild(watchTogetherPanel);

    db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
        const users = snapshot.val();
        const userCount = users ? Object.keys(users).length : 0;
        document.getElementById('userCount').textContent = userCount;
    });

    db.ref(`rooms/${roomId}/chat`).on('child_added', (snapshot) => {
        const message = snapshot.val();
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('p');
        messageElement.textContent = `${message.user}: ${message.text}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    const userId = auth.currentUser.uid;
    db.ref(`rooms/${roomId}/users/${userId}`).set({ joinedAt: firebase.database.ServerValue.TIMESTAMP });
    window.onunload = () => db.ref(`rooms/${roomId}/users/${userId}`).remove();
}

function sendChatMessage(roomId) {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const user = auth.currentUser.displayName || 'Anonymous';
    db.ref(`rooms/${roomId}/chat`).push({
        user: user,
        text: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    input.value = '';
}

function shareRoom(roomId) {
    const url = `${window.location.origin}/player.html?contentId=${currentContent.id}&mediaType=${currentContent.mediaType}&room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Room URL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        alert('Failed to copy URL. Please copy it manually: ' + url);
    });
}

function loadAndApplyTheme(uid) {
    db.ref(`users/${uid}/theme`).once('value', (snapshot) => {
        const theme = snapshot.val() || 'orange';
        applyTheme(theme);
    }).catch(error => {
        console.error('Error loading theme:', error);
        applyTheme('orange');
    });
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

function signOut() {
    auth.signOut()
        .then(() => {
            console.log('User signed out');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error during sign-out:', error);
        });
}

// Initialize Supabase and start the player
window.onload = () => {
    initializeSupabase();
};