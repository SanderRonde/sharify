export interface ErrorMessage<T> {
    type: T;
    success: false;
    error: string;
}

export type FailableMessage<T, B> =
    | (ErrorMessage<T> & Partial<B>)
    | ({
          type: T;
          success: true;
      } & B);

export interface UpdateMessage<T, D> {
    type: T;
    data: D;
}

export interface StatisticPoint {
    name: string;
    amount: number;
    genreData?: {
        artists: string[];
        tracks: string[];
    };
}

export interface StatisticsData {
    artistOverlap: StatisticPoint[];
    genreOverlap: StatisticPoint[];
    trackOverlap: StatisticPoint[];
}

export interface UpdateMessageData {
    members?: RoomMember[];
    playlistID?: string;
    statistics?: StatisticsData;
}

export type WebsocketMessage =
    | FailableMessage<"update", UpdateMessageData>
    | ErrorMessage<"connect">
    | UpdateMessage<"notifyPlaylistCreated", {}>;

export interface RoomMember {
    id: string;
    isHost: boolean;
    isAdmin: boolean;
    isMe: boolean;
    image: string | null;
    name: string;
    email: string;
}
