import { Spotify } from './spotify';
import { SpotifyTypes } from '../types/spotify';

export namespace SpotifyEndpoints {
    export class SpotifyEndpoints {
        constructor(public api: Spotify.API.APIInstance) {}

        me() {
            return this.api.get<SpotifyTypes.Endpoints.Me>('/v1/me');
        }

        top(
            type: 'tracks',
            options: {
                limit?: number;
                offset?: number;
                time_range?: 'long_term' | 'medium_term' | 'short_term';
            }
        ): Promise<Spotify.ExtendedResponse<
            SpotifyTypes.Endpoints.TopTracks
        > | null>;
        top(
            type: 'artists',
            options: {
                limit?: number;
                offset?: number;
                time_range?: 'long_term' | 'medium_term' | 'short_term';
            }
        ): Promise<Spotify.ExtendedResponse<
            SpotifyTypes.Endpoints.TopArtists
        > | null>;
        top(
            type: 'artists' | 'tracks',
            {
                limit = 20,
                offset = 0,
                time_range = 'medium_term',
            }: {
                // Limit, min 1, max 50
                limit?: number;
                // The offset from which to start
                offset?: number;
                // Over what time frame the affinities are computed.
                // Valid values: long_term (calculated from several years
                // of data and including all new data as it becomes
                // available), medium_term (approximately last 6 months),
                // short_term (approximately last 4 weeks).
                time_range?: 'long_term' | 'medium_term' | 'short_term';
            } = {}
        ): Promise<Spotify.ExtendedResponse<
            SpotifyTypes.Endpoints.TopTracks | SpotifyTypes.Endpoints.TopArtists
        > | null> {
            return this.api.get<
                | SpotifyTypes.Endpoints.TopArtists
                | SpotifyTypes.Endpoints.TopTracks
            >(`/v1/me/top/${type}`, {
                query: {
                    limit: limit + '',
                    offset: offset + '',
                    time_range,
                },
            });
        }

        recommendations(
            options: {
                limit?: number;
                market?: string;
                seed_artists?: string[];
                seed_genres?: string[];
                seed_tracks?: string[];
                min_actousticness?: number;
                max_actousticness?: number;
                target_actousticness?: number;
                min_danceability?: number;
                max_danceability?: number;
                target_danceability?: number;
                min_duration_ms?: number;
                max_duration_ms?: number;
                target_duration_ms?: number;
                min_energy?: number;
                max_energy?: number;
                target_energy?: number;
                min_instrumentalness?: number;
                max_instrumentalness?: number;
                target_instrumentalness?: number;
                min_key?: number;
                max_key?: number;
                target_key?: number;
                min_liveness?: number;
                max_liveness?: number;
                target_liveness?: number;
                min_loudness?: number;
                max_loudness?: number;
                target_loudness?: number;
                min_mode?: number;
                max_mode?: number;
                target_mode?: number;
                min_popularity?: number;
                max_popularity?: number;
                target_popularity?: number;
                min_speechiness?: number;
                max_speechiness?: number;
                target_speechiness?: number;
                min_tempo?: number;
                max_tempo?: number;
                target_tempo?: number;
                min_time_signature?: number;
                max_time_signature?: number;
                target_time_signature?: number;
                min_valence?: number;
                max_valence?: number;
                target_valence?: number;
            } = {}
        ) {
            const {
                limit = 20,
                market,
                seed_artists = [],
                seed_genres = [],
				seed_tracks = [],
				...rest
            } = options;
            return this.api.get<SpotifyTypes.Endpoints.Recommendations>(
                `/v1/me/recommendations`,
                {
                    query: {
                        limit: limit + '',
                        market,
						seed_artists: seed_artists.join(','),
						seed_genres: seed_genres.join(','),
						seed_tracks: seed_tracks.join(','),
						...rest
                    },
                }
            );
		}
		
		createPlaylist(name: string, {
			description,
			isCollaborative, 
			isPublic
		}: {
			isPublic?: boolean;
			isCollaborative?: boolean;
			description?: string;
		} = {}) {
			return this.api.post<SpotifyTypes.Endpoints.CreatePlaylist>(`/v1/users/${this.api.id}/playlists`, JSON.stringify({
				name: name,
				public: isPublic,
				collaborative: isCollaborative,
				description
			}));
		}

		addToPlaylist(playlistID: string, {
			position, uris = []
		}: {
			uris?: string[];
			position?: number;
		} = {}) {
			return this.api.post<{
				snapshot_id: string;
			}>(`/v1/playlists/${playlistID}/tracks`, JSON.stringify({
				uris: uris.join(', '),
				position
			}));
		}
    }
}
