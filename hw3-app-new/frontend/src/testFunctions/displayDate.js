function displayDate() {
    let todaysDate = new Date();
    const format = {weekday : "long", month: "long", day: "numeric", year: "numeric"};
    const formattedDate = todaysDate.toLocaleDateString('en-US', format);

    document.getElementById("formattedDate").innerText = formattedDate;
    console.log(formattedDate);
}
module.exports = displayDate;