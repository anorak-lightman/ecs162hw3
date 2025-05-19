import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app


"use strict";
(async function() {
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
    let allStories = [];

    let myInterval = null;
    let user = null;
    myInterval = setInterval(check_signed_in, 1000);
    async function get_user_type() {
      await fetch("http://localhost:8000/get_user_type", {method: 'GET', credentials: 'include',})
        .then(response => response.json())
        .then(data => {
          let user_type = data.user_type;
          if (user_type === "admin") {
            user = "admin";
          } else if (user_type === "moderator") {
            user = "moderator";
          } else {
            user = "user";
          }
          clearInterval(myInterval);
          let login_button = document.getElementById("login_button");
          login_button.innerText = "Logout";
          login_button.removeEventListener('click', login);
          login_button.addEventListener("click", logout);
        })
        .catch(error => {
          console.error("error getting user type", error);
        });
    }

    async function logout() {
      await fetch ("http://localhost:8000/logout", {method: 'GET', credentials: 'include',})
        .then(res => {
          if (res.ok) {
            let login_button = document.getElementById("login_button");
            login_button.removeEventListener("click", logout);
            login_button.addEventListener("click", login);
            login_button.innerText = "Login";
            myInterval = setInterval(check_signed_in, 1000);
            user = null;
          }
        })
        .catch(error => {
          console.error("error logging out", error);
        });
    }

    async function login() {
      await fetch("http://localhost:8000/home")
        .then(response => response.text())
        .then(htmlString => {
          document.body.innerHTML = htmlString;
        })
        .catch(error => {
          console.error("error logging in", error);
        });
    }

    async function check_signed_in() {
      await fetch("http://localhost:8000/is_signed_in", {method: 'GET', credentials: 'include',})
        .then(response => response.json())
        .then(data => {
          if (data.signed_in === true) {
            get_user_type();
          }
        })
        .catch(error => {
          console.error("erroring checking if signed in", error);
        });
    }

    async function get_comments(nyt_article: string): Promise<[[string]]> {
      return await fetch("http://localhost:8000/find_comments?id=" + nyt_article)
        .then(response => response.json())
        .then(data => {
          return data.comments;
        })
        .catch(error => {
          console.error("error getting comments", error)
        });
    }

    async function display_comments(indexOfStory: number) {
      const comment_elements = document.querySelectorAll(".comment");
      const redact_elements = document.querySelectorAll(".redact_button");
      comment_elements.forEach(el => el.remove());
      redact_elements.forEach(el => el.remove());

      let comments_list = [[]];
      let nyt_article = allStories[indexOfStory].headline.main;
      let original_nyt_article = nyt_article;
      nyt_article = nyt_article.toLowerCase().replaceAll(' ', '-').trim();
      comments_list = await get_comments(nyt_article);
      let comments_header = document.getElementsByClassName("comments-title")[0];
      comments_header.innerHTML = "Comments for: " + original_nyt_article;
      for (let i = 0; i < comments_list.length; i++) {
        for (let j = 0; j < comments_list[i].length; i++) {
          if (j === 0) {
            let comment = document.createElement("p");
            comment.className = "comment";
            comment.innerText = comments_list[i][j].replaceAll('-', ' ');
            comments_header.parentNode.insertBefore(comment, comments_header.nextSibling);
            if (user === "moderator" || user === "admin") {
              let redact_button = document.createElement("button");
              redact_button.innerText = "REDACT";
              redact_button.className = "redact_button";
              comments_header.parentNode.insertBefore(redact_button, comment.nextSibling);
              redact_button.addEventListener("click", () => redact_comment(comment.innerText, original_nyt_article));
            }
          } else {
            let comment = document.createElement("p");
            comment.className = "comment";
            comment.innerText = "\t" + comments_list[i][j].replaceAll('-', ' ');
            if (user === "moderator" || user === "admin") {
              let redact_button = document.createElement("button");
              redact_button.innerText = "REDACT";
              redact_button.className = "redact_button";
              comments_header.parentNode.insertBefore(redact_button, comment.nextSibling);
              redact_button.addEventListener("click", () => redact_comment(comment.innerText, original_nyt_article));
            }
          }
        }
      }
    }

    async function redact_comment(comment: string, nyt_article: string) {
      let nyt_article_original = nyt_article;
      nyt_article = nyt_article.toLowerCase().replaceAll(' ', '-');
      comment = comment.replaceAll(' ', '-');
      let comments = await get_comments(nyt_article);
      const commentsArray = Object.values(comments);
      let index = commentsArray.findIndex(inner => inner.includes(comment));
      let innerArray = commentsArray[index];
      let indexOfComment = innerArray.findIndex(inner => inner == comment);
      innerArray[indexOfComment] = "COMMENT REMOVED BY MODERATOR!";
      await fetch("http://localhost:8000/insert_comment_to_other_comment/" + index + "/" + innerArray + "?id=" + nyt_article)
        .then(response => response.json())
        .then(() => {
          display_comments(allStories.findIndex(story => story.headline.main == nyt_article_original));
        })
        .catch(error => {
          console.error("error redacting comment", error);
        });
    }

    async function add_comment_to_article(comment: string, nyt_article: string) {
      let nyt_article_original = nyt_article;
      nyt_article = nyt_article.toLowerCase().replaceAll(' ', '-');
      comment = comment.replaceAll(' ', '-');
      await fetch("http://localhost:8000/insert_comment/" + comment + "?id=" + nyt_article)
        .then(response => response.json())
        .then(() => {
          display_comments(allStories.findIndex(story => story.headline.main == nyt_article_original));
        })
        .catch(error => {
          console.error("error adding comment", error);
        });
    }

    async function get_comment_and_append_new_comment(comment: string, base_comment: string, nyt_article: string) {
      nyt_article = nyt_article.toLowerCase().replaceAll(' ', '-');
      let comments = await get_comments(nyt_article);
      const commentsArray = Object.values(comments);
      let index = commentsArray.findIndex(inner => inner.includes(base_comment.replaceAll(' ', '-')));
      let old_comments = comments[index];
      old_comments.push(comment.replaceAll(' ', '-'));
      let new_comments = old_comments.join(",");
      return [new_comments, index];
    }

    async function add_comment_to_other_comment(comment: string, base_comment: string, nyt_article: string) {
      let original_nyt_article = nyt_article;
      nyt_article = nyt_article.toLowerCase().replaceAll(' ', '-');
      let comment_and_index = await get_comment_and_append_new_comment(comment, base_comment, original_nyt_article);
      let new_comments = comment_and_index[0];
      let index = comment_and_index[1];
      await fetch("http://localhost:8000/insert_comment_to_other_comment/" + index + "/" + new_comments + "?id=" + nyt_article)
        .then(response => response.json())
        .then(() => {
          // display_comments(original_nyt_article);
        })
        .catch(error => {
          console.error("error adding comment from other comment to database", error);
        });
    }

    // Retreive location specific stories given a "page number" -> 10 stories per page
    function getSacStoriesFromBackend(pageNumber: number): Promise<[string]> {
      return new Promise((resolve) => {
        fetch("http://localhost:8000/get_stories/sacramento/" + pageNumber)
            .then(response => response.json())
            .then(data => {
              resolve(data.stories);
            })
            .catch(error => {
              console.error("error fetching stories from flask", error);
            });
      });
    }


    function getDavisStoriesFromBackend(pageNumber: number): Promise<[string]> {
      return new Promise((resolve) => {
        fetch("http://localhost:8000/get_stories/davis/" + pageNumber)
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
        allStories.push(...sacStories);
        allStories.push(...davisStories);
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

            let commentsButton = gridElement.appendChild(document.createElement("button"));
            commentsButton.className = "comment-button";
            commentsButton.id = "comment-button-id";
            commentsButton.innerText = "comment";
            //Add inner text as image
            let indexOfStory = i + pageNumber * 14;
            commentsButton.addEventListener("click", () => display_comments(indexOfStory));
            commentsButton.addEventListener("click", () => {
              const commentsDiv = document.getElementById("comments-container-id");
              if (commentsDiv?.style.display === "none" || commentsDiv?.style.display === ""){
                commentsDiv.style.display = "block";
              } else{
                commentsDiv.style.display = "none";
              }
              // display_comments(sacStories[i].headline.main);
            })
            // const commentsContainer = document.getElementById("comments-container");

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

            let button = gridElement.appendChild(document.createElement("button"));
            button.className = "comment-button";
            button.innerText = "comment";
            //Add inner text as image
            button.addEventListener("click", () => {
              display_comments(sacStories[i].headline.main);
            });
            const commentsContainer = document.getElementById("comments-container");
            button.addEventListener("click", () => {
              if(commentsContainer.style.display === "none"){
                commentsContainer.style.display = "block";
              }else{
                commentsContainer.style.display = "none";
              }
            })
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

            let button = gridElement.appendChild(document.createElement("button"));
            button.className = "comment-button";
            button.innerText = "comment";
            //Add inner text as image
            button.addEventListener("click", () => {
              display_comments(davisStories[i].headline.main);
            });
            const commentsContainer = document.getElementById("comments-container");
            button.addEventListener("click", () => {
              if(commentsContainer.style.display === "none"){
                commentsContainer.style.display = "block";
              }else{
                commentsContainer.style.display = "none";
              }
            })
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

    //Infinite Scroll (not that infinite due to api calling time limits and restrictions)
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
    await createDom(curPage);
    function init() {
        window.addEventListener("scroll", loadMorePagesOnScroll);
        let login_button = document.getElementById("login_button");
        login_button.addEventListener("click", login);
        let submit_comment_button = document.getElementById("submit-button");
        submit_comment_button.addEventListener("click", async () => {
          let comments_title = document.getElementById("comments-title").innerText;
          let nyt_article = comments_title.replace("Comments for: ", "");
          let text_box = document.getElementById("add-comment") as HTMLInputElement;
          await add_comment_to_article(text_box.value, nyt_article);
          text_box.value = "";
        });
        let cancel_comment_button = document.getElementById("cancel-button");
        cancel_comment_button.addEventListener("click", () => {
          let text_box = document.getElementById("add-comment") as HTMLInputElement;
          text_box.value = "";
        });
        let close_comments_button = document.getElementById("close-comments");
        close_comments_button.addEventListener("click", () => {
          const commentsDiv = document.getElementById("comments-container-id");
          commentsDiv.style.display = "none";
        });
    }
})();