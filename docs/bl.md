- [Bl](#bl)

# Bl

Business logic package contains a small class that is responsible for plugin:

- discovery
- life cycle
- connection with data layer (currently non is implemented)

![Figure 3. Bl package](ReactPlugins-Bl.png "Bl package")

Bl package has the following dependencies:

- [MobX](https://www.npmjs.com/package/mobx)
- Interfaces package (inside ```./packages/contracts```)

Bl is responsible for data delivery and management. View and Plugins are unaware where is the data or how to obtain it. Bl may contain logic for (but not limited to):

- auth
- service discovery
- data serialization/deserialization
- pub/sub
- etc...

Of course all of the above should not be in the same file/class ... Bl is a package and should be split once there is contrast between stable and unstable features inside of it.

Once you get the project to build and run feel free to run ```http://localhost:3000/packages/bl/index.html``` to see how the bl can be developed and tested on it's own.

---

Other related docs:

- [View](view.md)
- [Plugin](plugin.md)

[Back to README.md.](../README.md)
