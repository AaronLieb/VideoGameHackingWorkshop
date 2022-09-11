import * as execute from "https://deno.land/x/execute@v1.1.0/mod.ts";

async function main() {
    let denoConfigFile;
    try {
        const f = await Deno.readFile("deno.json");
        denoConfigFile = (new TextDecoder()).decode(f);
    } catch (_) {
        throw "missing $1 or ./deno.json";
    }

    const config = JSON.parse(denoConfigFile);
    if (!config.bundle) {
        throw "deno.json missing .sharedSourceDirs";
    }

    for (const [src, dst] of Object.entries(config.bundle.sharedSourceDirs)) {
        await Deno.remove(dst, { recursive: true }).catch((_) => {/* do nothing */});
        await Deno.mkdir(dst, { recursive: true });

        await bundleDirectory(src, dst, {
            baseSrc: src,
            baseDst: dst,
            rootSrc: src.startsWith(".") ? src.replace(".", "") : src, // hack
            rootDst: dst.startsWith(".") ? dst.replace(".", "") : dst,
            excludes: config.bundle.excludes || [],
        });

        await execute.exec({
            cmd: ["deno", "fmt", dst],
            stdout: "inherit",
            stderr: "inherit",
        });
    }
}

function postprocess(data, opts) {
    // Replace .ts with .js.
    data = data.replaceAll(
        /(import .* from) "(.*)\.ts"/gm,
        `$1 "$2.js"`,
    );
    // Replace import paths according to the source paths.
    data = data.replaceAll(
        /(import .* from) "(.*\.(?:js|ts))"/gm,
        (_m0, m1, m2) => `${m1} "${m2.replace(opts.rootSrc, opts.rootDst)}"`,
    );
    return data;
}

async function bundleDirectory(src, dst, opts) {
    const srcFiles = Deno.readDir(src);
    for await (const srcFile of srcFiles) {
        await bundleFile(src, dst, srcFile, opts);
    }
}

async function bundleFile(src, dst, srcFile, opts) {
    const srcPath = paths(src, srcFile.name);
    const dstPath = paths(dst, srcFile.name.replace(".ts", ".js"));

    if (opts.excludes.includes(srcPath)) {
        console.log("skipping", srcPath);
        return;
    }

    console.log("bundling", srcPath);

    if (srcFile.isDirectory) {
        bundleDirectory(srcPath, dstPath, opts);
        return;
    }

    // Fuck it. The TypeScript people can go suck my nuts.
    let tscException;
    const tscArgs = [
        "tsc",
        srcPath,
        "--target",
        "es2020",
        "--module",
        "es2020",
        "--isolatedModules",
        "--noLib",
        "--outDir",
        dst,
    ];
    try {
        await execute.exec({
            cmd: tscArgs,
            stdout: "inherit",
            stderr: "inherit",
        });
    } catch (err) {
        tscException = err;
    }

    try {
        await postprocessFile(dstPath, opts);
    } catch (err) {
        if (tscException) {
            console.log("tried running tsc with `" + tscArgs.join(" ") + "`");
            console.error(`tsc cannot bundle file ${dstPath}:`, tscException);
        } else {
            console.error(`cannot apply postprocessing on file ${dstPath}:`, err);
        }
        throw "postprocessing failed";
    }
}

const textDec = new TextDecoder();
const textEnc = new TextEncoder();

async function postprocessFile(path, opts) {
    let data = await Deno.readFile(path);
    let dstr = textDec.decode(data);
    dstr = postprocess(dstr, opts);
    data = textEnc.encode(dstr);
    await Deno.writeFile(path, data);
}

function paths(...parts) {
    return parts.join("/");
}

await main();
Deno.exit(0);
