export function escapeHTML(html) {
    // https://stackoverflow.com/a/28458409/5041327
    return html.replace(/[&<>"']/g, (m) => {
        switch (m) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt";
            case '"':
                return "&quot;";
            case "'":
                return "&#039;";
        }
    });
}
