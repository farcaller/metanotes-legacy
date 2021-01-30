def _scribble_gen_ts(ctx):
    outputs = []
    for f in ctx.files.srcs:
        sfile = f.basename.rsplit(".", 1)[0]
        dfile = sfile + ".ts"
        out_file = ctx.actions.declare_file(dfile, sibling = f)
        outputs.append(out_file)

    for i, o in zip(ctx.files.srcs, outputs):
        ctx.actions.run(
            inputs = [i],
            outputs = [o],
            progress_message = "Generating scribble %s" % i.short_path,
            executable = ctx.executable._scribblegen,
            arguments = [i.path, o.path],
        )
    return [DefaultInfo(files = depset(outputs))]

scribble_gen_ts = rule(
    implementation = _scribble_gen_ts,
    attrs = {
        "srcs": attr.label_list(mandatory = True, allow_files = True),
        "_scribblegen": attr.label(
            default = Label("//tools:scribblegen"),
            executable = True,
            cfg = "exec",
        ),
    },
)

def _scribble_gen_index(ctx):
    tpl_imports = []
    tpl_exports = []
    base_dir = ctx.outputs.index_file.dirname
    idx = 0
    for f in ctx.files.deps:
        name = "imp$" + str(idx)
        idx += 1

        if not f.path.startswith(base_dir):
            fail("source file '%s' not in the scope of '%s'" % (f, ctx.outputs.index_file))
        rel_path = f.path[len(base_dir):].rsplit(".", 1)[0]

        tpl_imports.append("import %s from '.%s';" % (name, rel_path))
        tpl_exports.append("  %s," % name)
    out = "\n".join(tpl_imports) + "\nexport default [\n" + "\n".join(tpl_exports) + "];\n"
    ctx.actions.write(ctx.outputs.index_file, out)

scribble_gen_index = rule(
    implementation = _scribble_gen_index,
    attrs = {
        "deps": attr.label_list(mandatory = True, allow_files = True),
    },
    outputs = {"index_file": "%{name}.ts"},
)
