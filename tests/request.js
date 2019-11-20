const { inspector: inspector } = require("../index");
const request = require("request-promise");

let inspectResult = inspector.inspect(request);

(async () => {
    let testFunc = async () => {
        await request.get("https://www.google.com");
    };

    let outerTestFunc = async () => {
        await request.get("https://www.ynet.co.il");
        testFunc()
    };

    await request.get("https://www.google.com");
    await outerTestFunc();
    await testFunc();

    console.log(inspectResult)
})().catch(error => {
    console.log(error);
});
