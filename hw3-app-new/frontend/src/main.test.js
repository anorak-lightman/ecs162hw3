const fetchKey = require('./testFunctions/fetchKey.js');
const getSacStories = require('./testFunctions/getSacStories.js');
const getDavisStories = require('./testFunctions/getDavisStories.js');
const createDom = require('./testFunctions/createDom.js');
const populateStories = require("./testFunctions/populateStories.js");
const displayDate = require("./testFunctions/displayDate.js");
const fetch = require('node-fetch');   
global.fetch = fetch;
test('basic sanity check', () => {
    expect(1 + 1).toBe(2);
});

test('fetch api key', async () => {
    const apiKey = await fetchKey();
    expect(apiKey).toBe('rFSzaY1UbSRUSoBOt6lsYpXubk49bygA');
});

test('get sacramento stories', async () => {
    const sacStories = await getSacStories(0);
    expect(sacStories[0]).toBeDefined();
    expect(sacStories[0].headline.main).toBeDefined();
    expect(sacStories[0].snippet).toBeDefined();
    expect(sacStories[0].multimedia).toBeDefined();
    expect(sacStories[0].multimedia.default.url).toBeDefined();
    expect(sacStories[0].multimedia.default.width).toBeDefined();
    expect(sacStories[0].multimedia.default.height).toBeDefined();
    expect(sacStories[0].web_url).toBeDefined();
});

test('get davis stories', async () => {
    const davisStories = await getDavisStories(0);
    expect(davisStories[0]).toBeDefined();
    expect(davisStories[0].headline.main).toBeDefined();
    expect(davisStories[0].snippet).toBeDefined();
    expect(davisStories[0].multimedia).toBeDefined();
    expect(davisStories[0].multimedia.default.url).toBeDefined();
    expect(davisStories[0].multimedia.default.width).toBeDefined();
    expect(davisStories[0].multimedia.default.height).toBeDefined();
    expect(davisStories[0].web_url).toBeDefined();
});

test('create dom', () => {
    document.body.innerHTML = `
        <html>
            <body>
                <div class="row1col left-col"></div>
            </body>
        </html>
    `;
    createDom();
    let col = document.getElementsByClassName("row1col left-col")[0];
    expect(col.childNodes[0].className).toBe("grid-element");
    let gridElement = col.firstChild;
    let gridChildren = gridElement.childNodes;
    expect(gridChildren[0].nodeName).toBe("A");
    expect(gridChildren[1].nodeName).toBe("A");
    expect(gridChildren[2].nodeName).toBe("BR");
    expect(gridChildren[3].nodeName).toBe("P");
    expect(gridChildren[4].nodeName).toBe("HR");
    let link1child = gridChildren[0].childNodes;
    expect(link1child[0].nodeName).toBe("IMG");
    let link2child = gridChildren[1].childNodes;
    expect(link2child[0].nodeName).toBe("H2");
    expect(link2child[0].className).toBe("articleHeader");
    expect(gridChildren[3].className).toBe("left-col1");
    expect(gridChildren[4].className).toBe("hr-center");
});

test('populate stories', () => {
    document.body.innerHTML = `
        <html>
            <body>
                <div class="row1col left-col">
                    <div class="grid-element">
                        <a id="link1"><img id="image"></a>
                        <a id="link2"><h2 class="articleHeader"></h2></a>
                        <br>
                        <p class="center-col"></p>
                        <hr class="hr-center">
                    </div>
                </div>
            </body>
        </html>
    `;
    const story = {
        headline: {
            main: "main"
        },
        snippet: "snippet",
        multimedia: {
            default: {
                url: "url",
                width: 10,
                height: 11
            }
        },
        web_url: "https://example.com"
    }
    populateStories(document.getElementsByClassName("articleHeader")[0], document.getElementsByClassName("center-col")[0], document.getElementById("image"), document.getElementById("link1"), document.getElementById("link2"), story);
    expect(document.getElementById("link1").href).toBe("https://example.com/");
    expect(document.getElementById("link2").href).toBe("https://example.com/");
    expect(document.getElementById("image").src).toBe("http://localhost/url");
    expect(document.getElementById("image").width).toBe(10);
    expect(document.getElementById("image").height).toBe(11);
    expect(document.getElementsByClassName("articleHeader")[0].innerText).toBe("main");
    expect(document.getElementsByClassName("center-col")[0].innerText).toBe("snippet");
});

test('display date', () => {
    document.body.innerHTML = `
        <html>
            <body>
                <p id="formattedDate"></p>
            </body>
        </html>
    `;
    displayDate();
    let todaysDate = new Date();
    const format = {weekday : "long", month: "long", day: "numeric", year: "numeric"};
    const formattedDate = todaysDate.toLocaleDateString('en-US', format);
    expect(document.getElementById("formattedDate").innerText).toBe(formattedDate);
});


