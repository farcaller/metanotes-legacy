workspace(
    name = "metanotes",
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# skylib
http_archive(
    name = "bazel_skylib",
    sha256 = "1c531376ac7e5a180e0237938a2536de0c54d93f5c278634818e0efc952dd56c",
    urls = [
        "https://github.com/bazelbuild/bazel-skylib/releases/download/1.0.3/bazel-skylib-1.0.3.tar.gz",
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.0.3/bazel-skylib-1.0.3.tar.gz",
    ],
)

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

# nodejs
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "1134ec9b7baee008f1d54f0483049a97e53a57cd3913ec9d6db625549c98395a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.4.0/rules_nodejs-3.4.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    data = [
        # react-native-paper tries to be smart abot an optional react-native-vector-icons import.
        # Unfortunately that breaks rollup, so we replace the optional import with a concrete one.
        "//:patches/react-native-paper+4.7.2.patch",

        # live-server was last updated in 2018 :-(
        "//:patches/live-server+1.2.1.patch",
    ],
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# proto
http_archive(
    name = "rules_proto_grpc",
    sha256 = "7954abbb6898830cd10ac9714fbcacf092299fda00ed2baf781172f545120419",
    strip_prefix = "rules_proto_grpc-3.1.1",
    urls = ["https://github.com/rules-proto-grpc/rules_proto_grpc/archive/3.1.1.tar.gz"],
)

load("@rules_proto_grpc//:repositories.bzl", "rules_proto_grpc_repos", "rules_proto_grpc_toolchains")

rules_proto_grpc_toolchains()

rules_proto_grpc_repos()

load("@rules_proto_grpc//js:repositories.bzl", "js_repos")

js_repos()

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

# docker
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "1698624e878b0607052ae6131aa216d45ebb63871ec497f26c67455b34119c80",
    strip_prefix = "rules_docker-0.15.0",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.15.0/rules_docker-v0.15.0.tar.gz"],
)

load(
    "@io_bazel_rules_docker//toolchains/docker:toolchain.bzl",
    docker_toolchain_configure = "toolchain_configure",
)

docker_toolchain_configure(
    name = "docker_config",
    docker_path = "/usr/bin/docker",
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)

container_repositories()

load("@io_bazel_rules_docker//repositories:deps.bzl", container_deps = "deps")

container_deps()

load(
    "@io_bazel_rules_docker//nodejs:image.bzl",
    _nodejs_image_repos = "repositories",
)

_nodejs_image_repos()

load("@io_bazel_rules_docker//container:pull.bzl", "container_pull")

container_pull(
    name = "envoy",
    registry = "registry.hub.docker.com",
    repository = "envoyproxy/envoy-alpine",
    tag = "v1.16-latest",
)

container_pull(
    name = "nginx",
    registry = "registry.hub.docker.com",
    repository = "library/nginx",
    tag = "1.19-alpine",
)

# grpcwebproxy
http_archive(
    name = "com_github_improbable_eng_grpcwebproxy_linux",
    build_file = "@//src/grpc-web-proxy/devproxy:grpcwebproxy.BUILD",
    sha256 = "fd7f52232a7cb4b49aa6aba1c294b2397028e751b8a533ef3ef44309faff4aea",
    urls = [
        "https://github.com/improbable-eng/grpc-web/releases/download/v0.14.0/grpcwebproxy-v0.14.0-linux-x86_64.zip",
    ],
)

http_archive(
    name = "com_github_improbable_eng_grpcwebproxy_osx",
    build_file = "@//src/grpc-web-proxy/devproxy:grpcwebproxy.BUILD",
    sha256 = "14a156529943251b81dbd3b6cdeba298af9a4a7950aa57c3b245e325159f8d81",
    urls = [
        "https://github.com/improbable-eng/grpc-web/releases/download/v0.14.0/grpcwebproxy-v0.14.0-osx-x86_64.zip",
    ],
)
