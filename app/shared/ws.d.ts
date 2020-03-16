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

export interface UpdateMessageData {
    members?: RoomMember[];
    playlistID?: string;
    statistics?: {
        artistOverlap: string[];
        genreOverlap: string[];
        trackOverlap: string[];
    }
}

export type WebsocketMessage =
    | FailableMessage<'update', UpdateMessageData>
    | ErrorMessage<'connect'>;

export interface RoomMember {
    id: string;
    isHost: boolean;
    isAdmin: boolean;
    isMe: boolean;
    image: string | null;
    name: string;
    email: string;
}
