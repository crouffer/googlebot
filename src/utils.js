/* eslint no-restricted-syntax: "off" */

export const isMessage = event => Boolean(event.type === 'message' && event.text);

export const isMessageToChannel = message => typeof message.channel === 'string' && message.channel[0] === 'C';

export const isFromUser = (event, userId) => event.user === userId;

export const messageContainsText = (message, possibleTexts) => {
    const messageText = message.text.toLowerCase();
    const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
    for (const text of texts) {
        if (messageText.indexOf(text.toLowerCase()) > -1) {
            return true;
        }
    }

    return false;
};

export const messageStartsWithText = (message, possibleTexts) => {
    const messageText = message.text.toLowerCase();
    const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
    for (const text of texts) {
        if (messageText.startsWith(text.toLowerCase())) {
            return true;
        }
    }

    return false;
};

export const filterResponsesByCategories = (responses, categories) => responses.filter((responses) => {
    if (responses.categories.length === 0) {
        return true;
    }

    for (const category of categories) {
        if (responses.categories.includes(category)) {
            return true;
        }
    }

    return false;
});

export const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

export const googleSearch = (searchString) => {
    return new Promise((resolve, reject) => {
        var request = require('request');

        // Example: https://www.google.ca/search?q=what+is+today%27s+date&oq=what+is+today%27s+date
        var queryStringFields = {
            q: searchString
        };
        var requestArgs = {
            url: 'https://www.google.com/search',
            qs: queryStringFields
        };

        request(requestArgs,
            function(err, response, body) {
                if (err) {
                    reject();
                } else {
                    resolve(body);
                }
            });
    });
};