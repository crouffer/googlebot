import { RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS } from '@slack/client';
import {
    isMessage,
    isFromUser,
    messageStartsWithText,
    messageContainsText,
    pickRandom,
    filterResponsesByCategories
} from './utils';
import responses from './data/responses';
import pictures from './data/pictures';

const defaultOptions = {
    triggerOnWords: ['googlebot'],
    specialCategories: ['polite', 'condescending', 'rude'],
    messageColor: '#590088',
    logger: console,
    rtmOptions: {},
};

const googlebot = (botToken, options = {}) => {
    let botId;

    const opt = Object.assign({}, defaultOptions, options);
    const rtm = new RtmClient(botToken, opt.rtmOptions);
    const web = new WebClient(botToken);

    const allowedResponses = filterResponsesByCategories(responses, opt.specialCategories);
    rtm.on(RTM_EVENTS.MESSAGE, (event) => {
        var botName = '<@' + botId + '>';
        var isDirectMessage = event.channel[0] === 'D';

        if (
            isMessage(event) &&
            !isFromUser(event, botId) &&
            (isDirectMessage || messageContainsText(event, [botName]))
        ) {
            const msgOptions = {
                as_user: true,
                attachments: [{
                    color: opt.messageColor
                }, ],
            };

            var firstSpace = event.text.indexOf(' ');
            if ((!messageStartsWithText(event, botName) ||
                    firstSpace === -1) &&
                !isDirectMessage) {
                msgOptions.attachments[0].text = 'What do you want?';
            } else {
                var searchString = event.text.substr(event.text.indexOf(' ') + 1);
                const response = pickRandom(allowedResponses);
                msgOptions.attachments[0].pretext = response.text;

                var text = 'https://www.google.com/search?q=' + encodeURIComponent(searchString);
                msgOptions.attachments[0].text = text;
            }

            if (opt.usePictures) {
                msgOptions.attachments[0].image_url = pickRandom(pictures);
            }

            web.chat.postMessage(event.channel, '', msgOptions);
            opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
        }
    });

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
        botId = rtmStartData.self.id;
        opt.logger.info(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
    });

    return {
        rtm,
        web,
        start() { rtm.start(); },
    };
};

export default googlebot;