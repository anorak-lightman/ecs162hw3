import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app


"use strict";
(function() {
    // Date: Display current date
    function displayDate() {
        let todaysDate = new Date();
        const format = {weekday : "long", month: "long", day: "numeric", year: "numeric"};
        const formattedDate = todaysDate.toLocaleDateString('en-US', format);

        document.getElementById("formattedDate").innerText = formattedDate;
        console.log(formattedDate);
    }

    // Grab location specific articles
    let SacUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Sacramento fq=timesTag.subject:"Sacramento" AND timesTag.location:"California"&api-key=';
    let DavisUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="UC Davis"&api-key=';
    let curPage = 0;
    let sacStories = [];
    let davisStories = [];

    function fetchKey() {
        return new Promise((resolve) => {
            fetch("http://127.0.0.1:8000/api/key")
                .then(response => response.json())
                .then(data => {
                    resolve(data.apiKey);
                })
                .catch(error => {
                    console.error("error fetching key", error);
                });
        });
    }

    // Retreive location specific stories given a "page number" -> 10 stories per page
    async function getSacStories(pageNumber: string) {
        const key = await fetchKey();
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

    async function getDavisStories(pageNumber: string) {
        const key = await fetchKey();
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

    // Gets stories from the two above functions and displays in a grid-like format 
    async function createDom(pageNumber: number) {
        sacStories = await getSacStories(pageNumber);
        davisStories = await getDavisStories(pageNumber);
        for (let i = 0; i < 5; i++) {
            let col = document.getElementsByClassName("row1col left-col")[0];

            let gridElement = document.createElement("div");
            gridElement.className = "grid-element left-grid";
            col.appendChild(gridElement)

            let link1= gridElement.appendChild(document.createElement("a"));
            let img = link1.appendChild(document.createElement("img"));
            let link2 = gridElement.appendChild(document.createElement("a"));
            let header = link2.appendChild(document.createElement("h2"));
            header.className = "articleHeader";
            gridElement.appendChild(document.createElement("br"));
            let snippet = gridElement.appendChild(document.createElement("p"));
            snippet.className = "left-col1";
            let hr = gridElement.appendChild(document.createElement("hr"));
            hr.className = "hr-center";
            populateStories(header, snippet, img, link1, link2, sacStories[i]);
        }
        for (let i = 5; i < 10; i++) {
            let col = document.getElementsByClassName("row1col center-col")[0];

            let gridElement = document.createElement("div");
            gridElement.className = "grid-element center-grid";
            col.appendChild(gridElement)

            let link1= gridElement.appendChild(document.createElement("a"));
            let img = link1.appendChild(document.createElement("img"));
            let link2 = gridElement.appendChild(document.createElement("a"));
            let header = link2.appendChild(document.createElement("h2"));
            header.className = "articleHeader";
            gridElement.appendChild(document.createElement("br"));
            let snippet = gridElement.appendChild(document.createElement("p"));
            snippet.className = "center-col";
            let hr = gridElement.appendChild(document.createElement("hr"));
            hr.className = "hr-center";
            populateStories(header, snippet, img, link1, link2, sacStories[i]);
        }
        for (let i = 0; i < 5; i++) {
            let col = document.getElementsByClassName("row1col right-col")[0];

            let gridElement = document.createElement("div");
            gridElement.className = "grid-element right-grid";
            col.appendChild(gridElement)

            let link1= gridElement.appendChild(document.createElement("a"));
            let img = link1.appendChild(document.createElement("img"));
            let link2 = gridElement.appendChild(document.createElement("a"));
            let header = link2.appendChild(document.createElement("h2"));
            header.className = "articleHeader";
            gridElement.appendChild(document.createElement("br"));
            let snippet = gridElement.appendChild(document.createElement("p"));
            snippet.className = "right-top";
            let hr = gridElement.appendChild(document.createElement("hr"));
            hr.className = "hr-center";
            populateStories(header, snippet, img, link1, link2, davisStories[i]);
        }
    }

    //Populates html elements with information from story
    function populateStories(header: HTMLHeadingElement, snippet: HTMLParagraphElement, image: HTMLImageElement, link1: HTMLAnchorElement, link2: HTMLAnchorElement, story: { headline: { main: any }; snippet: any; multimedia: { default: { url: any; width: any; height: any } }; web_url: any }) {
        header.innerText = story.headline.main;
        snippet.innerText = story.snippet;
        image.src = story.multimedia.default.url;
        image.width = story.multimedia.default.width;
        image.height = story.multimedia.default.height;
        link1.href = story.web_url;
        link2.href = story.web_url;
    }

    //Infinate Scroll (not that infinite due to api calling time limits and restrictions)
    const loadMorePagesOnScroll = debounce(() => {
        const endOfPage = window.innerHeight + window.pageYOffset + 2500 >= document.body.offsetHeight;
        if (endOfPage && curPage <= 3) {
            curPage++;
            createDom(curPage);
        }
    });

    //Prevent scroll from getting called multiple times within 200 milliseconds of each other
    function debounce(func: { (): void; apply?: any }, timeout = 200) {
        let timer: number | undefined;
        return function(...args: any) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(context, args); }, timeout);
        };
    }

    window.addEventListener("load", init);
    displayDate();
    createDom(curPage);
    function init() {
        window.addEventListener("scroll", loadMorePagesOnScroll);
    }
})();