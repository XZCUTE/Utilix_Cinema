# Utilix Cinema - Setup Guide

Welcome to Utilix Cinema! This comprehensive guide will walk you through setting up the website, configuring all APIs, and understanding the video source integration.

## Table of Contents

1. [Project Overview](#project-overview)
2. [API Configuration](#api-configuration)
   - [Firebase Setup](#firebase-setup)
   - [TMDB API Setup](#tmdb-api-setup)
3. [Video Source Integration](#video-source-integration)
4. [Authentication Methods](#authentication-methods)
5. [Feature Implementation](#feature-implementation)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [ORIGINAL CONTENTS NO FORMAT HUMAN REQUEST TO DO](#original-contents-no-format-human-request-to-do)

## Project Overview

Utilix Cinema is a modern, feature-rich streaming platform that allows users to browse, search, and watch movies and TV shows. Key features include:

- User authentication with multiple methods (Google, Email/Password, Phone, QR code)
- Movie and TV show browsing with categories
- Search functionality
- Video player with multiple server options
- Screenshot capture
- Watch Room for shared viewing experiences
- Chat functionality
- Personal library to save favorite content
- Theme customization



## API Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (with methods for Google, Email/Password, Phone, and Email link)
   - Realtime Database

3. Get your Firebase config:
   ```javascript
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
   ```

   ```

### TMDB API Setup

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Request an API key from your account settings

   ```javascript
   const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
   const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
   ```

## Video Source Integration

The video player supports multiple servers for content delivery. The server URLs are hardcoded The function assembles the video URL based on:

1. Selected server
2. Content ID
3. Episode information (for TV shows)

```javascript
// Example of how video URLs are constructed
function loadVideo(videoPlayer, server, contentId, episodeIndex = null) {
    // Determine video URL based on server and content type
    let videoUrl;
    
    if (server === 'server1') {
        videoUrl = `https://server1.example.com/video/${contentId}`;
    } else if (server === 'server2') {
        videoUrl = `https://server2.example.com/stream/${contentId}`;
    }
    
    // Add episode parameters for TV shows
    if (episodeIndex !== null && currentEpisodes && currentEpisodes[episodeIndex]) {
        videoUrl += `/season/${currentEpisodes[episodeIndex].season}/episode/${currentEpisodes[episodeIndex].episode}`;
    }
    
    // Load the video
    videoPlayer.src = videoUrl;
    videoPlayer.load();
    videoPlayer.play();
}
```



## Authentication Methods

Utilix Cinema supports multiple authentication methods:

1. **Google Sign-In**: Uses Firebase Google auth provider
2. **Email/Password**: Standard Firebase email and password auth
3. **Email Link**: Passwordless sign-in with magic links
4. **QR Code**: QR-based authentication using Firebase Realtime Database
5. **Phone**: SMS verification through Firebase Phone auth
6. **Guest**: Anonymous authentication

Implementation details can be found in the authentication functions in `script.js`.

## Feature Implementation

### Watch Room

The Watch Room feature allows multiple users to watch content together:

1. A room creator initiates a room with specific content
2. The creator can share a unique room link
3. Users joining the room automatically sync to the same content
4. Chat messages are saved in the Firebase Realtime Database

To implement:
- Review `initializeWatchRoom` function
- Set up room synchronization in Firebase Realtime Database

### Theme Customization

Users can customize the website's color theme:

1. Theme selection is available in the settings menu
2. Themes are saved to the user's Firebase profile
3. Themes are applied across all pages

Implementation is in the `changeTheme` and `applyTheme` functions.

## Deployment

To deploy Utilix Cinema:

1. **Local Testing**:
   - Open `index.html` in a web browser
   - Test all functionality

2. **Web Hosting**:
   - Upload all files to a web hosting service
   - Configure Firebase and Supabase for production
   - Update API endpoints if necessary

3. **Recommended Hosting Options**:
   - Firebase Hosting
   - Vercel
   - Netlify
   - GitHub Pages

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify Firebase configuration
   - Ensure authentication methods are enabled in Firebase console

2. **Video Playback Issues**:
   - Check that video source URLs are correct
   - Verify CORS settings on video sources
   - Test different servers

3. **API Errors**:
   - Validate API keys
   - Check request limits
   - Verify network connectivity

For additional assistance, check the console logs for error messages.

---

This setup guide covers the essential components of Utilix Cinema. For more detailed information on specific functions or features, refer to the code comments in the respective files.

## ORIGINAL CONTENTS NO FORMAT HUMAN REQUEST TO DO
Create a movie/series streaming website inspired by Hulu’s theme and layout. - Make all of this work no matter what happen. - Make al of this work no matter what implementt all of it.
Name: Utilix Cinema

OVERVIEW
Develop a streaming platform with a modern, Hulu-inspired interface. The website aggregates content from third-party sources and focuses on delivering a seamless user experience through a clean layout, dynamic features, and multiple customization options.

CORE ELEMENTS
1. Layout, Design, Format, Features
Design Inspiration:
The overall design, layout, and interface should be inspired by Hulu’s theme. Think clean lines, intuitive navigation, and dynamic content presentation.

Key Areas:

Navigation bar with multiple interactive options.
Dynamic content areas with infinite scrolling for movies and series.
2. Authentication Modal (AUTHMODAL)
Access Requirement:
Before accessing the website, users must pass an authentication modal.

Login Methods:

Email/Password
Google
Phone Number
QR Code:
It will generate a QR code that redirects to Google login – for example, when a user scans the QR code using their phone from the PC, if the user logs in on the phone then the PC session automatically logs into that account.
Anonymous Login
3. First Main Page
Interface Style:
A Hulu-like interface.

Navbar Elements:

Home Button
Search Bar:
Includes dropdown suggestions for searching movies or series (based on source).
Includes category filters:
Action, Adventure, Comedy, Drama, Horror, Thriller, Mystery, Sci-Fi, Fantasy, Romance, Animation, Documentary, Musical, Crime, War, Western
(When a category is selected, the displayed movies or series will relate accordingly.)
Library:
Stores user’s saved movies and series.
History:
Displays user’s watch history.
Movie Button:
When clicked, displays movies only.
Series Button:
When clicked, displays series only.
Profile:
Displays user details and includes:
Avatar selection (7 preset avatars + 1 custom upload option).
User’s email & Google account details.
Nickname field for custom name input.
Content Display:

Cards:
Movie/series cards displaying title, genre, and "Add to Library" button.
Infinite Scrolling:
The page should automatically load the next batch of content when the user scrolls.
4. Second Main Page – Video Player Page
Navigation:
When a user clicks on a movie or series card, they are taken to the Video Player page.

Page Layout (Top to Bottom):

Go Back Button
Video Player (Iframe)
Title & Control Row:
Server Selection
Fullscreen Button
Focus Mode Button
Movie/Series Description
Related Movies/Series Section
Additional Features for Series:

If the selected content is a TV series, the player will include:
Episode Selector (Styled Like Hulu’s)
A panel beside the video player listing all available episodes for that series/season.
Users can scroll and click on any episode to switch.
Next Episode Button
A Next Episode button under the player or within the controls that automatically plays the next episode in sequence.
5. Change Theme Feature
Settings Input:
Users can change the website theme through the settings menu.

Available Themes:
Royal Purple, Fiery Orange, Red, Blue, Emerald, Green, Teal, Hot Pink, Amber, Gold, Indigo, Dark, Light, Glitchy, Modern, Matrix

6. API Integrations
TMDB (The Movie Database)
Purpose:
Retrieve movies and series information including search results, titles, descriptions, and episode details.

TMDB Code:

javascript
Copy
Edit
const TMDB_API_KEY = '43e5f570f85114b7a746c37aa6307b25';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
FIREBASE
Purpose:
Handle user authentication and realtime database operations (library management, avatar saving, theme saving, and watch history).

Firebase Code:

javascript
Copy
Edit
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
7. VIDEO SERVERS
Video Playback:
The website uses iframes for embedding video content from various servers.

Additional Series-Specific Features:

Episode Switching via Episode Selector
Next Episode Autoplay
8. FOOTER
pgsql
Copy
Edit
© 2025 UTILIX CINEMA. All rights reserved.

This is a demonstration project designed to showcase functionality. Our website does not host or store any data or media files on our servers. Instead, it aggregates content from third-party sources, providing links to media hosted externally. We do not claim ownership or responsibility for the content provided by these third-party services. This platform is for educational purposes only. All content is sourced from third-party providers.
ADDITIONAL ENHANCEMENTS
User Experience (UX) Improvements:

The Episode Selector should resemble Hulu’s suggested video panel on the right side of the player.
The Next Episode Button should function similarly to Hulu’s autoplay.
Smooth infinite scrolling with efficient lazy-loading for performance optimization.
Security & Reliability:

Secure Authentication via Firebase.
Error Handling for Video Loading: If a server fails, an error message should be displayed and alternative servers should be suggested.
Content Management & Customization:

Users can save progress and resume watching later via Firebase.
Customizable Themes with real-time switching.
Technical Considerations:

Use modern frameworks and a modular component-based architecture for scalability and maintainability.