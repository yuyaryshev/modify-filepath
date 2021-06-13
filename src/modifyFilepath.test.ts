import { modifyFilepath } from "./modifyFilepath.js";

describe(`modifyFilepath.test.ts`, () => {
    it(`file.ts  ==>  4/file.ts`, () => {
        const r = modifyFilepath(`file.ts`).addDir("4").done();
        expect(r).toEqual(`4/file.ts`);
    });

    it(`./file.ts  ==>  ./4/file.ts`, () => {
        const r = modifyFilepath(`./file.ts`).addDir("4").done();
        expect(r).toEqual(`./4/file.ts`);
    });

    it(`d:\\1\\2/file.ts  ==>  d:/1/2/file.ts`, () => {
        const r = modifyFilepath(`d:\\1\\2/file.ts`).win();
        expect(r).toEqual(`d:/1/2/file.ts`);
    });

    it(`./1\\2/file.ts  ==>  ./1/2/file.ts `, () => {
        const r = modifyFilepath(`./1\\2/file.ts`).done();
        expect(r).toEqual(`./1/2/file.ts`);
    });

    it(`./1/2/file.ts  ==>  ./1/2/4/file.ts addDir`, () => {
        const r = modifyFilepath(`./1/2/file.ts`).addDir("4").done();
        expect(r).toEqual(`./1/2/4/file.ts`);
    });

    it(`d:/1/2/file.ts ==> d:/1/2/4/file.ts addDir`, () => {
        const r = modifyFilepath(`d:/1/2/file.ts`).addDir("4").done();
        expect(r).toEqual(`d:/1/2/4/file.ts`);
    });

    it(`d:/1\\2\\file.ts ==> d:/1/xxx/2/4/file.ts - addDir offset -1`, () => {
        const r = modifyFilepath(`d:/1\\2\\file.ts`).addDir("xxx", -1).addDir("4").done();
        expect(r).toEqual(`d:/1/xxx/2/4/file.ts`);
    });

    it(`d:/1\\2\\file.ts ==> d:/1/xxx/2/4/file.ts - addDir offset 1`, () => {
        const r = modifyFilepath(`d:/1\\2\\file.ts`).addDir("xxx", 1).addDir("4").done();
        expect(r).toEqual(`d:/1/xxx/2/4/file.ts`);
    });

    it(`d:/1\\2\\33/4/55/file.ts ==> d:/1/xx/y/4/55/file.ts - replaceDir`, () => {
        const r = modifyFilepath(`d:/1\\2\\33/4/55/file.ts`).replaceDir("2/33", "xx/y").done();
        expect(r).toEqual(`d:/1/xx/y/4/55/file.ts`);
    });
});
