"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.npmRunner = exports.shRunner = exports.bsRunner = exports.execRunner = void 0;
const Rx = require("rx");
const types_1 = require("./types");
/**
 * @param {import("./types").RunnerOption} runner
 */
function execRunner(runner) {
    return Rx.Observable.concat(runner.run.map(r => {
        if ("bs" in r) {
            return bsRunner(r);
        }
        if ("sh" in r) {
            let cmd;
            if (typeof r.sh === "string") {
                cmd = r.sh;
            }
            else if ("cmd" in r.sh) {
                cmd = r.sh.cmd;
            }
            else {
                return Rx.Observable.throw(new Error("invalid `sh` config"));
            }
            return shRunner(r, {
                cmd: cmd
            });
        }
        if ("npm" in r) {
            return npmRunner(r);
        }
        throw new Error("unreachable");
    }));
}
exports.execRunner = execRunner;
/**
 * @param {import("./types").Runner} runner
 */
function bsRunner(runner) {
    if (!("bs" in runner))
        throw new Error("unreachable");
    /** @type {import("./types").BsSideEffect[]} */
    const effects = [];
    if (runner.bs === "inject") {
        effects.push({
            type: "inject",
            files: runner.files.map(f => {
                return {
                    path: f,
                    event: "bs-runner"
                };
            })
        });
    }
    else if (runner.bs === "reload") {
        effects.push({
            type: "reload",
            files: []
        });
    }
    return Rx.Observable.concat(Rx.Observable.just((0, types_1.toRunnerNotification)({
        status: "start",
        effects: [],
        runner
    })), Rx.Observable.just((0, types_1.toRunnerNotification)({
        status: "end",
        effects: effects,
        runner
    })));
}
exports.bsRunner = bsRunner;
/**
 * @param {import("./types").Runner} runner
 * @param {object} params
 * @param {string} params.cmd
 */
function shRunner(runner, params) {
    return Rx.Observable.concat(Rx.Observable.just((0, types_1.toRunnerNotification)({ status: "start", effects: [], runner })), Rx.Observable.just((0, types_1.toRunnerNotification)({ status: "end", effects: [], runner })));
}
exports.shRunner = shRunner;
/**
 * @param {import("./types").Runner} runner
 */
function npmRunner(runner) {
    if (!("npm" in runner))
        throw new Error("unreachble");
    return Rx.Observable.just(runner).flatMap(runner => {
        try {
            const runAll = require("npm-run-all");
            const runAllRunner = runAll(runner.npm, {
                parallel: false,
                stdout: process.stdout,
                stdin: process.stdin,
                stderr: process.stderr
            });
            const p = runAllRunner.then(results => {
                if (results.some(r => r.code !== 0))
                    throw new Error("failed");
                return results;
            });
            return Rx.Observable.fromPromise(p).map(results => {
                return (0, types_1.toRunnerNotification)({ status: "end", effects: [], runner });
            });
        }
        catch (e) {
            console.log("e", e);
            return Rx.Observable.throw(e);
        }
    });
}
exports.npmRunner = npmRunner;
//# sourceMappingURL=runner.js.map