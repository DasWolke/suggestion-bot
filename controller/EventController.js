'use strict';
//Require the various commands
const ping = require('../commands/ping.js');
const nya = require('../commands/nya.js');
const suggestion = require('../commands/suggestion');

//Declare the event controller class
class EventController {
    constructor(prefix, config, bot) {
        //Set prefix, config and the bot as class variables
        this.prefix = prefix;
        this.config = config;
        this.bot = bot;
    }

    /**
     * Handles eventual commands executions based on the message received
     * Gets run on every new message
     * @param msg - A Eris Message Object
     * @returns {Promise}
     */
    async onMessage(msg) {
        //Fetch the mentions for the bot as a member and as a user
        let botMember = msg.channel.guild.members.find(m => m.id === this.bot.user.id);
        let memberMention = botMember.mention;
        let userMention = this.bot.user.mention;
        //Check if the message starts with the configured prefix and if mention is accepted as prefix check for mentions of the bot
        if (!msg.content.startsWith(this.prefix) && (!this.config.useMentionPrefix || (!msg.content.startsWith(memberMention) && !msg.content.startsWith(userMention)))) {
            return;
        }
        //Split the content of the message by spaces
        let msgSplit = msg.content.split(' ');
        //if the message does not contain a command do nothing
        if (msgSplit.length === 1) {
            return;
        }
        //Switch through the possible commands
        try {
            switch (msgSplit[1]) {
                //Run the ping command
                case 'ping':
                    await ping.run(msg, this.config);
                    break;
                //Run the nya command
                case 'nya':
                    await nya.run(msg, this.config);
                    break;
                //Run the suggestion command
                case 'suggestion':
                    await suggestion.run(msg, this.config, this.bot);
                    break;
                //Do nothing if the message contains anything else
                default:
                    break;
            }
        } catch (e) {
            //Log any errors that may occur to the console
            console.error(`Error in commands: ${e}`);
        }

    }
}
//Export the class
module.exports = EventController;
