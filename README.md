# Module inspector
module-inspector node.js package

[![npm package](https://nodei.co/npm/module-inspector.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/request/)

## Inspect node.js module

Inspect and track node.js module's function calls and performance.

```js
const {inspector} = require('module-inspector');
const request = require("request-promise");

// inspect "request" module
let inspectResult = inspector.inspect(request);

(async () => {
    let testFunc = async () => {
        await request.get("https://www.google.com");
    };

    let outerTestFunc = async () => {
        await request.get("https://www.microsoft.com");
        testFunc()
    };

    // directly call module's functions
    await request.get("https://www.google.com");
    await outerTestFunc();
    await testFunc();

    console.log(JSON.stringify(inspectResult, null, 2))
})
().catch(error => {
    console.log(error);
});

/**
 output:
 
 [
    {
        "functionName": "get",
        "functionArguments": [
            {
                "parameter": "uri",
                "argument": "https://www.google.com"
            }
        ],
        "startTime": "2019-11-20T11:08:54.850Z",
        "endTime": "2019-11-20T11:08:55.392Z"
    },
    {
        "functionName": "get",
        "callerName": "outerTestFunc",
        "functionArguments": [
            {
                "parameter": "uri",
                "argument": "https://www.microsoft.com"
            }
        ],
        "startTime": "2019-11-20T11:08:55.393Z",
        "endTime": "2019-11-20T11:08:56.639Z"
    },
    {
        "functionName": "get",
        "callerName": "testFunc",
        "functionArguments": [
            {
                "parameter": "uri",
                "argument": "https://www.google.com"
            }
        ],
        "startTime": "2019-11-20T11:08:56.641Z",
        "endTime": "2019-11-20T11:08:57.064Z"
    }
 ]

 */
```