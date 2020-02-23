import { Util } from './util';
import * as path from 'path';
import { IO } from './io';

export const NAME = 'Sharify';

export const ROOM_ID_LENGTH = 32;
// Time out after a week
export const ROOM_TIMEOUT = 1000 * 60 * 60 * 24 * 7;

// TODO: get the relevant scopes
export const SPOTIFY_PEER_SCOPES = ['user-read-email', 'user-top-read'];
export const SPOTIFY_HOST_SCOPES = [...SPOTIFY_PEER_SCOPES, 'playlist-modify-public', 'playlist-modify-private'];
export const SPOTIFY_SECRETS_FILE = path.join(__dirname, '../../../secrets/spotify.json');
export const HOST_URL = Util.isDev() ? `http://localhost:${IO.get().port}` : '//TODO:';
export const REDIRECT_PATH = '/api/permission_callback';
export const SPOTIFY_COLOR = '#1ed760';
export const DEFAULT_TOP_LIMIT = 100;
export const DEFAULT_TOP_TIME_RANGE = 'medium_term';