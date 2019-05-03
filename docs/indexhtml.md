- [Composed example explanation](#composed-example-explanation)
  - [HEAD section](#head-section)
    - [runtime](#runtime)
    - [jQuery plugin needs](#jquery-plugin-needs)
    - [React plugin needs](#react-plugin-needs)
    - [Vue plugin needs](#vue-plugin-needs)
  - [BODY section](#body-section)
    - [Action buttons](#action-buttons)
    - [main setup](#main-setup)
    - [entities init](#entities-init)
    - [bottom scripts section](#bottom-scripts-section)

# Composed example explanation

After you execute ```npm run start``` and open the browser to the specified address you are going to see a working demo of the code.

In this section I am going over on what is going on inside ```./index.html``` and why.

## HEAD section

For faster demo and independence on internet during presentation, all third party scripts and CSS are downloaded in the ```./third-party``` folder.

### runtime

This section has all the main dependencies needed for the code to run. All of them are excluded inside the ```./configs/webpack.shared.js```

```html
    <!-- runtime -->
    <script src="/third-party/react.production.min.js"></script>
    <script src="/third-party/react-dom.production.min.js"></script>
    <script src="/third-party/mobx.umd.min.js"></script>
    <script src="/third-party/mobx-utils.umd.js"></script>
    <script src="/third-party/mobx-react.min.js"></script>
    <script src="/third-party/eventemitter3.min.js"></script>
```

### jQuery plugin needs

Random carousel plugin I found via google. Original code resides on [this link](https://albert-cyberhulk.github.io/jQuery-Carousel/example/index.html).

The CSS and JS were modified a bit because of naming colisions.

```html
    <!-- jQuery plugin needs -->
    <link rel="stylesheet" href="/third-party/cc_styles.css">
    <script src="/third-party/jquery-3.4.0.min.js"></script>
    <script src="/third-party/cc_script.js"></script>
```

### React plugin needs

First search result in google for [react carousel](https://www.npmjs.com/package/react-responsive-carousel) was used for the React integration demo.

Please note that the source code for the React plugin is much simpler than the rest. The implementation avoids the side effect ridden code and browser API calls that are needed in the other examples.

```html
    <!-- React plugin needs -->
    <link rel="stylesheet" href="/third-party/carousel.min.css">
```

### Vue plugin needs

I don't know Vue, so it's integration is not much different than the jQuery on. What I see is that if used with TS Vue components could be made injectable in much more robust way. Link to the source of the component - [here](https://www.npmjs.com/package/vueperslides).

```html
    <!-- Vue plugin needs -->
    <link href="/third-party/vueperslides.css" rel="stylesheet">
    <link rel="stylesheet" href="/third-party/vue.css">
    <script src="/third-party/vue.min.js"></script>
    <script src="/third-party/vueperslides.umd.min.js"></script>
```

## BODY section

Body contains markup for few different purposes.

### Action buttons

Used to start stop different entities in conjecture with the ```runAction``` function. 

```html
    <button onclick="runAction('view', 'activate')">Activate view</button>
    <button onclick="runAction('view', 'deactivate')">Deactivate view</button>
```

```javascript
    function runAction(entity, action) { window[entity][action](); }
```

### main setup

Only thing we need here is the message bus instance to pass around.

```javascript
    const MBUS = new EventEmitter();
```

### entities init

For the demo purposes we need access to all entities, thus we setup global vars. In reality these are going to be wrapped inside your module and not be accessible from the global namespace.

```javascript
  // setup global vars for quick access to all instances
  var view, bl, plugin1, plugin2, plugin3, plugin4;
```

WOW, what's with the ```setTimeouts```!?

All the entities are talking in async manner. It doesn't matter in what order we activate them. For the purposes of simulating async/lazy loading on the page the instantiations are wrapped in individual setTimeouts.

Note that below we have plugin1 init before the view and the bl. Plugin2 inits after the view and before the bl. Plugins 3 and 4 init after everything else is running.

```javascript
    window.addEventListener("load", () => {
        setTimeout(() => {
            view = new demo_view.View("app", { mBus: MBUS });
            view.activate();
        }, 100)
        setTimeout(() => {
            bl = new demo_bl.Bl(MBUS);
        }, 500)
        setTimeout(() => {
            plugin1 = new demo_plugin1.Plugin(MBUS);
        }, 0)
        setTimeout(() => {
            plugin2 = new demo_plugin2.Plugin(MBUS);
        }, 250)
        setTimeout(() => {
            plugin3 = new demo_plugin3.Plugin(MBUS);
        }, 750)
        setTimeout(() => {
            plugin4 = new demo_plugin4.Plugin(MBUS);
        }, 1000)
    });
```

### bottom scripts section

This section loads all the relevant scripts from the compiled packages.

```html
    <script async defer src="/_bundles/demo_bl.js"></script>
    <script async defer src="/_bundles/demo_view.js"></script>
    <script async defer src="/_bundles/demo_plugin1.js"></script>
    <script async defer src="/_bundles/demo_plugin2.js"></script>
    <script async defer src="/_bundles/demo_plugin3.js"></script>
    <script async defer src="/_bundles/demo_plugin4.js"></script>
```

---

[Back to README.md.](../README.md)