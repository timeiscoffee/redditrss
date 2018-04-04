const express = require('express')
const fetch = require('node-fetch')
const url = require('url');

const app = express()

const REDDIT_URL = 'https://www.reddit.com';

/*
    2 types of filter: 

    1. filter with intger as value, evaluated as minimum value
        ex) `score:100`, `item` need score greater than `100`

    2. filter with string as value, evaluated as contains value
        ex) `selftext_html:hello`, `selftext_html` contains string `hello`
*/
var applyFilters = filters => item => {
    if (!filters) {
        return true;
    }
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];

        var key = Object.keys(filter)[0];
        var value = filter[key];

        var number = Number(value);

        if (Number.isInteger(number)) {
            if (item[key] < number) {
                return false;
            }
        } else if (typeof value === "string") {
            if (item[key].toLowerCase().indexOf(value) === -1) {
                return false;
            }
        }

    }
    return true;
}

var mapItems = (feed, items) => {
    feed.items = items.map(item => {
        return {
            id: item.url,
            link: REDDIT_URL + item.permalink,
            external_url: item.url,
            title: item.title,
            content_text: item.selftext,
            content_html: item.selftext_html,
            image: item.thumbnail.indexOf('http') !== 0 ? null : item.thumbnail
        };
    });
    return feed;
};

app.get('/feed.json', (request, response) => {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

    if (!query.subreddit) {
        response.status(422);
        response.send('subreddit query param required')
    }

    const template = `https://www.reddit.com/r/${query.subreddit}/.json?limit=100`;

    //var items = json.data.children;
    var filters = query.filters && query.filters.split('|').map(i => {
        const result = i.split(':');
        return {
            [result[0]]: result[1]
        };
    });

    const currentUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    const feed = {
        version: 'https://jsonfeed.org/version/1',
        title: 'Reddit JSON RSS feed',
        home_page_url: currentUrl,
        feed_url: currentUrl,
        items: []
    };
    response.setHeader('Content-Type', 'application/json');

    fetch(template).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(json => json.data.children.map(i => i.data).filter(applyFilters(filters)))
        .then(filtered => mapItems(feed, filtered))
        .then(json => response.send(json));
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App started on port ${port}`));