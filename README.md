This is a project for demoing how censorship works in a variety of countries for ga tech cs 4001 class.


================
Environment setup
================
Install node + npm.

Then, checkout the project

```
git clone https://github.com/pviolette3/freedom-of-speech && cd freedom-of-speech
```
and install packages (once in cloned repo)
```
npm install
```

===========
Running App
===========
To run locally, just
```
node app.js
```
The app binds to localhost:8080, which you can visit in the browser http://localhost:8080/

By default, the app does NOT hook up to mongo db. To activate the database backend,
simply export the envirnment variable ```RUN_MONGO``` to anything except 'no'.

To change the port on which the app runs, set the ```PORT``` environment variable.

=============
Running Tests
=============
Unit tests are written with the mocha framework. To run, install mocha globally
```
npm install -g mocha
```
or add a local installation of mocha to the path. Mocha installs to ```'(freedom of speech dir)/node_modules/mocha/bin'```

To run tests, start in the root of the repository and run
```
mocha -R spec
```

To have mocha automatically run the tests when a file changes, add -G and -w parameters
```
mocha -R spec -G -w
```
