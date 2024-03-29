# my little world

The template includes both the *app* and *server* directories. The *app* consists of [Phaser3](https://phaser.io/phaser3) with a [React](https://reactjs.org/) wrapper. Phaser is a 2D game framework used for making HTML5 games for desktop and mobile. React is used for an intuitive main menu UI, as well as giving access to custom hooks for a more smooth Web3 / Aavegotchi integration.

The *server* consists of *nodejs* and *express* and it utilises [socket.io](https://socket.io/) to enable web socket functionality within the game. This is necessary to enable multiplayer. However it is also required for single player games, as it allows for server side logic to prevent people using client side dev tools to intercept and send false data to your games leaderboard (If you have one set up that is).

## Dev dependencies needed

* [ts-node](https://github.com/TypeStrong/ts-node)
* [Node >= 10.16 and npm >= 5.6](https://nodejs.org/en/)

## Getting started

To run the app, you need to serve both the *server* and the *app* on your local machine. In one terminal run:
```
cd <mini-world-project>/server
npm install
npm run start
```

Then inside another terminal run
```
cd <mini-world-project>/app
npm install
npm run start
```

Your server by default will run on [http://localhost:443](http://localhost:443) and your app will run on [http://localhost:3000/](http://localhost:3000/).

<p>&nbsp;</p>

## Available Scripts

### In the project app directory, you can run:

#### `npm run start`

This will allow you to runs the app in the development mode.

The page will reload if you make edits.\
You will also see any lint errors in the console.

<p>&nbsp;</p>

#### `npm run start:offchain`

This will allow you to runs the app in the development mode without the need of a web3 connection

<p>&nbsp;</p>

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
<p>&nbsp;</p>


### In the project server directory, you can run:

#### `npm run start`

This will allow you to runs the server in the development mode.


<p>&nbsp;</p>

#### `npm run start:prod`

This will allow you to runs the server in production mode. Ensure this is command you run when you deploy your server on a virtual machine.

