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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginContainer = document.getElementById('login-container');
const loginBtn = document.getElementById('login-btn');
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.getElementById('nickname-input');
const setNicknameBtn = document.getElementById('set-nickname-btn');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const userNickname = document.getElementById('user-nickname');
const emojiBtn = document.getElementById('emoji-btn');
const gifBtn = document.getElementById('gif-btn');
const emojiPicker = document.getElementById('emoji-picker');
const gifPicker = document.getElementById('gif-picker');
const gifSearch = document.getElementById('gif-search');
const gifResults = document.getElementById('gif-results');
const charCount = document.getElementById('char-count');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Global variables
let currentUser = null;
let nickname = null;
let messagesRef = database.ref('messages');
let usersRef = database.ref('users');
let lastCleanupRef = database.ref('lastCleanup');

// Giphy API Key
const GIPHY_API_KEY = 'XsSymXYLWdGQvxVteUaNbCRBtwUWzYVf';

// Handle Authentication State
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    userEmail.textContent = user.displayName;
    usersRef.child(user.uid).once('value', (snapshot) => {
      const userRecord = snapshot.val();
      if (userRecord && userRecord.nickname) {
        nickname = userRecord.nickname;
        userNickname.textContent = nickname;
        makeNicknameEditable();
        showChatInterface();
      } else {
        nicknameForm.classList.remove('hidden');
      }
    });
  } else {
    currentUser = null;
    nickname = null;
    loginContainer.classList.remove('hidden');
    chatMessagesContainer.classList.add('hidden');
  }
});

// Login with Google
loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((error) => {
    console.error('Sign-in error:', error.message);
  });
});

// Set Nickname
setNicknameBtn.addEventListener('click', function () {
  const newNickname = nicknameInput.value.trim();
  if (newNickname && currentUser) {
    nickname = newNickname;
    usersRef.child(currentUser.uid).set({
      email: currentUser.displayName,
      nickname: nickname,
      lastActive: firebase.database.ServerValue.TIMESTAMP
    });
    userNickname.textContent = nickname;
    makeNicknameEditable();
    showChatInterface();
  }
});

// Make nickname editable
function makeNicknameEditable() {
  userNickname.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = nickname;
    input.maxLength = 20;
    input.classList.add('nickname-input');
    userNickname.innerHTML = '';
    userNickname.appendChild(input);
    input.focus();
    input.addEventListener('blur', () => {
      const newNickname = input.value.trim();
      if (newNickname && newNickname !== nickname) {
        nickname = newNickname;
        usersRef.child(currentUser.uid).update({ nickname: newNickname });
        userNickname.textContent = newNickname;
      } else {
        userNickname.textContent = nickname;
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });
}

// Show Chat Interface
function showChatInterface() {
  loginContainer.classList.add('hidden');
  chatMessagesContainer.classList.remove('hidden');
  loadMessages();
  checkForCleanup();
}

// Load Messages
function loadMessages() {
  messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
    const message = snapshot.val();
    displayMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Display a Message
function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  if (currentUser && message.userId === currentUser.uid) {
    messageElement.classList.add('message-self');
  } else {
    messageElement.classList.add('message-other');
  }
  const messageInfo = document.createElement('div');
  messageInfo.classList.add('message-info');
  const emailSpan = document.createElement('span');
  emailSpan.classList.add('message-email');
  emailSpan.textContent = message.email;
  const nicknameSpan = document.createElement('span');
  nicknameSpan.classList.add('message-nickname');
  nicknameSpan.textContent = ' - ' + message.nickname;
  messageInfo.appendChild(emailSpan);
  messageInfo.appendChild(nicknameSpan);
  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  const processedContent = processMessageContent(message.content);
  messageContent.innerHTML = processedContent;
  messageElement.appendChild(messageInfo);
  messageElement.appendChild(messageContent);
  chatMessages.appendChild(messageElement);
}

// Process Message Content
function processMessageContent(content) {
  // Check if the content is already an HTML tag (e.g., <img>)
  const htmlTagRegex = /^<.*>$/;
  if (htmlTagRegex.test(content.trim())) {
    return content; // Return the content as-is if it's already HTML
  }

  // Otherwise, process the content for URLs
  // Regular expression to match Giphy GIF links
  const giphyRegex = /https?:\/\/giphy\.com\/gifs\/[^\s]+/g;
  // Replace Giphy links with img tags
  let processedContent = content.replace(giphyRegex, (url) => {
    const gifId = url.split('-').pop();
    const gifUrl = `https://media.giphy.com/media/${gifId}/giphy.gif`;
    return `<img src="${gifUrl}" alt="GIF">`;
  });
  // Handle other links (videos, images, etc.), but only if not already processed as Giphy
  processedContent = processedContent.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    if (giphyRegex.test(url)) {
      // Skip if it's a Giphy link (already handled)
      return url;
    } else if (isVideoUrl(url)) {
      return `<a href="${url}" target="_blank">${url}</a><div class="video-embed">${getVideoEmbed(url)}</div>`;
    } else if (isImageUrl(url)) {
      return `<img src="${url}" alt="Shared image">`;
    } else {
      return `<a href="${url}" target="_blank">${url}</a>`;
    }
  });
  return processedContent;
}

// Video and Image URL Checks
function isVideoUrl(url) {
  return url.match(/youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|dailymotion\.com\/video\//);
}
function isImageUrl(url) {
  // Split the URL at '?' to ignore query parameters and check the path
  const path = url.split('?')[0];
  return path.match(/\.(jpeg|jpg|gif|png)$/);
}
function getVideoEmbed(url) {
  let videoId = '';
  if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return `<iframe width="100%" height="180" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  } else if (url.includes('vimeo.com/')) {
    videoId = url.split('vimeo.com/')[1];
    return `<iframe width="100%" height="180" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }
  return `<a href="${url}" target="_blank">${url}</a>`;
}

// Send Message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
function sendMessage() {
  const content = messageInput.value.trim();
  if (content && currentUser && nickname) {
    const newMessage = {
      userId: currentUser.uid,
      email: currentUser.displayName,
      nickname: nickname,
      content: content,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    messagesRef.push(newMessage);
    messageInput.value = '';
    charCount.textContent = '0';
  }
}

// Character Counter
messageInput.addEventListener('input', () => {
  charCount.textContent = messageInput.value.length;
});

// Emoji Picker
let emojiPickerInitialized = false;
emojiBtn.addEventListener('click', () => {
  gifPicker.classList.add('hidden');
  emojiPicker.classList.toggle('hidden');
  if (!emojiPickerInitialized) {
    initEmojiPicker();
    emojiPickerInitialized = true;
  }
});
function initEmojiPicker() {
  const picker = document.createElement('emoji-picker');
  emojiPicker.appendChild(picker);
  picker.addEventListener('emoji-click', (event) => {
    messageInput.value += event.detail.unicode;
    charCount.textContent = messageInput.value.length;
  });
}

// GIF Picker
gifBtn.addEventListener('click', () => {
  emojiPicker.classList.add('hidden');
  gifPicker.classList.toggle('hidden');
});

gifSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchGifs(gifSearch.value.trim());
  }
});

async function searchGifs(query) {
  if (!query) return;
  gifResults.innerHTML = '<div class="gif-loading">Loading...</div>';
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=15&rating=g`
    );
    const data = await response.json();
    gifResults.innerHTML = '';
    if (data.data.length === 0) {
      gifResults.innerHTML = '<div class="gif-loading">No GIFs found</div>';
    } else {
      data.data.forEach((gif) => {
        const img = document.createElement('img');
        img.src = gif.images.fixed_height_small.url; // Preview size
        img.dataset.originalUrl = gif.images.original.url; // Full size
        img.addEventListener('click', () => {
          // Send the GIF as an embedded image directly
          if (currentUser && nickname) {
            const newMessage = {
              userId: currentUser.uid,
              email: currentUser.displayName,
              nickname: nickname,
              content: `<img src="${img.dataset.originalUrl}" alt="GIF">`,
              timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            messagesRef.push(newMessage);
            gifPicker.classList.add('hidden');
          }
        });
        gifResults.appendChild(img);
      });
    }
  } catch (error) {
    console.error('Error searching GIFs:', error);
    gifResults.innerHTML = '<div class="gif-loading">Error loading GIFs</div>';
  }
}

// Weekly Cleanup
function checkForCleanup() {
  lastCleanupRef.once('value', (snapshot) => {
    const lastCleanup = snapshot.val();
    const now = Date.now();
    if (!lastCleanup || now - lastCleanup > 7 * 24 * 60 * 60 * 1000) {
      messagesRef.remove()
        .then(() => {
          lastCleanupRef.set(now);
          console.log('Chat history cleared (weekly cleanup)');
          chatMessages.innerHTML = '';
        })
        .catch((error) => {
          console.error('Cleanup failed:', error);
        });
    }
  });
}

// Sign-Out
document.getElementById('sign-out-btn').addEventListener('click', () => {
  auth.signOut().catch((error) => {
    console.error('Sign-out error:', error.message);
  });
});

// Dark mode toggle
if (localStorage.getItem('dark-mode') === 'true') {
  document.body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
});

// Close pickers when clicking outside
document.addEventListener('click', (event) => {
  if (!emojiPicker.contains(event.target) && !emojiBtn.contains(event.target)) {
    emojiPicker.classList.add('hidden');
  }
  if (!gifPicker.contains(event.target) && !gifBtn.contains(event.target)) {
    gifPicker.classList.add('hidden');
  }
});
