import * as app from "/public/js/app.js";

const elements = {
    gameElement: document.getElementById("game"),
    gamePageElement: document.getElementById("game-page"),
    levelsElement: document.getElementById("level-menu"),
};

app.Start(elements)
    .then((session) => {
        window.session = session;
        console.log(`logged in as ${window.session.username}`);
    })
    .catch((err) => {
        if (err instanceof app.NotLoggedInError) {
            window.location.replace("/login/");
        } else {
            alert(`cannot connect to WS: ${err}`);
        }
        throw err;
    });
