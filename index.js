// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let getCallStack = () => {
    let callStack = (new Error).stack.split("\n").filter(str => str.indexOf("at") > -1).map(str => str.trim().substring(3)).map(str => {
        return {
            name: str.substring(0, str.indexOf(" ")),
            location: str.substring(str.indexOf(" ") + 1, str.length),
        };
    });
    callStack = callStack.reverse();
    callStack.pop(); // remove "getCallStack"
    callStack.pop(); // remove "proxifyModule"
    return callStack;
};

let inspector = {};

inspector.inspect = (module) => {
    let callStack = getCallStack();

    let functionsToInterceptArray = Object.keys(module)
        // filter only functions from the module object
        .filter(key => typeof module[key] === "function")
        
        // map each function to functionObject = {name: "function-name", call: function}
        .map(key => { return {name: key, call: module[key]} })

        // add functionObject.parameters
        .map(functionObject => {
            let astTree = require("babylon").parse(`(${functionObject.call.toString()})`);
            let parameters = astTree.program.body[0].expression.params.map(node => node.name);
            functionObject.parameters = parameters;

            return functionObject;
        });

    const functionsCalls = [];

    for (const functionObject of functionsToInterceptArray) {
        const handler = {
            apply: async (target, thisArg, argumentsList) => {
                let functionCall = {};

                // set functionName
                functionCall.functionName = functionObject.name;

                // set caller name
                let callStack = getCallStack();
                let callerName = getCallStack().pop().name;

                if (callerName === "") {
                    // caller is main
                }
                else {
                    functionCall.callerName = callerName;
                }

                // set arguments
                functionCall.functionArguments = [];

                for (let i = 0; i < argumentsList.length; i++) {
                    functionCall.functionArguments.push({
                        parameter: functionObject.parameters[i],
                        argument: argumentsList[i]
                    })
                }

                functionCall.startTime = new Date();

                let result = await target(...argumentsList);

                functionCall.endTime = new Date();

                functionsCalls.push(functionCall);
                return result;
            }
        };

        module[functionObject.name] = new Proxy(functionObject.call, handler);
    }

    return functionsCalls;
};

// Exports

exports.inspector = inspector;