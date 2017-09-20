'use strict';
//Require Dependencies
const Eris = require('eris');
const EventController = require('./controller/EventController');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
//Require the config
const config = require('./config/config.json');
//Create a new Bot Instance
let bot = new Eris(config.token, config.erisOptions);
//Create a new Event Controller
let eventController = new EventController(config.prefix, config, bot);
//Async launch function so we can await the database connect
let launch = async () => {
    //Connect to the database (mongodb)
    //If this fails the bot process dies since the bot won't work without a database
    try {
        await mongoose.connect(config.dbUrl, {useMongoClient: true});
    } catch (e) {
        console.error('Unable to connect to Mongo Server.');
        return process.exit(1);
    }
    console.log('Connected to MongoDB');
    //Attach event handlers for ready, error and messageCreate
    //Set the status on ready
    //This may not work atm since eris is not fully up to date yet.
    bot.on('ready', () => {
        bot.editStatus('online', {game: {name: config.statusName, type: 0}});
        console.log('Successfully connected to Discord');
    });
    //Handle any errors coming from the bot itself and log them
    bot.on('error', (e) => {
        console.error(e);
    });
    //Run the event controller on incoming messages and print any errors that may occur to console
    bot.on('messageCreate', (msg) => {
        eventController.onMessage(msg).catch(e => console.error(e));
    });
    //Start the connect to discord
    bot.connect();
    console.log('Connecting to Discord..')
};
//Launches the bot
launch().then(() => {
    console.log('Launched Bot successfully');
}).catch(e => console.error(e));
