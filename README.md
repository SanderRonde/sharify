# Sharify
Matchmaking system for multiple Spotify users to create a list which has songs based on similar interests

## Running

* Install [nodejs](https://nodejs.org/en/) or better yet [yarn](https://yarnpkg.com/)
* Run `npm install` when using `nodejs` or `yarn` when using `yarn`
* Run `npm run compile`
* Run `npm run start` to start it or `npm run dev` to start it in development mode
* It should now be running on port 1234 by default

### Developing

* To compile any files on change, start the typescript compiler, to do this run `npm run watch:server` and `npm run watch:client` in two console windows in the background.
* That's it, the server is available on port 1234 and will restart when you make any changes

## TODO

### Back-end
- [x] ~~Setup Github repo~~
- [x] Create web-interface for single user sign in
- [x] Support multiple user log in / store auth keys
- [ ] Create playlist based on musical preferences
- [ ] Process data for visualisation
- [ ] **(bonus):** allow parameters for better recommendation (min. artist, min. numbers, 'danceability (?)', etc…) 
- [ ] **(bonus):** Host service on website
### Front-end
- [ ] Design individual pages (or just yolo it)
- [ ] Pages
- - [ ] Landing page
- - [ ] Invite page
- - [ ] Playlist page
- [ ] Support data visualisation
- [x] Allow sharing of links to others so they can connect to the session (QR?)
- [ ] **(bonus):** show users the overlapping artists, genres etc
- [ ] **(bonus):** add buttons for controlling those parameters
