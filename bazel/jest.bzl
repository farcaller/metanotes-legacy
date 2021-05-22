"""Jest helper tools."""

load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm//jest-cli:index.bzl", _jest_test = "jest_test")

def ts_jest_test(name, srcs, deps = [], **kwargs):
    """Run a Jest test suite for a TS project.

    Args:
        name: name of the resulting test rule
        srcs: typescript sources
        deps: typescript/jest dependencies
        **kwargs: kwargs to pass down to the jest test
    """

    jest_config = "//:jest.ts.config.js"

    ts_project(
        name = "%s_ts" % name,
        srcs = srcs,
        deps = deps + [
            "@npm//@types/jest",
            "@npm//@types/react-native",
        ],
        declaration = True,
        tsconfig = "//:tsconfig.jest.json",
    )
    args = [
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--verbose",
        # "--colors",
        # "--runInBand",  # TODO: makes shit faster?
    ]
    args.extend(["--config", "$(location %s)" % jest_config])
    args.extend(["--runTestsByPath", "$(locations :%s_ts)" % name])
    _jest_test(
        name = name,
        data = [
            ":%s_ts" % name,
            jest_config,
            "//:babel.config.json",
            "@npm//@babel/core",
            "@npm//@babel/plugin-proposal-decorators",
            "@npm//@babel/preset-env",
            "@npm//@types/react-native",
            "@npm//babel-jest",
            "@npm//babel-plugin-transform-typescript-metadata",
            "@npm//core-js",
            "@npm//react-native",
            "@npm//react-test-renderer",
        ] + deps,
        args = args,
        **kwargs
    )
