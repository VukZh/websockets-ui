> Static http server and base task packages.
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage

`npm run start` | Run client `http://localhost:8181`
`npm run start:nodemon server` | App served @ `http://localhost:8181` with nodemon
`npm run start:server` | App served @ `http://localhost:8181` without nodemon

User verification rules:
- the username is checked against the password if a user with the same name is already in the database
- the user’s activity is checked, if he is currently playing, then logging in under the same name and password is prohibited

