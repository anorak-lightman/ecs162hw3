function populateStories(header, snippet, image, link1, link2, story) {
    header.innerText = story.headline.main;
    snippet.innerText = story.snippet;
    image.src = story.multimedia.default.url;
    image.width = story.multimedia.default.width;
    image.height = story.multimedia.default.height;
    link1.href = story.web_url;
    link2.href = story.web_url;
}
module.exports = populateStories;