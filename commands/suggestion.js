"use strict";
const SuggestionController = require('../controller/SuggestionController');
let suggestionController = new SuggestionController();
let helper = require('../utils/helper');
let createSuggestionEmbed = (suggestion, created = false) => {
    let fields = [
        {name: 'id', value: suggestion.id, inline: true},
        {name: 'state', value: suggestion.state, inline: true}
    ];
    if (suggestion.state !== 'created') {
        if (suggestion.modId) {
            fields.push({name: 'Mod', value: suggestion.moderator})
        }
    }
    fields.push({name: 'Content', value: `\`\`\`${suggestion.content.substring(0, 1000)}\`\`\``});
    if (suggestion.content.length > 1000) {
        fields.push({name: '--------', value: `\`\`\`${suggestion.content.substring(1000, 2000)}\`\`\``});
    }
    return {
        title: `${created ? 'New ' : ''}Suggestion by ${suggestion.creator}(${suggestion.creatorId})`,
        color: 120564,
        fields
    };
};
let createSuggestionListEmbed = (suggestions, page, maxPage) => {
    let fields = [];
    for (let suggestion of suggestions) {
        fields.push({
            name: `Suggestion ${suggestion.id}`, value: `\`\`\`
id: ${suggestion.id}
Made by: ${suggestion.creator}(${suggestion.creatorId})
State: ${suggestion.state}${suggestion.state !== 'created' ? '\nMod: ' + suggestion.moderator : ''}\`\`\``
        })
    }
    return {
        title: `Suggestion list Page ${page}/${maxPage}`,
        color: 120564,
        fields
    }
};
let parseNumber = (number) => {
    let parsedNumber = parseInt(number);
    if (isNaN(parsedNumber)) {
        throw new Error('Not a number');
    }
    return parsedNumber;
};
let acceptOrDenySuggestion = async (msg, msgSplit, config, type) => {
    if (msg.member.roles.indexOf(config.suggestionMod) === -1) {
        return msg.channel.createMessage('You are not allowed to use this command');
    }
    if (msgSplit.length === 3) {
        return msg.channel.createMessage('You have to add the id of the suggestion you want to accept, alternatively use list to get a list of suggestions');
    }
    let id = 0;
    try {
        id = parseNumber(msgSplit[3]);
    } catch (e) {
        return msg.channel.createMessage('Please use a numeric id.');
    }
    let suggestion = await suggestionController.getSuggestion(id);
    if (!suggestion) {
        return msg.channel.createMessage(`Suggestion with id ${id} could not be found`);
    }
    if (type === 'accept') {
        await suggestionController.acceptSuggestion(suggestion.id, msg.author);
    } else {
        await suggestionController.declineSuggestion(suggestion.id, msg.author);
    }
    suggestion = await suggestionController.getSuggestion(id);
    try {
        let notificationChannel = msg.channel.guild.channels.get(config.suggestionChannel);
        if (notificationChannel) {
            let notificationMessage = await notificationChannel.getMessage(suggestion.notificationId);
            if (notificationMessage) {
                await notificationMessage.edit({content: '', embed: createSuggestionEmbed(suggestion)})
            }
        }
    } catch (e) {
        console.error(e);
    }
    return msg.channel.createMessage(`Successfully ${type === 'accept' ? 'accepted' : 'denied'} suggestion ${suggestion.id}`);
};
let cmd = async (msg, config, client) => {
    let msgSplit = msg.content.split(' ');
    if (msgSplit.length === 2) {
        return msg.channel.createMessage('**Commands**\nYou can either **create** a sugestion\nGet a **list** of the newest suggestions\n**View** a suggestion by **id**\n**Accept** a suggestion by **id**\n**Deny** a suggestion by **id**')
    }
    if (msgSplit.length >= 3) {
        switch (msgSplit[2]) {
            case 'create': {
                if (msgSplit.length === 3) {
                    return msg.channel.createMessage('Oops, it seems like you did not add a Suggestion');
                }
                let content = msgSplit.splice(3).join(' ');
                let notificationMessage = await client.createMessage(config.suggestionChannel, `New Suggestion by ${helper.getUserNameDiscrim(msg.author)}`);
                let suggestion = await suggestionController.createSuggestion(content, msg.author, notificationMessage.id);
                await notificationMessage.edit({content: '', embed: createSuggestionEmbed(suggestion, true)});
                return msg.channel.createMessage(`Your suggestion was created successfully and has the id: **${suggestion.id}**`);
            }
            case 'show': {
                if (msgSplit.length === 3) {
                    return msg.channel.createMessage('You have to add the id of the suggestion you want to see, alternatively use list to get a list of suggestions');
                }
                if (msg.member.roles.indexOf(config.suggestionMod) === -1) {
                    return msg.channel.createMessage('You are not allowed to use this command');
                }
                let id = 0;
                try {
                    id = parseNumber(msgSplit[3]);
                } catch (e) {
                    return msg.channel.createMessage('Please use a numeric id.');
                }
                let suggestion = await suggestionController.getSuggestion(id);
                if (!suggestion) {
                    return msg.channel.createMessage(`Suggestion with id ${id} could not be found`);
                }
                return msg.channel.createMessage({embed: createSuggestionEmbed(suggestion)});
            }
            case 'list': {
                if (msg.member.roles.indexOf(config.suggestionMod) === -1) {
                    return msg.channel.createMessage('You are not allowed to use this command');
                }
                let page = 1;
                if (msgSplit.length === 4) {
                    try {
                        page = parseInt(msgSplit[3])
                    } catch (e) {
                        page = 0;
                    }
                }
                let maxPage = await suggestionController.maxSuggestionPage();
                if (page > maxPage) {
                    return msg.channel.createMessage('This page does not exist.');
                }
                let suggestions = await suggestionController.listSuggestion(page - 1);
                return msg.channel.createMessage({embed: createSuggestionListEmbed(suggestions, page, maxPage)});
            }
            case 'accept': {
                return acceptOrDenySuggestion(msg, msgSplit, config, 'accept');
            }
            case 'deny': {
                return acceptOrDenySuggestion(msg, msgSplit, config, 'deny');
            }
            default:
                return msg.channel.createMessage('**Commands**\nYou can either **create** a sugestion\nGet a **list** of the newest suggestions\n**View** a suggestion by **id**\n**Accept** a suggestion by **id**\n**Deny** a suggestion by **id**')
        }
    }
};
module.exports = {run: cmd, cmd: 'suggestion'};