# quicklink-bot

## Description
A simple Discord bot that stores URLs and text

## Commands
Using the prefix '$':
- `mkcol` : initializes collection for the serverid, and is required to exist
- `rmcol` : deletes the serverid collection from database
- `add [title] [text]` : adds entry into the collection
- `rm [title]` : removes entry from collection
- `ls [page number]` : returns entries in blocks of 15
- `grep [text]` : returns entries that contain text
- `sid` : returns the server's id
- `help` : returns list of commmands

## Dependencies
- node.js version 10.X.X 
- discord.js

## Installation Process
- Install node.js latest stable release
- For macOS, check if node exists by running `node -v`

- If node does not exist :
	- Go to nodejs.org and download the latest version
- If node exists :
	- Update node by `npm i -g npm` or `sudo npm i -g npm`
- Create a dedicated project folder with `mkdir 'project-name'` and then cd into it
- Run `npm init` and ignore the `package.json` and questions if confused 
- Run `npm install discord.js`

## Running the Application
- Initially ran with `node app.js`, but only lasted as long as node was running
- Now hosted on heroku to run 24/7

