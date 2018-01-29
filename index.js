/*
 CONGRATULATIONS on creating your first Botpress bot!

 This is the programmatic entry point of your bot.
 Your bot's logic resides here.

 Here's the next steps for you:
 1. Read this file to understand how this simple bot works
 2. Read the `content.yml` file to understand how messages are sent
 3. Install a connector module (Facebook Messenger and/or Slack)
 4. Customize your bot!

 Happy bot building!

 The Botpress Team
 ----
 Getting Started (Youtube Video): https://www.youtube.com/watch?v=HTpUmDz9kRY
 Documentation: https://docs.botpress.io/
 Our Slack Community: https://slack.botpress.io
 */
var moment = require('moment');
var storage = require('node-persist');
var request = require('request');
const pug = require('pug');
storage.initSync();
moment().format();


module.exports = function (bp) {




    var router = bp.getRouter('botpress-api',{ auth: false });
    router.get('/tokens.json', (req, res, next) => {
        res.json(loadCarouselData());
    })
    // Listens for a first message (this is a Regex)
    // GET_STARTED is the first message you get on Facebook Messenger
    bp.hear(/GET_STARTED|hello|hi|test|hey|holla/i, (event, next) => {
        bp.subscription.subscribe('facebook:'+event.user.id,"DAILY_TOKEN_PRICE")
            .then(()=>{
                bp.subscription.getSubscribed('facebook:'+event.user.id)
                    .then(res=>{
                        console.log(res);
                        console.log(event.user.id);
                    })
            })
            })


    bp.hear({platform: 'facebook', type: /postback|quick_reply/i, text: 'MenuTokenPrices'}, (event, next) => {
        event.reply('#tokenList', {tokens: loadCarouselData()})

    })

    bp.hear({
        type: /message|text/i,
        text: /Token prices/i
    }, (event, next) => {
        event.reply('#tokenList', {tokens: loadCarouselData()})
    })


    // You can also pass a matcher object to better filter events
    bp.hear({
        type: /message|text/i,
        text: /exit|bye|goodbye|quit|done|leave|stop/i
    }, (event, next) => {
        event.reply('#goodbye', {
            // You can pass data to the UMM bloc!
            reason: 'unknown'
        })
    })

    bp.hear({
        type: /message|text/i,
        text: /Eu Token/i
    }, (event, next) => {
        loadData();
        var token_test = storage.getItemSync("EU_Token");
        event.reply('#token-info-generic', {
            token_price: token_test,
            region: 'EU'
        })
    })

    bp.hear({
        type: /message|text/i,
        text: /KR Token/i
    }, (event, next) => {
        loadData();
        var token_test = storage.getItemSync("KR_Token");
        event.reply('#token-info-generic', {
            token_price: token_test,
            region: 'KR'
        })
    })

    bp.hear({
        type: /message|text/i,
        text: /TW Token/i
    }, (event, next) => {
        loadData();
        var token_test = storage.getItemSync("TW_Token");
        event.reply('#token-info-generic', {
            token_price: token_test,
            region: 'TW'
        })
    })

    bp.hear({
        type: /message|text/i,
        text: /NA Token/i
    }, (event, next) => {
        loadData();
        var token_test = storage.getItemSync("NA_Token");
        event.reply('#token-info-generic', {
            token_price: token_test,
            region: 'NA'
        })
    })

    function loadData() {
        var lastUpdate = storage.getItemSync('lastUpdate');
        if (lastUpdate == null || (moment().diff(lastUpdate, 'minutes') > 20)) {
            request('https://data.wowtoken.info/wowtoken.json', function (error, response, body) {
                var json = JSON.parse(body);
                storage.setItemSync('lastUpdate', moment());
                storage.setItemSync('TW_Token', json.update.TW.formatted.buy);
                storage.setItemSync('NA_Token', json.update.NA.formatted.buy);
                storage.setItemSync('EU_Token', json.update.EU.formatted.buy);
                storage.setItemSync('KR_Token', json.update.KR.formatted.buy);

            });
        } else if (lastUpdate != null && (moment().diff(lastUpdate, 'minutes') < 20)) {
            console.log("Data is cached");
        }
    }

    function loadCarouselData() {
        var lastUpdate = storage.getItemSync('lastUpdate');
        if (lastUpdate == null || (moment().diff(lastUpdate, 'minutes') > 20)) {
            request('https://data.wowtoken.info/wowtoken.json', function (error, response, body) {
                var json = JSON.parse(body);
                storage.setItemSync('lastUpdate', moment());
                storage.setItemSync('TW_Token', json.update.TW.formatted.buy);
                storage.setItemSync('NA_Token', json.update.NA.formatted.buy);
                storage.setItemSync('EU_Token', json.update.EU.formatted.buy);
                storage.setItemSync('KR_Token', json.update.KR.formatted.buy);


            });
        } else if (lastUpdate != null && (moment().diff(lastUpdate, 'minutes') < 20)) {
            console.log("Data is cached");
        }

        var tokens = [
            {
                name: 'EU token',
                price: storage.getItemSync('EU_Token')
            },
            {
                name: 'NA token',
                price: storage.getItemSync('NA_Token')
            },
            {
                name: 'TW token',
                price: storage.getItemSync('TW_Token')
            },
            {
                name: 'KR token',
                price: storage.getItemSync('KR_Token')
            },
        ];

        return tokens;
    }


    function subscribe() {

    }
}
