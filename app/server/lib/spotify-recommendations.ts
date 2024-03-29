import {
    DEFAULT_TOP_LIMIT,
    DEFAULT_TOP_TIME_RANGE,
    SPOTIFY_RECOMMENDATIONS_AMOUNT,
    SEEDABLES,
    GENRE_TRACK_LIMIT,
    ARTIST_TRACK_LIMIT,
    TRACK_TRACK_LIMIT,
    HARD_RECOMMENDATIONS_LIMIT,
    MIN_RECOMMENDATIONS,
} from "./constants";
import { SpotifyTypes } from "../types/spotify";
import { RoomMember, Room } from "./rooms";
import { Util } from "./util";
import { RecommendationConfig } from "./spotify-endpoints";
import { StatisticsData } from "../../shared/ws";

interface RecommendationGroupBase {
    ranking: number;
    occurences: number;
    id: string;
    type: string;
}

interface ArtistRecommendationGroup extends RecommendationGroupBase {
    type: "artist";
    artist: string;
}

interface TrackRecommendationGroup extends RecommendationGroupBase {
    type: "track";
    fullName: string;
    track: string;
}

interface GenreRecommendationGroup extends RecommendationGroupBase {
    type: "genre";
    genre: string;
    trackNames: string[];
    artistNames: string[];
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
    constructor(public user: RoomMember) {}

    public topTracks: SpotifyTypes.Track[] = [];
    public topArtists: SpotifyTypes.FullArtist[] = [];

    public groups: RecommendationGroup[] = [];

    private async _fetchTopCategories() {
        const [tracks, artists] = await Promise.all(
            Util.isDev()
                ? [
                      this.user.api.endpoints.top("tracks", {
                          limit: 10,
                          offset: Math.round(Math.random() * 40),
                          time_range: DEFAULT_TOP_TIME_RANGE,
                      }),
                      this.user.api.endpoints.top("artists", {
                          limit: 10,
                          offset: Math.round(Math.random() * 40),
                          time_range: DEFAULT_TOP_TIME_RANGE,
                      }),
                  ]
                : [
                      this.user.api.endpoints.top("tracks", {
                          limit: DEFAULT_TOP_LIMIT,
                          time_range: DEFAULT_TOP_TIME_RANGE,
                      }),
                      this.user.api.endpoints.top("artists", {
                          limit: DEFAULT_TOP_LIMIT,
                          time_range: DEFAULT_TOP_TIME_RANGE,
                      }),
                  ]
        );
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
                // More occurrences is better
                return b.occurences - a.occurences;
            }
            // A lower ranking is better
            return a.ranking - a.ranking;
        });
    }

    public static joinDuplicates<V extends RecommendationGroup>(
        recommendations: V[]
    ): V[] {
        const sorted = [...recommendations]
            .sort((a, b) => a.ranking - b.ranking)
            // Remove any object links
            .map((value) => JSON.parse(JSON.stringify(value))) as V[];
        for (let i = sorted.length - 1; i >= 0; i--) {
            const value = sorted[i];
            for (const sortedMatch of sorted) {
                if (value === sortedMatch) continue;
                if (value.id === sortedMatch.id) {
                    sortedMatch.occurences++;
                    sorted.splice(i, 1);

                    if (sortedMatch.type === "genre") {
                        const genreMatch =
                            sortedMatch as GenreRecommendationGroup;
                        const genreValue = value as GenreRecommendationGroup;
                        genreMatch.trackNames = [
                            ...(genreMatch.trackNames || []),
                            ...(genreValue.trackNames || []),
                        ];
                        genreMatch.artistNames = [
                            ...(genreMatch.artistNames || []),
                            ...(genreValue.artistNames || []),
                        ];
                    }
                    break;
                }
            }
        }

        return sorted;
    }

    private _mapGenre(genre: GenreRecommendationGroup) {
        if (SEEDABLES.includes(genre.genre)) {
            return genre;
        }

        // If prt of a known genre is in this genre, chances are it's
        // a derivative
        for (const seedable of SEEDABLES) {
            if (genre.genre.includes(seedable)) {
                genre.genre = seedable;
                return genre;
            }
        }

        return null;
    }

    private _trackFullName({ artists, name }: SpotifyTypes.Track) {
        return `${artists.map((a) => a.name).join(" & ")} - ${name}`;
    }

    private async _createRecommendationGroups() {
        this.groups.push(
            ...this.topTracks.map((track, index) => {
                const { type, name, id } = track;
                return {
                    type,
                    track: name,
                    id,
                    fullName: this._trackFullName(track),
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
                    artistNames: [topArtist.name],
                    trackNames: [],
                });
            });
        });

        const trackArtistIDs = trackArtists.map((artist) => {
            return artist.id;
        });
        const trackArtistGenreRanking = genres.length;
        const trackArtistDetailReq = await this.user.api.endpoints.artists(
            trackArtistIDs
        );
        if (trackArtistDetailReq) {
            const { artists: trackArtistDetail } =
                await trackArtistDetailReq.json();
            trackArtistDetail.forEach((artist) => {
                artist.genres.forEach((genre) => {
                    // Find the track that this artist belongs to
                    const matchingTrack = this.topTracks.find((track) => {
                        return track.artists.some((trackArtist) => {
                            trackArtist.id === artist.id;
                        });
                    });

                    genres.push({
                        type: "genre",
                        occurences: 1,
                        id: genre,
                        ranking: trackArtistGenreRanking,
                        genre,
                        artistNames: [],
                        trackNames: matchingTrack
                            ? [this._trackFullName(matchingTrack)]
                            : [],
                    });
                });
            });
        }

        this.groups.push(
            ...this._sortByRanking(UserRecommendations.joinDuplicates(artists)),
            ...this._sortByRanking(
                UserRecommendations.joinDuplicates(trackArtists)
            ),
            ...this._sortByRanking(
                UserRecommendations.joinDuplicates(
                    genres
                        .map(this._mapGenre)
                        .filter((v) => !!v) as GenreRecommendationGroup[]
                )
            )
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
    public playlist: {
        id: string;
        collaborative: boolean;
        public: boolean;
        lastRecommendations: TrackRecommendation[];
    } | null = null;
    public statistics: StatisticsData = {
        trackOverlap: [],
        artistOverlap: [],
        genreOverlap: [],
    };

    constructor(private _room: Room) {}

    get api() {
        return this._room.host?.api;
    }

    private _notifyChanges() {
        this._room.notifyUpdate({
            playlistID: true,
            statistics: true,
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

    private _getJoined<G extends RecommendationGroup>(values: G[][]): G[] {
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

    private async _fetchFromConfig(
        config: RecommendationConfig,
        limit: number
    ) {
        let recommendations: TrackRecommendation[] = [];

        // First iterate all genres
        for (const genre of config.seed_genres || []) {
            const response = await this.api!.endpoints.recommendations({
                seed_genres: [genre],
                // Spotify's recommendations are actually pretty bad
                // for multiple genres, so split them up
                // and get individual recommendations
                limit: GENRE_TRACK_LIMIT,
            });
            if (!response) continue;
            const responseTracks = (await response.json()).tracks;
            Util.devLog(
                `Received ${responseTracks.length} responses:`,
                responseTracks.map((t) => t.name)
            );
            recommendations.push(...responseTracks);

            if (recommendations.length >= limit) {
                return recommendations.slice(0, limit);
            }
        }

        // Iterate all artists
        for (const artist of config.seed_artists || []) {
            const response = await this.api!.endpoints.recommendations({
                seed_artists: [artist],
                limit: ARTIST_TRACK_LIMIT,
            });
            if (!response) continue;
            const responseTracks = (await response.json()).tracks;
            Util.devLog(
                `Received ${responseTracks.length} responses`,
                responseTracks.map((t) => t.name)
            );
            recommendations.push(...responseTracks);

            if (recommendations.length >= limit) {
                return recommendations.slice(0, limit);
            }
        }

        // Iterate all tracks
        for (const track of config.seed_tracks || []) {
            const response = await this.api!.endpoints.recommendations({
                seed_tracks: [track],
                limit: TRACK_TRACK_LIMIT,
            });
            if (!response) continue;
            const responseTracks = (await response.json()).tracks;
            Util.devLog(
                `Received ${responseTracks.length} responses`,
                responseTracks.map((t) => t.name)
            );
            recommendations.push(...responseTracks);

            if (recommendations.length >= limit) {
                return recommendations.slice(0, limit);
            }
        }

        return recommendations.slice(0, limit);
    }

    private async _getRecommendations(amount: number) {
        const config: RecommendationConfig = {};

        const artists = this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "artist";
            });
        }) as unknown as ArtistRecommendationGroup[][];
        const tracks = this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "track";
            });
        }) as unknown as TrackRecommendationGroup[][];
        const genres = this._members.map((member) => {
            return member.groups.filter((item) => {
                return item.type === "genre";
            });
        }) as unknown as GenreRecommendationGroup[][];

        // Check if there are overlapping tracks
        const trackOverlap = this._getOverlap(tracks);
        config.seed_tracks = [
            ...(config.seed_tracks || []),
            ...trackOverlap.map((t) => t.id),
        ];
        Util.devLog(
            "Track overlap:\n",
            trackOverlap.map((t) => t.track).join(", ")
        );

        // Check if there are overlapping artists
        const artistOverlap = this._getOverlap(artists);
        config.seed_artists = [
            ...(config.seed_artists || []),
            ...artistOverlap.map((t) => t.id),
        ];

        Util.devLog(
            "Artist overlap:\n",
            artistOverlap.map((a) => a.artist).join(", ")
        );

        // Check for overlapping genres
        const genreOverlap = this._getOverlap(genres);
        config.seed_genres = [
            ...(config.seed_genres || []),
            ...genreOverlap.map((t) => t.genre),
        ];

        Util.devLog(
            "Genre overlap:\n",
            genreOverlap.map((g) => g.genre).join(", ")
        );

        // Generate and store statistics
        this.statistics.trackOverlap = trackOverlap.map((track) => ({
            name: track.fullName,
            amount: track.occurences,
        }));

        this.statistics.artistOverlap = artistOverlap.map((artist) => ({
            name: artist.artist,
            amount: artist.occurences,
        }));

        this.statistics.genreOverlap = genreOverlap.map((genre) => ({
            name: genre.genre,
            amount: genre.occurences,
            genreData: {
                artists: genre.artistNames,
                tracks: genre.trackNames,
            },
        }));

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

        // Fetch based on overlapping values
        if (
            this.api &&
            (config.seed_artists?.length ||
                config.seed_genres?.length ||
                config.seed_tracks?.length)
        ) {
            recommendations = this._filterUniqueTracks([
                ...recommendations,
                ...(await this._fetchFromConfig(
                    config,
                    amount - recommendations.length
                )),
            ]);
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

        Util.devLog(
            "Joined tracks:\n",
            joinedTracks.map((t) => t.track).join(", ")
        );

        const joinedArtists = this._getJoined(artists);
        config.seed_artists = [
            ...(config.seed_artists || []),
            ...joinedArtists.map((t) => t.id),
        ];

        Util.devLog(
            "Joined artists:\n",
            joinedArtists.map((a) => a.artist).join(", ")
        );

        const joinedGenres = this._getJoined(genres);
        config.seed_genres = [
            ...(config.seed_genres || []),
            ...joinedGenres.map((t) => t.id),
        ];

        Util.devLog(
            "Joined genres:\n",
            joinedGenres.map((g) => g.genre).join(", ")
        );

        if (this.api) {
            recommendations = this._filterUniqueTracks([
                ...recommendations,
                ...(await this._fetchFromConfig(
                    config,
                    amount - recommendations.length
                )),
            ]);
        }

        return recommendations.slice(0, amount);
    }

    private _formatMemberNames() {
        const names = this._members.map((m) => m.user.info.name);
        if (names.length === 1) {
            return names[0];
        }
        return `${names.slice(0, -1).join(", ")} and ${names.slice(-1)[0]}`;
    }

    private async _updatePlaylist() {
        if (!this.api || !this.playlist) return;
        // Create playlist
        await this.api.endpoints.updatePlaylistMeta(
            this.playlist.id,
            `Sharify with ${this._formatMemberNames()}`,
            {
                description: `Sharify playlist generated on ${new Date().toLocaleDateString()} with ${this._formatMemberNames()}`,
                isCollaborative: this.playlist.collaborative,
                isPublic: this.playlist.public,
            }
        );
    }

    private async _createPlaylist() {
        // TODO: look at whether playlists update instantly-ish
        if (!this.api) return null;
        // Create playlist
        const isCollaborative = true;
        const isPublic = false;
        const playlistResponse = await this.api.endpoints.createPlaylist(
            `Sharify with ${this._formatMemberNames()}`,
            {
                description: `Sharify playlist generated on ${new Date().toLocaleDateString()} with ${this._formatMemberNames()}`,
                // TODO: this may become an option for the user
                isCollaborative,
                isPublic,
            }
        );
        if (!playlistResponse) return null;

        const playlist = await playlistResponse.json();

        this.playlist = {
            id: playlist.id,
            lastRecommendations: [],
            collaborative: isCollaborative,
            public: isPublic,
        };
        return this.playlist;
    }

    private async _clearPlaylist() {
        // Get all tracks in the playlist
        let tracks = this.playlist!.lastRecommendations.map((r) => r.id);
        if (tracks.length === 0) {
            const response = await this.api!.endpoints.playlistTracks(
                this.playlist!.id
            );
            if (response) {
                tracks = (await response.json()).items.map((item) => {
                    return item.track.id;
                });
            }
        }

        const response = await this.api!.endpoints.deleteTracks(
            this.playlist!.id,
            tracks.map((id) => `spotify:track:${id}`)
        );

        return !!response;
    }

    private async _addTracksToPlaylist() {
        if (!this.playlist) {
            if (!(await this._createPlaylist())) return null;
        } else {
            if (!(await this._clearPlaylist())) return null;
            await this._updatePlaylist();
        }

        // Add tracks to playlist
        const addTracksResponse = await this.api!.endpoints.addToPlaylist(
            this.playlist!.id,
            {
                uris: this.recommendations.map(
                    (track) => `spotify:track:${track.id}`
                ),
            }
        );
        if (!addTracksResponse) return null;

        this.playlist!.lastRecommendations = this.recommendations;

        return this.playlist!.id;
    }

    private async _updateRecommendations(amount: number) {
        this.recommendations = await this._getRecommendations(amount);
        const playlistID = await this._addTracksToPlaylist();
        if (!playlistID) return;

        this._notifyChanges();
    }

    public async addMember(member: RoomMember) {
        this._members.push(
            await SpotifyRecommendations.createUserRecommendations(member)
        );
        const recommendationAmount = HARD_RECOMMENDATIONS_LIMIT
            ? SPOTIFY_RECOMMENDATIONS_AMOUNT
            : MIN_RECOMMENDATIONS;
        await this._updateRecommendations(recommendationAmount);
        member.notifyMember({
            type: "notifyPlaylistCreated",
            data: {},
        });
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
