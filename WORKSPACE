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
    sha256 = "4a5d654a4ccd4a4c24eca5d319d85a88a650edf119601550c95bf400c8cc897e",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.5.1/rules_nodejs-3.5.1.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    node_version = "16.2.0",
    package_json = ["//:package.json"],
    yarn_version = "1.22.10",
)

yarn_install(
    name = "npm",
    data = [
        # react-native-paper tries to be smart abot an optional react-native-vector-icons import.
        # Unfortunately that breaks rollup, so we replace the optional import with a concrete one.
        "//:patches/react-native-paper+4.9.1.patch",

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
    sha256 = "59d5b42ac315e7eadffa944e86e90c2990110a1c8075f1cd145f487e999d22b3",
    strip_prefix = "rules_docker-0.17.0",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.17.0/rules_docker-v0.17.0.tar.gz"],
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
