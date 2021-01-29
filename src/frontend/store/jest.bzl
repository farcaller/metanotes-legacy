load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm_frontend//jest-cli:index.bzl", _jest_test = "jest_test")

def ts_jest_test(name, srcs, jest_config, deps = [], data = [], **kwargs):
    ts_project(
        name = "%s_ts" % name,
        srcs = srcs,
        deps = deps + ["@npm_frontend//@types/jest"],
        # data = data,

        declaration = True,
        tsc = "@npm_frontend//typescript/bin:tsc",
        tsconfig = "//:tsconfig.json",
    )
    native.filegroup(
        name = "%s_es5" % name,
        srcs = [":%s_ts" % name],
        # output_group = "es5_sources",
    )
    args = [
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--colors",
    ]
    args.extend(["--config", "$(location %s)" % jest_config])
    for src in srcs:
        args.extend(["--runTestsByPath", "$(locations :%s_es5)" % name])
    _jest_test(
        name = name,
        data = [jest_config, ":%s_es5" % name] + deps + data,
        args = args,
        # link_workspace_root = True,
        **kwargs
    )
