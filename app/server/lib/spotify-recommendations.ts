import { DEFAULT_TOP_LIMIT, DEFAULT_TOP_TIME_RANGE, SPOTIFY_RECOMMENDATIONS_AMOUNT } from './constants';
import { SpotifyTypes } from '../types/spotify';
import { RoomMember, Room } from './rooms';
// import { Util } from './util';

interface RecommendationGroupBase {
    ranking: number;
	occurences: number;
	id: string;
}

interface ArtistRecommendationGroup extends RecommendationGroupBase {
    type: 'artist';
    artist: string;
}

interface TrackRecommendationGroup extends RecommendationGroupBase {
    type: 'track';
    track: string;
}

interface GenreRecommendationGroup extends RecommendationGroupBase {
    type: 'genre';
	genre: string;
}

type RecommendationGroup =
    | ArtistRecommendationGroup
    | TrackRecommendationGroup
    | GenreRecommendationGroup;

interface TrackRecommendation {
	id: String;
	name: string;
}

export class UserRecommendations {
    constructor(private _user: RoomMember) {}

    public topTracks: SpotifyTypes.Track[] = [];
    public topArtists: SpotifyTypes.FullArtist[] = [];

    public groups: RecommendationGroup[] = [];

    private async _fetchTopCategories() {
        const [tracks, artists] = await Promise.all([
            this._user.api.endpoints.top('tracks', {
                limit: DEFAULT_TOP_LIMIT,
                time_range: DEFAULT_TOP_TIME_RANGE,
            }),
            this._user.api.endpoints.top('artists', {
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
	
	public static joinDuplicates<V extends RecommendationGroupBase>(recommendations: V[]): V[] {
		const sorted = [...recommendations].sort((a, b) => a.ranking - b.ranking)
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
					type: 'artist',
					artist: artist.name,
					id: artist.id,
					occurences: 1,
					ranking: artists.length + trackArtists.length,
				});
			})
		});

		const genres: GenreRecommendationGroup[] = [];
		this.topArtists.forEach((topArtist) => {
			topArtist.genres.forEach((genre) => {
				genres.push({
					type: 'genre',
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
		const trackArtistDetailReq = await this._user.api.endpoints.artists(trackArtistIDs);
		if (trackArtistDetailReq) {
			const { artists: trackArtistDetail } = await trackArtistDetailReq.json();
			trackArtistDetail.forEach((artist) => {
				artist.genres.forEach((genre) => {
					genres.push({
						type: 'genre',
						occurences: 1,
						id: genre,
						ranking: trackArtistGenreRanking,
						genre
					});
				});
			});
		}

		this.groups.push(
			...UserRecommendations.joinDuplicates(artists),
			...UserRecommendations.joinDuplicates(trackArtists),
			...UserRecommendations.joinDuplicates(genres)
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

    private _notifyChanges() {
        this._room.notify({
            type: 'playlistupdate',
            success: true,
            // TODO: send the actual data
        });
	}
	
	private _getOverlap<G extends RecommendationGroupBase>(values: G[][]): G[] {
		const overlap: G[] = [];
		const [ base, ...rest ] = values;
		for (const value of base) {
			if (rest.every((restArr) => {
				return restArr.find((restValue) => value.id === restValue.id);
			})) {
				// Every other array has this value as well
				overlap.push(value);
			}
		}
		return overlap;
	}

	// private _getJoined<G extends RecommendationGroupBase>(values: G[][]): G[] {
	// 	return UserRecommendations.joinDuplicates(Util.flat(values));
	// }

	private async _getRecommendations(amount: number) {
		// const artists = this._members.map((member) => {
		// 	return member.groups.filter((item) => {
		// 		return item.type === 'artist';
		// 	});
		// }) as unknown as ArtistRecommendationGroup[][];
		const tracks = this._members.map((member) => {
			return member.groups.filter((item) => {
				return item.type === 'track';
			});
		}) as unknown as TrackRecommendationGroup[][];
		// const genres = this._members.map((member) => {
		// 	return member.groups.filter((item) => {
		// 		return item.type === 'genre';
		// 	});
		// }) as unknown as GenreRecommendationGroup[][];

		const recommendations: TrackRecommendation[] = [
			...this._getOverlap(tracks).map((recommendation) => {
				return {
					name: recommendation.track,
					id: recommendation.id
				}
			})
		];

		if (recommendations.length >= amount) {
			return recommendations.slice(0, amount);
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
