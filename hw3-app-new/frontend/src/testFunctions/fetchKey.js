
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
module.exports = fetchKey;

