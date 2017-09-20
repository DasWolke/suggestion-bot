"use strict";
/**
 * Basic helper function to get a username in a username#discrim format
 * @param user - The user object
 * @returns {string}
 */
module.exports.getUserNameDiscrim = (user) => {
    return `${user.username}#${user.discriminator}`
};