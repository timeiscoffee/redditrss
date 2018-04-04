const express = require('express')
const fetch = require('node-fetch')
const url = require('url');
const Feed = require('feed');

const app = express()

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

var getFeed = (feed, items) => {
    items.forEach(item => {
        feed.addItem({
            title: item.title,
            id: item.url,
            link: item.url,
            content: item.selftext_html
        })
    });
}

app.get('/', (request, response) => {
    // var url_parts = url.parse(request.url, true);
    // var query = url_parts.query;

    // if (!query.subreddit) {
    //     response.status(422);
    //     response.send('subreddit query param required')
    // }

    // const template = `https://www.reddit.com/r/${query.subreddit}/.json?limit=100`;

    // //var items = json.data.children;
    // var filters = query.filters && query.filters.split('|').map(i => {
    //     const result = i.split(':');
    //     return {
    //         [result[0]]: result[1]
    //     };
    // });

    // const feed = new Feed({
    //     title: 'Feed Title',
    //     description: 'This is my personal feed!'
    // });
    // //return; 
    // fetch(template).then(res => res.json())
    //     .catch(error => console.error('Error:', error))
    //     .then(json => json.data.children.map(i => i.data).filter(applyFilters(filters)))
    //     .then(filtered => { getFeed(feed, filtered); return feed.json1(); })
    //     .then(json => response.send(json));

    response.send("hello world");
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App started on port ${port}`));