load("@npm//@bazel/typescript:index.bzl", "ts_project")

def ts_frontend_project(name, *args, **kwargs):
    ts_project(
        name,
        declaration = True,
        tsc = "@npm_frontend//typescript/bin:tsc",
        tsconfig = "//:tsconfig.json",
        *args,
        **kwargs,
    )
