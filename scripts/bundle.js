// import * as esbuild from "https://deno.land/x/esbuild@v0.15.6/mod.js";
import * as execute from "https://deno.land/x/execute@v1.1.0/mod.ts";

async function main() {
    let denoConfigFile;
    try {
        const f = await Deno.readFile("deno.json");
        denoConfigFile = (new TextDecoder()).decode(f);
    } catch (_) {
        throw "missing $1 or ./deno.json";
    }

    const denoConfig = JSON.parse(denoConfigFile);
    if (!denoConfig.sharedSourceDirs) {
        throw "deno.json missing .sharedSourceDirs";
    }

    for (const [src, dst] of Object.entries(denoConfig.sharedSourceDirs)) {
        await bundle(src, dst);
    }
}

async function bundle(src, dst) {
    await Deno.remove(dst, { recursive: true });
    await Deno.mkdir(dst, { recursive: true });

    const srcFiles = Deno.readDir(src);
    for await (const srcFile of srcFiles) {
        await execute.exec([
            "deno",
            "bundle",
            paths(src, srcFile.name),
            "--",
            paths(dst, srcFile.name.replace(".ts", ".js")),
        ]);
    }
}

function paths(...parts) {
    return parts.join("/");
}

await main();
