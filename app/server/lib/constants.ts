import * as path from "path";
import { IO } from "./io";

/**
 * Options that can change
 */
export const NAME = "Sharify";
// If true, strive to fill SPOTIFY_RECOMMENDATIONS_AMOUNT up
// if false, try to get the best we can and let spotify's
// recommendations handle the rest
export const HARD_RECOMMENDATIONS_LIMIT = !IO.get().spotifyRecommend;


/**
 * Room options that are unlikely to change
 */
// Time out after a week
export const ROOM_TIMEOUT = 1000 * 60 * 60 * 24 * 7;

/**
 * API options that are unlikely to change
 */
export const SPOTIFY_PEER_SCOPES = ["user-read-email", "user-top-read"];
export const SPOTIFY_HOST_SCOPES = [
    ...SPOTIFY_PEER_SCOPES,
    "playlist-modify-public",
    "playlist-modify-private",
];
export const SECRET_DIR = path.join(
    __dirname,
    "../../../secrets");
export const SPOTIFY_SECRETS_FILE = path.join(
    SECRET_DIR, "spotify.json"
);
export const COOKIE_SECRETS_FILE = path.join(
    SECRET_DIR, "cookie.js"
);

/**
 * Hosting options that are unlikely to change
 */
export const FRONTEND_PORT = 3000;
export const HOST_URL = IO.get().host || `http://localhost:${IO.get().port}`;
export const FRONTEND_URL = IO.get().host || `http://localhost:${FRONTEND_PORT}`;
export const REDIRECT_PATH = "/api/permission_callback";

/**
 * Recommendations options that are unlikely to change
 */
export const DEFAULT_TOP_LIMIT = 100;
export const DEFAULT_TOP_TIME_RANGE = "medium_term";
// Generate at least this many recommendations before
// passing control to spotify's recommendations algorithm
// if HARD_RECOMMENDATIONS_LIMIT is true
export const MIN_RECOMMENDATIONS = 10;
export const SPOTIFY_RECOMMENDATIONS_AMOUNT = 100;
export const GENRE_TRACK_LIMIT = 20;
export const ARTIST_TRACK_LIMIT = 10;
export const TRACK_TRACK_LIMIT = 5;
export const USER_ID_LENGTH = 32;
export const SEEDABLES = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music",
];
