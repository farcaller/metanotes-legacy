load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm_frontend//jest-cli:index.bzl", _jest_test = "jest_test")

def ts_jest_test(name, srcs, tsc, deps = [], **kwargs):
    jest_config = "//:jest.ts.config.js"
    ts_project(
        name = "%s_ts" % name,
        srcs = srcs,
        deps = deps + ["@npm_frontend//@types/jest"],
        declaration = True,
        tsc = tsc,
        tsconfig = "//:tsconfig.json",
    )
    args = [
        "--no-cache",
        "--no-watchman",
        "--ci",
        # "--colors",
        # "--runInBand",  # TODO: makes shit faster?
    ]
    args.extend(["--config", "$(location %s)" % jest_config])
    args.extend(["--runTestsByPath", "$(locations :%s_ts)" % name])
    _jest_test(
        name = name,
        data = [jest_config, ":%s_ts" % name] + deps,
        args = args,
        **kwargs
    )
