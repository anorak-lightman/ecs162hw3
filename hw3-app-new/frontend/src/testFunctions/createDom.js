async function createDom() {
    for (let i = 0; i < 5; i++) {
        let col = document.getElementsByClassName("row1col left-col")[0];
        let gridElement = document.createElement("div");
        gridElement.className = "grid-element";
        col.appendChild(gridElement)

        let link1 = gridElement.appendChild(document.createElement("a"));
        let img = link1.appendChild(document.createElement("img"));
        let link2 = gridElement.appendChild(document.createElement("a"));
        let header = link2.appendChild(document.createElement("h2"));
        header.className = "articleHeader";
        gridElement.appendChild(document.createElement("br"));
        let snippet = gridElement.appendChild(document.createElement("p"));
        snippet.className = "left-col1";
        let hr = gridElement.appendChild(document.createElement("hr"));
        hr.className = "hr-center";
    }
}

module.exports = createDom;