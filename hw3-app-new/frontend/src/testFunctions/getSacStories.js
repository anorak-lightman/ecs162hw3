// Retreive Sacramento Stories from NYT Search API

let SacUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento fq=timesTag.subject:"Sacramento" AND timesTag.location:"California"&api-key=';

async function getSacStories(pageNumber) {
    const key = 'rFSzaY1UbSRUSoBOt6lsYpXubk49bygA';
    return new Promise((resolve) => {
        fetch(SacUrl + key + "&page=" + pageNumber)
            .then(response => response.json())
            .then(data => {
                resolve(data.response.docs);
            })
            .catch(error => {
                console.error("error getting sacramento stories", error);
            });
    });
}

module.exports = getSacStories;