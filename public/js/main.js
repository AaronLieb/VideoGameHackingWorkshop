import * as app from "/public/js/app.js";

window.session = await app.Start({
    gameElement: document.getElementById("game"),
    levelsElement: document.getElementById("levels"),
}).catch((err) => {
    if (err instanceof session.NotLoggedInError) {
        window.location.replace("/login/");
    } else {
        alert(`cannot connect to WS: ${err}`);
    }
    throw err;
});

console.log(`logged in as ${window.session.username}`);
