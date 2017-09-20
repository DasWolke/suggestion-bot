'use strict';

let cmd = (msg) => {
    return new Promise((res, rej) => {
        let start = msg.timestamp;
        msg.channel.createMessage('pong').then(sendedMsg => {
            let diff = (sendedMsg.timestamp - start);
            sendedMsg.edit(`pong \`${diff}ms\``);
            res();
        }).catch(e => rej(e));
    });
};
module.exports = {
    run: cmd,
    cmd: 'ping'
};
