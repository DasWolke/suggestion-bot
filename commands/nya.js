'use strict';
//Load the version from the package.json file
const version = require('../package.json').version;
//Declare the config version
let cmd = (msg, config) => {
    //Create an embed object with name, description, an image, the version and credits
    let embed = {
        title: config.name,
        description: config.infoDescription,
        color: 1742788,
        image: {
            url: config.infoImageUrl
        },
        fields: [{
            name: "version",
            value: `${version}`
        },
            {
                name: "Made by",
                value: "Wolke"
            }
        ]
    };
    //Actually send the embed to the channel the message originated from
    return msg.channel.createMessage({
        embed
    });
};
//export the command function and the name of the command
module.exports = {
    run: cmd,
    cmd: 'nya'
};
