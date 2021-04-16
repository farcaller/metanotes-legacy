"""UI platfrom templating rules."""

def _tsx_ui_template_impl(ctx):
    out = ctx.actions.declare_file(ctx.label.name + ".tsx")
    ctx.actions.expand_template(
        output = out,
        template = ctx.file.template,
        substitutions = {"{UI_LIBRARY}": ctx.attr.ui_library},
    )
    return [DefaultInfo(files = depset([out]))]

tsx_ui_template = rule(
    implementation = _tsx_ui_template_impl,
    attrs = {
        "ui_library": attr.string(mandatory = True),
        "template": attr.label(
            allow_single_file = [".tpl.tsx"],
            mandatory = True,
        ),
    },
    outputs = {"generated_file": "%{name}.tsx"},
)
