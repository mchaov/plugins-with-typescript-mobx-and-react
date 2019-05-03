# Plugin

The plugin package contains two main classes and few small helper functions. For more details check Figure 4. Plugin package.

![Figure 4. Plugin package](ReactPlugins-Plugin.png "Plugin package")

Plugin's true nature can be seen in Figure 5 (below). The "Presentation" component is implemented in the accepted "React" tech stack. However the "DIV" portion is free to be controlled by custom implementation:

- direct DOM manipulation
- VueJS
- Angular App
- jQuery...

![Figure 5. Plugin internals](ReactPlugins-PluginInternals.png "Plugin internals")

This gives us the ability to seamlessly integrade with our view engine. However we are retaining the option to implement third party components non-complient with our architecture.

Plugin packages in this demo share the following dependencies:

- [MobX](https://www.npmjs.com/package/mobx)
- [React](https://www.npmjs.com/package/react)
- [ReactDOM](https://www.npmjs.com/package/react-dom)
- Interfaces package (inside ```./packages/contracts```)

On Figure 6. you can observe that Plugin provides Presentation following our React integration needs. However inside this Presentation, we have an entity called DIV that is fully controlled based on the business needs. This DIV entity could be controlled with by a jQuery/Vue/React widget.

![Figure 6. Plugin runtime](ReactPlugins-PluginRuntime.png "Plugin runtime")

There are four different implementations of the plugin. They vary between them as they implement different approaches to the presentation.

The important thing is that all of them are using our React based contract to hook up to our view.

Once you get the project to build and run feel free to run ```http://localhost:3000/packages/plugin{1-4}/index.html``` to see how the different plugins can be developed and tested on their own. Every ```index.html``` for the plugins contains some business logic needed for it's rendering in the HTML. Feel free to hack around it and understand how/why it is working.

I know the names plugin1 to plugin4 are not very imaginative. However, I like the idea of exploring of what hides behind the names :) I promise it is worth it :)

---

Other related docs:

- [Bl](bl.md)
- [Plugin](plugin.md)

[Back to README.md.](../README.md)