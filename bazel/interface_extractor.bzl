"""Rules for scribbles."""

load("@build_bazel_rules_nodejs//:index.bzl", "js_library", "npm_package_bin")

def ts_extracted_interface(name, src, deps = [], rewrite = None):
    """Extracts the interface from the given class file.

    Args:
        name: the resulting ts_project name
        src: the source ts file
        deps: extra ts deps
        rewrite: import rewrite rules
    """

    if not src.endswith(".ts"):
        fail("'%s' is not a ts file" % src)
    sfile = src.rsplit(".", 2)[0]
    dfile = "%s_interface.d.ts" % sfile

    rewrite_rules_val = "{}"
    if rewrite:
        rewrite_rules_val = json.encode(rewrite)

    npm_package_bin(
        name = "%s.dts" % name,
        tool = "//tools:interface_extractor",
        data = [
            src,
            "//:tsconfig.json",
        ] + deps,
        outs = [dfile],
        args = [
            "-s",
            "$(location %s)" % src,
            "-o",
            "$@",
            "-t",
            "$(location //:tsconfig.json)",
            "-r",
            rewrite_rules_val,
        ],
    )

    js_library(
        name = name,
        srcs = [dfile],
    )
