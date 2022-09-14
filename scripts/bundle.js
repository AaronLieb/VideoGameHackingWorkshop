import * as execute from "https://deno.land/x/execute@v1.1.0/mod.ts";
import * as fnv from "https://deno.land/std@0.105.0/hash/fnv.ts";
import * as base64 from "https://deno.land/std@0.95.0/encoding/base64.ts";

let hashedOutput = {};

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

    try {
        const file = await Deno.readFile(".git/bundle-cache.json");
        const text = textDec.decode(file);
        hashedOutput = JSON.parse(text);
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            console.error("cannot decode .git/bundle-cache.json:", err);
        }
    }

    for (const [src, dst] of Object.entries(config.bundle.sharedSourceDirs)) {
        const changed = await bundleDirectory(src, dst, {
            baseSrc: src,
            baseDst: dst,
            rootSrc: src.startsWith(".") ? src.replace(".", "") : src, // hack
            rootDst: dst.startsWith(".") ? dst.replace(".", "") : dst,
            excludes: config.bundle.excludes || [],
        });

        if (changed) {
            await execute.exec({
                cmd: ["deno", "fmt", dst],
                stdout: "inherit",
                stderr: "inherit",
            });
        }
    }

    try {
        const cacheJSON = JSON.stringify(hashedOutput);
        await Deno.writeFile(".git/bundle-cache.json", textEnc.encode(cacheJSON));
    } catch (err) {
        console.log(`cannot write bundle cache: ${err} (not fatal)`);
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
    const srcFilesIter = Deno.readDir(src);
    const srcFiles = [];
    for await (const srcFile of srcFilesIter) {
        srcFiles.push(srcFile);
    }

    let changed = false;
    for (const srcFile of srcFiles) {
        const srcPath = paths(src, srcFile.name);
        const dstPath = paths(dst, srcFile.name.replace(".ts", ".js"));

        const srcCont = await Deno.readFile(srcPath);
        const srcHash = hashbytes(srcCont);

        if (hashedOutput[srcPath] === srcHash) {
            // console.log(srcPath, "is unmodified, skipping");
            continue;
        }

        // Confirm that the file still exists.
        try {
            await Deno.stat(dstPath);
            continue;
        } catch (_) { /* changed */ }

        changed = true;
        break;
    }

    if (!changed) {
        return false;
    }

    await Deno.remove(dst, { recursive: true }).catch((_) => {/* do nothing */});
    await Deno.mkdir(dst, { recursive: true });

    for (const srcFile of srcFiles) {
        await bundleFile(src, dst, srcFile, opts);
    }

    return true;
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

    const srcContent = await Deno.readFile(srcPath);
    const srcHash = hashbytes(srcContent);
    hashedOutput[srcPath] = srcHash;

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
            console.error(`cannot apply postprocessing on file ${dstPath}:`, err);
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
    dstr = `
// Code generated by deno task bundle. DO NOT EDIT. Unless you're a 1337H4X0R.
// Then move on.

${dstr}
`;

    data = textEnc.encode(dstr);
    await Deno.writeFile(path, data);
}

function hashbytes(data) {
    const hasher = new fnv.Fnv64a();
    hasher.write(data);
    return base64.encode(hasher.sum());
}

function paths(...parts) {
    return parts.join("/");
}

await main();
Deno.exit(0);
