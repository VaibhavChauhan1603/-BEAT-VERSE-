# BEAT VERSE — Android-focused music app starter

A React + Vite mobile-first prototype with the approved neon-purple/black BEAT VERSE logo integrated at `public/beat-verse-logo.png`.

## Present in this starter
- Distinct dark/purple home, search, library and playlist UI
- Create playlists and like/favourite tracks (browser local storage)
- Add and play audio files selected from the device while the app is open
- Mini player controls, shuffle/repeat toggles, volume control and queue screen
- Spotify playlist import screen that accepts/validates a Spotify URL
- Responsive layout for mobile screens

## Not implemented yet (requires further development)
- Real user registration/login, secure password reset and account profiles/usernames
- Real Spotify OAuth and playlist track import/matching
- Licensed online music catalogue and streaming
- Synced lyrics, reliable album-art/artist metadata service
- Cloud playlists/library sync across devices
- Offline downloads, background playback and Android lock-screen controls
- Native Android APK packaging, permissions and device testing

The Spotify screen is currently only a UI/URL validation demo; it does not import Spotify tracks. The sample tracks are display data and are not playable until a local audio file is added. Do not treat this starter as a finished streaming service.

## Development preview
1. Install Node.js in a development environment.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local Vite URL on a phone or computer.

## Android target
This source is mobile-first but is not yet an APK. The next engineering step is to add a Capacitor Android project, configure app ID/name/icon, implement native playback, then build and test the APK. A backend and provider credentials are needed for real login and Spotify import. Never put private API secrets in the Android client.

Use only music you own or are authorized to play. BEAT VERSE is an independent project and is not affiliated with Demus or Spotify.
