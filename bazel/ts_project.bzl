"""Rules for scribbles."""

load("@npm//@bazel/typescript:index.bzl", ts_project_ = "ts_project")

def ts_project(name, **kwargs):
    """Helper macro for the ts_project

    Args:
        name: the resulting ts_project name
        **kwargs: extra arguments for the ts_project
    """

    ts_project_(
        name = name,
        declaration = True,
        tsconfig = "//:tsconfig.json",
        **kwargs
    )
