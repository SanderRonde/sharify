import { SPOTIFY_SECRETS_FILE, FRONTEND_URL, REDIRECT_PATH } from "./constants";
import { SpotifyEndpoints } from "./spotify-endpoints";
import { SpotifyTypes } from "../types/spotify";
import * as querystring from "querystring";
import { Response } from "node-fetch";
import * as express from "express";
import fetch from "node-fetch";
import * as fs from "fs-extra";
import { Util } from "./util";

export namespace Spotify {
    export interface PartialResponse<R> {
        json(): Promise<R>;
    }

    export interface ExtendedResponse<R> extends Response {
        clone(): ExtendedResponse<R>;
        json(): Promise<R>;
    }

    export namespace API {
        export class APIInstance {
            private _accessToken!: string;
            private _refreshToken!: string;
            public endpoints = new SpotifyEndpoints.SpotifyEndpoints(this);
            public id!: string;

            constructor({
                accessToken,
                expiresIn,
                refreshToken,
            }: {
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
            }) {
                this._accessToken = accessToken;
                this.setRefresh(refreshToken, expiresIn);
            }

            setID(id: string) {
                this.id = id;
            }

            private _refresher: NodeJS.Timeout | null = null;
            setRefresh(token: string, expireTime: number) {
                if (this._refresher) {
                    clearTimeout(this._refresher);
                }
                this._refreshToken = token;

                this._refresher = setTimeout(() => {
                    this.refreshToken();
                    this._refresher && clearTimeout(this._refresher);
                }, expireTime * 1000 * 0.9) as unknown as NodeJS.Timeout;
            }

            private async _checkCreatedToken(
                response: ExtendedResponse<SpotifyTypes.Endpoints.AuthToken>
            ) {
                if (response.status !== 200) return false;

                const {
                    access_token,
                    refresh_token,
                    expires_in,
                } = await response.json();

                this._accessToken = access_token;
                this.setRefresh(refresh_token, expires_in);

                return await this.testAuth();
            }

            async refreshToken() {
                const {
                    client_id,
                    client_secret,
                } = await Authentication.getSecrets();
                const response = await this.post<
                    SpotifyTypes.Endpoints.AuthToken
                >(
                    "/api/token",
                    `grant_type=refresh_token&refresh_token=${this._refreshToken}`,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: `Basic ${Buffer.from(
                                `${client_id}:${client_secret}`
                            ).toString("base64")}`,
                        },
                        base: "https://accounts.spotify.com",
                    }
                );
                if (!response) return false;
                return this._checkCreatedToken(response);
            }

            private static readonly SPOTIFY_BASE = "https://api.spotify.com";
            private _getHeaders() {
                return {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this._accessToken}`,
                };
            }

            async wrapRequest<R>(
                path: string,
                request: () => Promise<ExtendedResponse<R>>
            ): Promise<ExtendedResponse<R> | null> {
                const url = `${APIInstance.SPOTIFY_BASE}${path}`;
                try {
                    const response = await request();
                    switch (response.status) {
                        case 200:
                        case 201:
                        case 202:
                        case 204:
                        case 304:
                            return response;
                        case 400:
                        case 403:
                        case 500:
                        case 502:
                            console.log(
                                `Spotify API request failed on URL ${url}`,
                                await response.text()
                            );
                            return null;
                        case 401:
                            console.log(
                                `Spotify API request failed (on URL ${url})`,
                                await response.text()
                            );
                            if (!(await this.refreshToken())) {
                                console.log(
                                    "Failed to refresh token, giving up"
                                );
                                return null;
                            }
                            return this.wrapRequest(path, request);
                        case 429:
                            const retryAfter = response.headers.get(
                                "Retry-After"
                            );
                            await Util.wait(
                                1000 * (parseInt(retryAfter || "60", 10) + 1)
                            );
                            return this.wrapRequest(path, request);
                        case 503:
                            await Util.wait(1000 * 60);
                            return this.wrapRequest(path, request);
                    }
                    console.log(
                        `Unknown status code ${response.status} on URL ${url}`,
                        await response.text()
                    );
                    return null;
                } catch (e) {
                    console.log(`Error in making request on URL ${url}`, e);
                    return null;
                }
            }

            private _filterObject<
                O extends {
                    [key: string]: any;
                }
            >(obj: O): Partial<O> {
                const newObj: Partial<O> = {};
                for (const key in obj) {
                    if (obj[key] !== undefined) {
                        newObj[key] = obj[key];
                    }
                }
                return newObj;
            }

            async get<R>(
                path: string,
                {
                    query = {},
                }: {
                    query?: {
                        [key: string]: string | number | undefined;
                    };
                } = {}
            ): Promise<ExtendedResponse<R> | null> {
                const ret = await this.wrapRequest(path, async () => {
                    const filteredQuery = this._filterObject(query);
                    const qs = Object.keys(filteredQuery).length
                        ? `?${querystring.stringify(filteredQuery)}`
                        : "";
                    const url = `${APIInstance.SPOTIFY_BASE}${path}${qs}`;
                    const result = await fetch(url, {
                        headers: this._getHeaders(),
                    });
                    console.log(`-> GET ${url} ${result.status}`);
                    return result;
                });
                return ret;
            }

            private _postLike<R>(
                method: string,
                path: string,
                data: string,
                options: {
                    headers?: {
                        [key: string]: string;
                    };
                    base?: string;
                } = {}
            ): Promise<ExtendedResponse<R> | null> {
                return this.wrapRequest(path, async () => {
                    const url = `${options.base ||
                        APIInstance.SPOTIFY_BASE}${path}`;
                    const req = await fetch(url, {
                        method: method,
                        headers: {
                            ...this._getHeaders(),
                            ...(options.headers || {}),
                        },
                        body: data,
                    });
                    console.log(
                        `-> ${method.toUpperCase()} ${url} ${req.status}`
                    );
                    return req;
                });
            }

            post<R>(
                path: string,
                data: string,
                options: {
                    headers?: {
                        [key: string]: string;
                    };
                    base?: string;
                } = {}
            ): Promise<ExtendedResponse<R> | null> {
                return this._postLike("post", path, data, options);
            }

            put<R>(
                path: string,
                data: string,
                options: {
                    headers?: {
                        [key: string]: string;
                    };
                    base?: string;
                } = {}
            ): Promise<ExtendedResponse<R> | null> {
                return this._postLike("put", path, data, options);
            }

            delete<R>(
                path: string,
                data: string,
                options: {
                    headers?: {
                        [key: string]: string;
                    };
                    base?: string;
                } = {}
            ): Promise<ExtendedResponse<R> | null> {
                return this._postLike("delete", path, data, options);
            }

            async testAuth() {
                try {
                    const response = await this.get("/v1/me");
                    return response && response.status === 200;
                } catch (e) {}
                return false;
            }
        }
    }

    export namespace Authentication {
        interface Secrets {
            client_id: string;
            client_secret: string;
        }

        let secrets: null | Secrets = null;
        export async function getSecrets() {
            if (secrets) return secrets;
            try {
                return (secrets = JSON.parse(
                    await fs.readFile(SPOTIFY_SECRETS_FILE, {
                        encoding: "utf8",
                    })
                ) as Secrets);
            } catch (e) {
                console.log(e, SPOTIFY_SECRETS_FILE);
                console.log("Failed to read spotify secrets");
                process.exit(1);
            }
        }

        const REDIRECT_URI = `${FRONTEND_URL}${REDIRECT_PATH}`;
        export async function generatePermissionURL(
            scopes: string[],
            state: string
        ) {
            const secrets = await getSecrets();

            return `https://accounts.spotify.com/authorize?client_id=${
                secrets.client_id
            }&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${scopes.join(
                "%20"
            )}&state=${state}`;
        }

        export async function authenticateFromCode(
            query: any,
            res: express.Response
        ) {
            const { error, code } = query;
            if (error) {
                res.redirect('/rejected');
                return null;
            }
            if (!code) {
                res.redirect('/500');
                return null;
            }

            const { client_id, client_secret } = await getSecrets();
            const response = (await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "post",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${Buffer.from(
                            `${client_id}:${client_secret}`
                        ).toString("base64")}`,
                    },
                    body: `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`,
                }
            )) as ExtendedResponse<SpotifyTypes.Endpoints.AuthToken>;
            if (!response) {
                res.redirect('/500');
                return null;
            }
            return response;
        }
    }
}
