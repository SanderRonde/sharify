import { DEFAULT_TOP_LIMIT, DEFAULT_TOP_TIME_RANGE } from './constants';
import { SpotifyTypes } from '../types/spotify';
import { RoomMember, Room } from './rooms';

export class UserRecommendations {
	constructor(private _user: RoomMember) {}

	public topTracks: SpotifyTypes.Track[] = [];
	public topArtists: SpotifyTypes.FullArtist[] = [];

	private async _fetchTopCategories() {
		const [
			tracks, artists
		] = await Promise.all([
			this._user.api.endpoints.top('tracks', {
				limit: DEFAULT_TOP_LIMIT,
				time_range: DEFAULT_TOP_TIME_RANGE
			}),
			this._user.api.endpoints.top('artists', {
				limit: DEFAULT_TOP_LIMIT,
				time_range: DEFAULT_TOP_TIME_RANGE
			}),
		]);
		if (tracks) {
			this.topTracks = (await tracks.json()).items;
		}
		if (artists) {
			this.topArtists = (await artists.json()).items;
		}
	}
	
	async init() {
		await this._fetchTopCategories();
		return this;
	}
}

export class Recommendations {
    private _recommendations: UserRecommendations[] = [];

    constructor(private _room: Room) {}

    private _notifyChanges() {
        this._room.notify({
            type: 'playlistupdate',
            success: true,
            // TODO: send the actual data
        });
	}
	
	private _updateRecommendations() {
		// TODO: do the magic combining

		this._notifyChanges();
	}

    public async addMember(member: RoomMember) {
        this._recommendations.push(
            await SpotifyRecommendations.createUserRecommendations(member)
		);
		this._updateRecommendations();
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
