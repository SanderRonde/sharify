import {
    DEFAULT_TOP_LIMIT,
    DEFAULT_TOP_TIME_RANGE,
    SPOTIFY_RECOMMENDATIONS_AMOUNT,
} from "./constants";
import { SpotifyTypes } from "../types/spotify";
import { RoomMember, Room } from "./rooms";
import { Util } from "./util";
import { RecommendationConfig } from "./spotify-endpoints";

interface RecommendationGroupBase {
    ranking: number;
    occurences: number;
    id: string;
}

interface ArtistRecommendationGroup extends RecommendationGroupBase {
    type: "artist";
    artist: string;
}

interface TrackRecommendationGroup extends RecommendationGroupBase {
    type: "track";
    track: string;
}

interface GenreRecommendationGroup extends RecommendationGroupBase {
    type: "genre";
    genre: string;
}

type RecommendationGroup =
    | ArtistRecommendationGroup
    | TrackRecommendationGroup
    | GenreRecommendationGroup;

interface TrackRecommendation {
    id: string;
    name: string;
}

export class UserRecommendations {
    constructor(private _user: RoomMember) {}

    public topTracks: SpotifyTypes.Track[] = [];
    public topArtists: SpotifyTypes.FullArtist[] = [];

    public groups: RecommendationGroup[] = [];

    private async _fetchTopCategories() {
        const [tracks, artists] = await Promise.all([
            this._user.api.endpoints.top("tracks", {
                limit: DEFAULT_TOP_LIMIT,
                time_range: DEFAULT_TOP_TIME_RANGE,
            }),
            this._user.api.endpoints.top("artists", {
                limit: DEFAULT_TOP_LIMIT,
                time_range: DEFAULT_TOP_TIME_RANGE,
            }),
        ]);
        if (tracks) {
            this.topTracks = (await tracks.json()).items;
        }
        if (artists) {
            this.topArtists = (await artists.json()).items;
        }
    }

    private _sortByRanking<V extends RecommendationGroupBase>(arr: V[]): V[] {
        return arr.sort((a, b) => {
            if (a.occurences !== b.occurences) {
                return a.occurences - b.occurences;
            }
            return a.ranking - b.ranking;
        });
    }

    public static joinDuplicates<V extends RecommendationGroupBase>(
        recommendations: V[]
    ): V[] {
        const sorted = [...recommendations]
            .sort((a, b) => a.ranking - b.ranking)
            // Remove any object links
            .map((value) => JSON.parse(JSON.stringify(value)));
        for (let i = sorted.length - 1; i >= 0; i++) {
            const value = sorted[i];
            for (const sortedMatch of sorted) {
                if (value === sortedMatch) continue;
                if (value.id === sortedMatch.id) {
                    sortedMatch.occurences++;
                    sorted.splice(i, 1);
                    break;
                }
            }
        }

        return sorted;
    }

    private async _createRecommendationGroups() {
        this.groups.push(
            ...this.topTracks.map(({ type, name, id }, index) => {
                return {
                    type,
                    track: name,
                    id,
                    ranking: index,
                    occurences: 1,
                };
            })
        );

        const artists: ArtistRecommendationGroup[] = this.topArtists.map(
            ({ type, name, id }, index) => {
                return {
                    type,
                    artist: name,
                    id,
                    ranking: index,
                    occurences: 1,
                };
            }
        );

        const trackArtists: ArtistRecommendationGroup[] = [];
        this.topTracks.forEach((track) => {
            track.artists.forEach((artist) => {
                // New artist
                trackArtists.push({
                    type: "artist",
                    artist: artist.name,
                    id: artist.id,
                    occurences: 1,
                    ranking: artists.length + trackArtists.length,
                });
            });
        });

        const genres: GenreRecommendationGroup[] = [];
        this.topArtists.forEach((topArtist) => {
            topArtist.genres.forEach((genre) => {
                genres.push({
                    type: "genre",
                    genre: genre,
                    id: genre,
                    occurences: 1,
                    ranking: genres.length,
                });
            });
        });

        const trackArtistIDs = trackArtists.map((artist) => {
            return artist.id;
        });
        const trackArtistGenreRanking = genres.length;
        const trackArtistDetailReq = await this._user.api.endpoints.artists(
            trackArtistIDs
        );
        if (trackArtistDetailReq) {
            const {
                artists: trackArtistDetail,
            } = await trackArtistDetailReq.json();
            trackArtistDetail.forEach((artist) => {
                artist.genres.forEach((genre) => {
                    genres.push({
                        type: "genre",
                        occurences: 1,
                        id: genre,
                        ranking: trackArtistGenreRanking,
                        genre,
                    });
                });
            });
        }

        this.groups.push(
            ...this._sortByRanking(UserRecommendations.joinDuplicates(artists)),
            ...this._sortByRanking(
                UserRecommendations.joinDuplicates(trackArtists)
            ),
            ...this._sortByRanking(UserRecommendations.joinDuplicates(genres))
        );
    }

    async init() {
        await this._fetchTopCategories();
        await this._createRecommendationGroups();
        return this;
    }
}

export class Recommendations {
    private _members: UserRecommendations[] = [];
    public recommendations: TrackRecommendation[] = [];

    constructor(private _room: Room) {}

    get api() {
        return this._room.host?.api;
    }

    private _notifyChanges() {
        this._room.notify({
            type: "playlistupdate",
            success: true,
            recommendations: this.recommendations.map(track => track.id)
        });
    }

    private _getOverlap<G extends RecommendationGroupBase>(values: G[][]): G[] {
        const overlap: G[] = [];
        const [base, ...rest] = values;
        for (const value of base) {
            if (
                rest.every((restArr) => {
                    return restArr.find(
                        (restValue) => value.id === restValue.id
                    );
                })
            ) {
                // Every other array has this value as well
                overlap.push(value);
            }
        }
        return overlap;
    }

    private _getJoined<G extends RecommendationGroupBase>(values: G[][]): G[] {
        return UserRecommendations.joinDuplicates(Util.flat(values));
    }

    private _filterUniqueTracks(
        tracks: TrackRecommendation[]
    ): TrackRecommendation[] {
        const seen: Set<string> = new Set();
        return tracks.filter((track) => {
            if (seen.has(track.id)) return false;
            seen.add(track.id);
            return true;
        });
    }

    private async _getRecommendations(amount: number) {
        const config: RecommendationConfig = {};

        const artists = (this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "artist";
            });
        }) as unknown) as ArtistRecommendationGroup[][];
        const tracks = (this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "track";
            });
        }) as unknown) as TrackRecommendationGroup[][];
        const genres = (this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "genre";
            });
        }) as unknown) as GenreRecommendationGroup[][];

		// Check if there are overlapping tracks
		const trackOverlap = this._getOverlap(tracks);
		config.seed_tracks = [
			...(config.seed_tracks || []),
			...trackOverlap.map((t) => t.id),
		];

        let recommendations: TrackRecommendation[] = [
            // Overlapping tracks
            ...trackOverlap.map((recommendation) => {
                return {
                    name: recommendation.track,
                    id: recommendation.id,
                };
            }),
        ];

        if (recommendations.length >= amount) {
            return recommendations.slice(0, amount);
        }

        // Check if there are overlapping artists
        const artistOverlap = this._getOverlap(artists);
		config.seed_artists = [
			...(config.seed_artists || []),
			...artistOverlap.map((t) => t.id),
		];

        // Check for overlapping genres
        const genreOverlap = this._getOverlap(genres);
		config.seed_genres = [
			...(config.seed_genres || []),
			...genreOverlap.map((t) => t.genre),
		];
		
		// Fetch based on overlapping values
		if (this.api && (config.seed_artists?.length || config.seed_genres?.length || config.seed_tracks?.length)) {
			const response = await this.api.endpoints.recommendations({
				limit: amount,
				seed_artists: config.seed_artists?.slice(0, 5),
				seed_genres: config.seed_genres?.slice(0, 5),
				seed_tracks: config.seed_tracks?.slice(0, 5),
			});
			if (response) {
				recommendations = this._filterUniqueTracks([
					...recommendations,
					...(await response.json()).tracks,
				]);
			}
		}

        if (recommendations.length >= amount) {
            return recommendations.slice(0, amount);
		}

		// Instead of overlap just get some tracks from both
		const joinedTracks = this._getJoined(tracks);
		config.seed_tracks = [
			...(config.seed_tracks || []),
			...joinedTracks.map((t) => t.id),
		];

		const joinedArtists = this._getJoined(tracks);
		config.seed_tracks = [
			...(config.seed_tracks || []),
			...joinedArtists.map((t) => t.id),
		];

		const joinedGenres = this._getJoined(tracks);
		config.seed_tracks = [
			...(config.seed_tracks || []),
			...joinedGenres.map((t) => t.id),
		];

		if (this.api) {
			const response = await this.api.endpoints.recommendations({
				limit: amount,
				seed_artists: config.seed_artists?.slice(0, 5),
				seed_genres: config.seed_genres?.slice(0, 5),
				seed_tracks: config.seed_tracks?.slice(0, 5),
			});
			if (response) {
				recommendations = this._filterUniqueTracks([
					...recommendations,
					...(await response.json()).tracks,
				]);
			}
		}

        return recommendations.slice(0, amount);
    }

    private async _updateRecommendations(amount: number) {
        this.recommendations = await this._getRecommendations(amount);

        this._notifyChanges();
    }

    public async addMember(member: RoomMember) {
        this._members.push(
            await SpotifyRecommendations.createUserRecommendations(member)
        );
        await this._updateRecommendations(SPOTIFY_RECOMMENDATIONS_AMOUNT);
    }
}

export namespace SpotifyRecommendations {
    export async function createUserRecommendations(user: RoomMember) {
        return new UserRecommendations(user).init();
    }

    export function create(room: Room) {
        return new Recommendations(room);
    }
}
