This is a project for demoing how censorship works in a variety of countries for ga tech cs 4001 class.


================
Install overview
================
We will install node version manager, then app specific packages.

This is automated for you. All you need to do is
````
sudo bash install.sh
````

Overview of the steps:

The steps will be
1) sudo apt-get install curl #install curl if necessary
2) curl https://raw.github.com/creationix/nvm/master/install.sh | sh
3) source ~/.profile
4) nvm install 0.10
5) npm install

=======
Running
=======
To run locally, just
node app.js
