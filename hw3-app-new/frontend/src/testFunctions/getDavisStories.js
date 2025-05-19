// Retreive Davis stories from NYT Search API

let DavisUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="UC Davis"&api-key=';
async function getDavisStories(pageNumber) {
    const key = 'rFSzaY1UbSRUSoBOt6lsYpXubk49bygA';
    return new Promise((resolve) => {
        fetch(DavisUrl + key + "&page=" + pageNumber)
            .then(response => response.json())
            .then(data => {
                resolve(data.response.docs);
            })
            .catch(error => {
                console.error("error getting davis stories", error);
            });
    });
}

module.exports = getDavisStories;