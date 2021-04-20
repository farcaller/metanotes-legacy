# Metanotes

*Not an official Google project*

Metanotes is a personal wiki / knowledge base / digital commonplace journal. Unlike most of the personal wikis, Metanotes allows you to define the shape your content takes, by allowing you to describle rich UI within Metanotes itself. Extended Markdown syntax similar to MDX covers most of the daily needs of presentation custimization, Metanotes also supports custom React code to shape the layout in any way you might need.

Metanotes is based on react-native and considers web, iOS, Android and desktop as its primary build targets.

## Building from source

Metanotes uses [bazel](https://bazel.build/) as its build system, but you can build and run it with zero bazel knowledge, using the common JS toolset.

To run Metanotes locally in your browser you need to spin up 3 components: the frontend webserver, the backend server and the gRPC-Web Proxy:

```
$ git clone https://github.com/farcaller/metanotes.git
$ cd metanotes
$ yarn                   # installs all the dependencies
$ yarn watch:backend     # runs the backend with auto-reload
$ yarn run:grpcwebproxy  # runs the gRPC-Web proxy
$ yarn watch:web         # runs the frontend webserver
```

You can access the dev instance at [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

## License

Metanotes is distributed under Apache-2.0 license.
