export function ToElement(html) {
    const tmpl = document.createElement("template");
    tmpl.innerHTML = html.trim();
    return tmpl.content.firstChild;
}
