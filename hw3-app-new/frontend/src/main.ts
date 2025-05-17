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
    
    let curPage = 0;
    let sacStories = [];
    let davisStories = [];

    async function login() {
      console.log("clicked button");
      await fetch("http://127.0.0.1:8000/home")
        .then(response => response.text())
        .then(htmlString => {
          console.log(htmlString);
          document.body.innerHTML = htmlString;
        });
    }

    // Retreive location specific stories given a "page number" -> 10 stories per page
    function getSacStoriesFromBackend(pageNumber: number) {
      return new Promise((resolve) => {
        fetch("http://127.0.0.1:8000/get_stories/sacramento/" + pageNumber)
            .then(response => response.json())
            .then(data => {
              resolve(data.stories);
            })
            .catch(error => {
              console.error("error fetching stories from flask", error);
            });
      });
    }


    function getDavisStoriesFromBackend(pageNumber: number) {
      return new Promise((resolve) => {
        fetch("http://127.0.0.1:8000/get_stories/davis/" + pageNumber)
            .then(response => response.json())
            .then(data => {
              resolve(data.stories);
            })
            .catch(error => {
              console.error("error fetching stories from flask", error);
            });
      });
    }

    function waiting() {
      console.log("waiting for nytimes api to be ready");
    }

    // Gets stories from the two above functions and displays in a grid-like format 
    async function createDom(pageNumber: number) {
        sacStories = await getSacStoriesFromBackend(pageNumber);
        davisStories = await getDavisStoriesFromBackend(pageNumber);
        if (sacStories[0] == "can't load more") {
          setTimeout(waiting, 12000)
          sacStories = await getSacStoriesFromBackend(pageNumber);
          davisStories = await getDavisStoriesFromBackend(pageNumber);
        } 
        if (davisStories[0] == "can't load more") {
          setTimeout(waiting, 12000)
          sacStories = await getSacStoriesFromBackend(pageNumber);
          davisStories = await getDavisStoriesFromBackend(pageNumber);
        }
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
        if (endOfPage && curPage <= 10) {
            curPage++;
            createDom(curPage);
        }
    });

    //Prevent scroll from getting called multiple times within 400 milliseconds of each other
    function debounce(func: { (): void; apply?: any }, timeout = 400) {
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
        let login_button = document.getElementById("login_button");
        login_button.addEventListener("click", login)
    }
})();