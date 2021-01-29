load("@npm//@bazel/typescript:index.bzl", "ts_project")

def ts_frontend_project(name, *args, **kwargs):
    if not "deps" in kwargs:
        kwargs["deps"] = []
    kwargs["deps"].append("@npm_frontend//@types")

    if not 'tsconfig' in kwargs:
        kwargs['tsconfig'] = "//:tsconfig.json"
    
    ts_project(
        name,
        declaration = True,
        tsc = "@npm_frontend//typescript/bin:tsc",
        *args,
        **kwargs
    )
