![Howler Logo](https://s3.amazonaws.com/fugitive-labs/yote/Howler-02.png)

Welcome to Yote!
======

Yote is the best super-stack solution out there for any data-driven application.  

```
$ (sudo) npm install -g yote
```



## The Super Stack
****  

> **WTH is a super-stack solution?**  Glad you asked.  A 'super-stack' is a made up term for a solution that provides a web application, native mobile apps, and api services out of the box.

Yote should always be the most comprehensive and flexible stack available. Right now that stack looks like this:

- **Database**
  * [Mongo](http://www.mongodb.org/)
  * [Mongoose](http://mongoosejs.com/)
- **Server/API**
  * [Node](https://nodejs.org/)
  * [Express](http://expressjs.com/)
  * [Passport](http://passportjs.org/)
  * [Docker](https://www.docker.com/)
- **Client**
  * [React](https://reactjs.com/)
  * [React-Router](https://reacttraining.com/react-router/)
  * [Redux](https://redux.js.org/)
- **Mobile**
  * [React Native](http://www.reactnative.com/)
  * [Redux again](https://redux.js.org/)

We're not married to it, however. Yote originally used AngularJS as the client. As our average project complexity grew, we looked for a more performant solution and found it in React/Flux. Then we discovered Redux (which is awesome)... and so on.

If at some point in the future Vue.js or some other new fangled thing proves itself to be better in the wild, we reserve the right to switch things around.  

> We'll do our best to support older versions through the CLI, but ultimately Yote is forward-looking in nature



## Philosophy
****

Yote itself is not a framework. It's not even really a library. Our idea is to simply take the best practices of the best frameworks and services available and package them up together in one place. Yote may change the nuts and bolts from time to time but the general philosophy will remain the same: Yote will always provide client-agnostic services and server-agnostic clients that are **FLEXIBLE**, **EXTENDABLE**, and **PERFORMANT** out of the box.  The overall goal is to help developers roll out production ready super-stack solutions as quickly and painlessly as possible.  




## Prerequisites
****

We assume at least intermediate-level knowledge of Javascript. For the server you'll need to [MongoDB](https://docs.mongodb.com/master/tutorial/install-mongodb-on-os-x/?_ga=1.204328082.326616756.1489430903) installed and running, and [NodeJS >= v20.19.1](https://nodejs.org/en/). For the web client and mobile, it's best to have at least a basic understanding of [ReactJS](https://reactjs.com/) and [Redux Toolkit](https://redux-toolkit.js.org/).
> In YOTE, we (mis)use Redux Toolkit to maintain a current cache of the server data structured as a normalized state. This is a bit of a departure from the typical use of Redux, but we've found it to be a very powerful pattern for efficiently managing data fetching and mutation. [Read more about our state management pattern here](https://github.com/yoteapp/yote/blob/main/web/CRUD_ACTIONS_README.md).


## Basic Usage
****

1. Make sure you have MongoDB installed, [instructions here](https://docs.mongodb.com/manual/administration/install-community/), and have a **mongo server running locally** on the default port.

	```
	$[~] mongod --dbpath /path/to/data/db
	```

2. **Install dependencies...**

Clone this repository and install dependencies for the main dir and the server and web apps:
From the root of the project, run:

```
$ npm run install:all
```

3. **Start the app (dev mode)...**

From the root of the project, run:

```
$ npm run start
```

This will start both the server and the frontend using ViteExpress. You should see output similar to:
```
...
Example app listening at localhost:3233
```

4. In your browser, navigate to [http://localhost:3233](http://localhost:3233) and you should see the "Welcome to Yote" screen.


## Documentation
****

See the full docs at [fugitivelabs.github.io/yote/](https://fugitivelabs.github.io/yote/)


## Contributing
****

Yote was initially built by Fugitive Labs for Fugitive Labs. We simply wanted a tool to improve our work. But we think other folks can find it useful too.  We encourage you to contribute. Improvements in mind, please feel free to open a pull request.


## License
****

All super-stack components are released individually under various open source licenses.  Please refer to their documentation for specific licenses.

Yote itself is released under the [MIT License](http://www.opensource.org/licenses/MIT).
