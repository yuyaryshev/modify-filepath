import { hello } from "./hello.js";

describe(`example.test.ts`, () => {
    it(`example.test.ts`, () => {
        expect(hello()).toEqual("ytslib_policy package 'modify-filepath' started successfully!");
    });
});
