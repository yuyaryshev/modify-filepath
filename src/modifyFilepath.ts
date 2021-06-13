import { join, resolve, win32, posix, normalize, ParsedPath } from "path";

function isLetter(c: string) {
    return ("a" <= c && c <= "z") || ("A" <= c && c <= "Z");
}

function findBackSep(s: string) {
    for (let p = s.length - 1; p >= 0; p--) if (s[p] === "/" || s[p] === "\\") return p;
    return -1;
}

function findBackPoint(s: string) {
    for (let p = s.length - 1; p >= 0; p--) if (s[p] === ".") return p;
    return -1;
}

function parsePathTail(s: string) {
    const p = findBackSep(s);
    const dir = (p > 1 ? s.substr(0, p) : "")
        .split("\\")
        .join("/")
        .split("/")
        .filter((s) => s.length)
        .join("/");
    const base = p > 1 ? s.substr(p + 1) : s.substr(0);
    const p2 = findBackPoint(base);
    let name = p2 > 0 ? base.substr(0, p2) : base;
    let ext = p2 > 0 ? base.substr(p2 + 1) : "";
    if (!name.length) {
        name = ext;
        ext = "";
    }
    return { dir, base, name, ext };
}

export interface YParsedPath extends ParsedPath {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
    relative: boolean;
}

export function yparsePath(s0: string): YParsedPath {
    const s = s0.trim();
    let relative = true;
    let rootSize = 0;
    if (s[1] === ":" && isLetter(s[0])) {
        // Windows mode
        rootSize = 3;
    } else {
        if (s.startsWith("/")) {
            rootSize = 1;
            relative = false;
        } else if (s.startsWith("~/")) {
            rootSize = 2;
            relative = false;
        } else if (s.startsWith("./")) {
            rootSize = 2;
        } else if (s.startsWith("../")) {
            rootSize = 3;
        }
    }
    return { root: !rootSize ? "" : s.substr(0, rootSize).split("\\").join("/"), ...parsePathTail(s.substr(rootSize)), relative };
}

export function yformatPath(parsedPath: ParsedPath) {
    const { root, dir, name, ext } = parsedPath;
    return `${root}${dir}${dir.endsWith("/") ? "" : "/"}${name}${ext?.length ? `.${ext}` : ""}`;
}

function splitDir(s: string): string[] {
    return s.split(/[/\\]/).filter((d) => d.length);
}

function normalizeDir(s: string): string {
    return s
        .split(/[/\\]/)
        .filter((d) => d.length)
        .join("/");
}

export function modifyFilepath(s: string) {
    const parsed: YParsedPath = yparsePath(s);
    function changeExt(newExt: string) {
        parsed.ext = newExt;
        return r;
    }

    function addExt(newExt: string) {
        parsed.ext += newExt;
        return r;
    }

    function addDir(dir: string, offset?: number | undefined) {
        if (offset === undefined) parsed.dir = posix.join(parsed.dir, dir);
        else {
            const t1 = splitDir(parsed.dir);
            t1.splice(offset, 0, ...splitDir(dir));
            parsed.dir = t1.join("/");
        }
        return r;
    }

    function replaceDir(oldDir: string, newDir: string) {
        parsed.dir = normalizeDir(parsed.dir.split("/" + oldDir + "/").join("/" + newDir + "/"));
        return r;
    }

    function changeName(newName: string) {
        parsed.base = newName;
        return r;
    }

    function addName(nameSuffix: string) {
        parsed.base += nameSuffix;
        return r;
    }

    function ensureNameSuffix(suffix: string) {
        if (!parsed.base.endsWith(suffix)) parsed.base += suffix;
        return r;
    }

    function ensureNamePrefix(prefix: string) {
        if (!parsed.base.startsWith(prefix)) parsed.base = prefix + parsed.base;
        return r;
    }

    function doResolve() {
        Object.assign(parsed, yparsePath(resolve(yformatPath(parsed))));
        return r;
    }

    function doNormalize() {
        Object.assign(parsed, yparsePath(normalize(yformatPath(parsed))));
        return r;
    }

    function done(): string {
        return yformatPath(parsed);
    }

    function asPosix(): string {
        return yformatPath(parsed);
        //        return posix.format(parsed);
    }

    function asWin32(): string {
        return yformatPath(parsed);
        //        return win32.format(parsed);
    }

    function doSplitDir() {
        return splitDir(parsed.dir);
    }

    const r = {
        parsed,
        changeExt,
        addExt,
        addDir,
        replaceDir,
        splitDir: doSplitDir,
        changeName,
        addName,
        ensureNameSuffix,
        ensureNamePrefix,
        join: addDir,
        resolve: doResolve,
        normalize: doNormalize,
        done,
        posix: asPosix,
        win: asWin32,
        win32: asWin32,
    };
    return r;
}
