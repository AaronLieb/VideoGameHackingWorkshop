const msDay = 1 * // 1 day
    24 * // 24 hours a day
    60 * // 60 minutes an hour
    60 * // 60 seconds a minute
    1000; // 1000 milliseconds a second

export function duration(ms, showMs = true) {
    if (ms > msDay) {
        return "Too long (>1d)";
    }

    const d = new Date(0);
    d.setMilliseconds(ms);

    const isostr = d.toISOString();
    if (showMs) {
        return isostr.replace(/.*T([0-9:.]+)Z/, "$1");
    } else {
        return isostr.replace(/.*T([0-9:]+)[.0-9]*Z/, "$1");
    }
}
