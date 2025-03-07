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

const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';

function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('signOutBtn').style.display = 'inline-block';
            loadRooms();
            loadAndApplyTheme(user.uid);
        } else {
            window.location.href = 'index.html';
        }
    });
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

function createRoom() {
    document.getElementById('createRoomModal').style.display = 'block';
}

function closeCreateRoomModal() {
    document.getElementById('createRoomModal').style.display = 'none';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('roomName').value = '';
    document.getElementById('roomDescription').value = '';
}

async function searchContent() {
    const searchInput = document.getElementById('roomName').value.trim();
    if (!searchInput) {
        alert('Please enter a room name or content to search.');
        return;
    }

    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchInput)}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        displaySearchResults(data.results, searchResults);
    } catch (error) {
        console.error('Error searching content:', error);
        searchResults.innerHTML = '<p>Failed to load search results.</p>';
    }
}

function displaySearchResults(results, container) {
    if (results && results.length > 0) {
        container.innerHTML = '';
        for (const item of results) {
            const resultItem = document.createElement('div');
            resultItem.className = 'movie-card';
            resultItem.innerHTML = `
                <img src="${item.poster_path ? TMDB_IMG_URL + item.poster_path : 'https://via.placeholder.com/200'}" alt="${item.title || item.name}" loading="lazy">
                <h3>${item.title || item.name}</h3>
                <p>${item.media_type === 'movie' ? 'Movie' : 'Series'} | ${item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : 'N/A'}</p>
            `;
            resultItem.onclick = () => selectContent(item.id, item.media_type || (item.release_date ? 'movie' : 'tv'));
            container.appendChild(resultItem);
        }
    } else {
        container.innerHTML = '<p>No results found.</p>';
    }
}

let selectedContent = null;

function selectContent(contentId, mediaType) {
    selectedContent = { contentId, mediaType };
    document.querySelectorAll('#searchResults .movie-card').forEach(card => {
        card.style.border = card.querySelector('h3').textContent === (selectedContent.title || selectedContent.name) ? '2px solid var(--theme-color)' : 'none';
    });
    console.log('Selected content:', selectedContent);
}

async function finalizeRoomCreation() {
    const roomName = document.getElementById('roomName').value.trim();
    const roomDescription = document.getElementById('roomDescription').value.trim();
    const user = auth.currentUser;

    if (!roomName) {
        alert('Please enter a room name.');
        return;
    }

    if (!selectedContent) {
        alert('Please select content for the room.');
        return;
    }

    try {
        const roomRef = db.ref('rooms').push();
        const roomId = roomRef.key;
        const roomData = {
            name: roomName,
            description: roomDescription || 'No description provided.',
            contentId: selectedContent.contentId,
            mediaType: selectedContent.mediaType,
            createdBy: user.uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        await roomRef.set(roomData);

        const userRoomRef = db.ref(`rooms/${roomId}/users/${user.uid}`);
        await userRoomRef.set({ joinedAt: firebase.database.ServerValue.TIMESTAMP });

        closeCreateRoomModal();
        window.location.href = `player.html?contentId=${selectedContent.contentId}&mediaType=${selectedContent.mediaType}&room=${roomId}`;
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room: ' + error.message);
    }
}

async function loadRooms() {
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '<p>Loading rooms...</p>';

    try {
        db.ref('rooms').on('value', (snapshot) => {
            const rooms = snapshot.val();
            if (rooms) {
                roomsList.innerHTML = '';
                Object.entries(rooms).forEach(([roomId, room]) => {
                    const userCount = room.users ? Object.keys(room.users).length : 0;
                    const roomCard = document.createElement('div');
                    roomCard.className = 'watch-room-card';
                    roomCard.innerHTML = `
                        <h3>${room.name}</h3>
                        <p>${room.description}</p>
                        <p>Users: ${userCount}</p>
                    `;
                    roomCard.onclick = () => joinRoom(roomId, room.contentId, room.mediaType);
                    roomsList.appendChild(roomCard);
                });
            } else {
                roomsList.innerHTML = '<p>No active watch rooms available.</p>';
            }
        });
    } catch (error) {
        console.error('Error loading rooms:', error);
        roomsList.innerHTML = '<p>Failed to load rooms.</p>';
    }
}

function joinRoom(roomId, contentId, mediaType) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to join a room.');
        return;
    }

    db.ref(`rooms/${roomId}/users/${user.uid}`).set({ joinedAt: firebase.database.ServerValue.TIMESTAMP })
        .then(() => {
            window.location.href = `player.html?contentId=${contentId}&mediaType=${mediaType}&room=${roomId}`;
        })
        .catch(error => {
            console.error('Error joining room:', error);
            alert('Failed to join room: ' + error.message);
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

window.onload = () => {
    checkAuthState();
};