import { Spotify } from './spotify';
import { SpotifyTypes } from '../types/spotify';

export namespace SpotifyEndpoints {
	export class SpotifyEndpoints {
		constructor(public api: Spotify.API.APIInstance) {}

		me() {
			return this.api.get<SpotifyTypes.Endpoints.Me>(
				'/v1/me'
			)
		}
	}
}