import { RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS } from '@slack/client';
import {
    isMessage,
    isFromUser,
    messageContainsText,
    pickRandom,
    filterResponsesByCategories
} from './utils';
import responses from './data/responses';
import pictures from './data/pictures';

const defaultOptions = {
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
        if (
            isMessage(event) &&
            //isMessageToChannel(event) &&
            !isFromUser(event, botId) &&
            messageContainsText(event, opt.triggerOnWords)
        ) {
            const response = pickRandom(allowedResponses);
            const msgOptions = {
                as_user: true,
                attachments: [{
                    color: opt.messageColor,
                    title: response.text,
                }, ],
            };

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