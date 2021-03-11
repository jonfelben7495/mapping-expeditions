# Mapping Expeditions

**Mapping Expeditions** is a web application for presenting historical expeditions on a web map using Leaflet.js, a PHP-based REST API and a relational database.

**Mapping Expeditions** was developed as part of a Digital Humanities course at the University of Cologne. The current build of the project can be seen on [mapping-expeditions.de](http://mapping-expeditions.de/).

## 1. Installation
1. As this application runs on Webpack you first need to install [Node.js](https://nodejs.org/en/).
2. Clone or download this repository.
3. Run `npm install` in the projects root folder using your command terminal. This will install all needed dependencies into a `node_modules` folder.
4. Run `npm start` to run the application on your local server. It should automatically open in your browser under `localhost:3000`.
5. Optionally: Run `npm run build` to create a build package you can use on your server.

## 2. Components

This repository consists of two parts. The JavaScript-based frontend can be found in the `src` folder. The PHP scripts for the REST API can be found in the `api` folder. The REST API is currently running on a server of mine and communicates with a relational database on that same server. You're free to change the PHP and JS files to communicate with a database of yours. A documentation of the database I used can be found in `database-doc.pdf`.

