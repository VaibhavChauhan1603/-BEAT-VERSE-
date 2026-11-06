const CLIENT_ID = "9a20cc2ff122487681d4e4d6e3d21790";

const REDIRECT_URI =
  "https://vaibhavchauhan1603.github.io/-BEAT-VERSE-/spotify-callback.html";

const TOKEN_KEY = "bv_spotify_token";
const REFRESH_KEY = "bv_spotify_refresh";
const EXPIRY_KEY = "bv_spotify_expiry";

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createVerifier() {
  const bytes = crypto.getRandomValues(new Uint8Array(64));
  return base64url(bytes);
}

async function createChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  return base64url(await crypto.subtle.digest("SHA-256", data));
}

export async function startSpotifyLogin() {
  if (CLIENT_ID.includes("PASTE_")) {
    throw new Error("Please add your Spotify Client ID in spotify.js.");
  }

  const verifier = await createVerifier();
  const challenge = await createChallenge(verifier);

  const state = base64url(
    crypto.getRandomValues(new Uint8Array(16))
  );

  localStorage.setItem("bv_spotify_verifier", verifier);
  localStorage.setItem("bv_spotify_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: "playlist-read-private playlist-read-collaborative"
  });

  window.location.href =
    "https://accounts.spotify.com/authorize?" + params.toString();
}

export async function finishSpotifyLogin(code, receivedState) {
  const verifier = localStorage.getItem("bv_spotify_verifier");
  const savedState = localStorage.getItem("bv_spotify_state");

  if (!code || !verifier || !savedState || receivedState !== savedState) {
    throw new Error("Spotify login verification failed. Please try again.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Spotify login failed.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
  }

  localStorage.setItem(
    EXPIRY_KEY,
    String(Date.now() + data.expires_in * 1000)
  );

  localStorage.removeItem("bv_spotify_verifier");
  localStorage.removeItem("bv_spotify_state");

  return true;
}

export async function getSpotifyAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0);

  if (token && Date.now() < expiry - 60000) {
    return token;
  }

  const refreshToken = localStorage.getItem(REFRESH_KEY);

  if (!refreshToken) {
    throw new Error("Please connect your Spotify account first.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Spotify session expired. Please login again.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);

  if (data.refresh_token) {
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
  }

  localStorage.setItem(
    EXPIRY_KEY,
    String(Date.now() + data.expires_in * 1000)
  );

  return data.access_token;
}

export async function importSpotifyPlaylist(playlistUrl) {
  const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);

  if (!match) {
    throw new Error("Please enter a valid Spotify playlist link.");
  }

  const playlistId = match[1];
  const token = await getSpotifyAccessToken();

  let url = `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=50`;
  const importedTracks = [];

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Spotify only allows this import for playlists you own or collaborate on."
        );
      }
      throw new Error(data.error?.message || "Could not import playlist.");
    }

    for (const entry of data.items || []) {
      const track = entry.item || entry.track;

      if (!track || track.type !== "track") continue;

      importedTracks.push({
        id: `spotify-${track.id}-${importedTracks.length}`,
        title: track.name,
        artist: track.artists?.map(a => a.name).join(", ") || "Unknown",
        album: track.album?.name || "Unknown album",
        duration: track.duration_ms
          ? `${Math.floor(track.duration_ms / 60000)}:${String(
              Math.floor((track.duration_ms % 60000) / 1000)
            ).padStart(2, "0")}`
          : "—",
        color: "violet",
        cover: "🎵",
        url: "",
        albumImage: track.album?.images?.[0]?.url || "",
        spotifyUrl: track.external_urls?.spotify || ""
      });
    }

    url = data.next;
  }

  return importedTracks;
      }
