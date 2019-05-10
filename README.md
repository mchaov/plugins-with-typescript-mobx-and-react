# Plugins with TypeScript, MobX, and React

- [Plugins with TypeScript, MobX, and React](#plugins-with-typescript-mobx-and-react)
  - [Installation & Running](#installation--running)
    - [Post compile/test folders](#post-compiletest-folders)
    - [.configs](#configs)
    - [Running the demo](#running-the-demo)
  - [Overview](#overview)
  - [What problem am I solving?](#what-problem-am-i-solving)
    - [What is a plugin?](#what-is-a-plugin)
    - [Why do we need such an architecture?](#why-do-we-need-such-an-architecture)
      - [Independent development](#independent-development)
      - [Independent deployability](#independent-deployability)
      - [Independent release cycle](#independent-release-cycle)
      - [Small easy to test bundles of code](#small-easy-to-test-bundles-of-code)
      - [Reduced regression scope](#reduced-regression-scope)
      - [Technology agnosticity](#technology-agnosticity)
      - [Async loading of the packages](#async-loading-of-the-packages)
    - [How do we control version of the suite?](#how-do-we-control-version-of-the-suite)
  - [Tech stack](#tech-stack)
    - [Why TypeScript](#why-typescript)
    - [Why MobX](#why-mobx)
    - [Why React](#why-react)
    - [Why EventEmitter3](#why-eventemitter3)
  - [Detailed design](#detailed-design)
    - [Contracts package](#contracts-package)
  - [Real life examples](#real-life-examples)
  - [Summary](#summary)
    - [What this architecture isn't](#what-this-architecture-isnt)
    - [Pros](#pros)
    - [Cons](#cons)

This repository contains an implementation of a reference architecture for plugin based UI. Highlights of this implementation are:

- loosely coupled components via interfaces
- independent development and deployability

Solution is developed with TypeScript, React, MobX.

Four plugins variations are provided in this repo:

- Direct DOM manipulation (no carousel)
- [jQuery Carousel](https://albert-cyberhulk.github.io/jQuery-Carousel/example/index.html)
- [React Carousel](https://www.npmjs.com/package/react-responsive-carousel)
- [Vue Carousel](https://www.npmjs.com/package/vueperslides)

(literaly took the first google results for the third-party scripts)

## Installation & Running

Install, build, run:

1. ```npm install```
2. ```npm run build:debug``` or ```npm run build:release```
3. ```npm run start```, then open [http://localhost:3000](http://localhost:3000)

To run the unit tests ```npm test:coverage``` or ```npm run test```.

### Post compile/test folders

- ```./coverage``` - contains code coverage report from the unit tests. Created by running the ```npm run test:coverage``` command.
- ```./_bundles``` - contains the compiled packages from running either ```npm run build:debug``` or ```npm run build:releaes```.

### .configs

File - Purpose

- ```cpuResolver.js``` calculates how many cores we can use for the build and test services. Trying to scale as much as possible to yield faster builds. Not needed for the demo, but part of my own building scripts :).
- ```jest.config.js``` - generic test config for Jest. It is the only reason we have .babelrc in the root folder. Babel is not being used to compile the TS in this project.
- ```jestsetup.js``` - Enzyme needs some initial setup. In addition I am using it to override ```console.error``` to actually throw. Makes for easier testing.
- ```sharedPlugins.js``` - configures the ForkTsCheckerWebpackPlugin for the different builds.
- ```snakeToCamel.js``` - transforms snake-case to camelCase.
- ```tslint.json``` - my idea of what should be configured for the TypeScript compiler to allow.
- ```webpack.{shared|debug|release}.js``` - all the magic of the builds happens here:
  - ```shared``` controls: target, entry, output, externals, resolve and module
  - ```debug``` changes mode to development and adds plugins related to development
  - ```release``` changes mode to production and adds plugins related to production

### Running the demo

After you execute ```npm run start``` and open the browser to the specified address you are going to see a working demo of the code.

In [this section](./docs/indexhtml.md) I am going over on what is going on inside ```./index.html``` and why.

## Overview

![Figure 1. Architecture overview](./docs/ReactPlugins-Overview.png "Architecture overview")

Simple implementation for plugin based solution focused on the UI. Implementation focuses on decoupled developement and independant deployability. For the purposes of this example project all the code is the folder ```./packages```. Consider every "package" a separate project, with it's own developmen and release cycles and repository.

This concept can be implemented with focus on plugins for the Bl as well.

**Where is the message bus on the picture?**
The message bus is defined by the interfaces package and must be supplied by the hosting application. It could be made available via DI. The message bus is not present on the overview because the point is to show only the components we are to develop. In addition: the message bus is not a explicit dependency of the packages. As long as it supports the interface any solution is going to work.

Developed using TDD approach. It should prove to be useful if someone decides to hack around the source. Tests cover the end to end flows of the components.

This architecture could be scaled between front-end and back-end by using a different means for communication between the components.

## What problem am I solving?

In short - time to market for new features. I need a way to release new features and variations of the same features using more or less the same business logic. This approach allows me to decouple pretty well and also enables me to use third-parties that are not complient with my codebase. In addtition I am getting many benefits - I can release new features without recompile/redeploy/restart. The existing code bundles are immutable. Furthermore ... I can download only what I need in order to render the page - if new feature is enabled from the CMS it is going to be downloaded on demand.

### What is a plugin?

**plug-in** */ˈplʌɡɪn/*

*adjective:* plugin

- able to be connected by means of a plug. "a plug-in kettle"
- (of a module or software) able to be added to a system to give extra features or functions.
"a plug-in graphics card"

*noun:* plugin

- a plug-in module or plug-in software.

The idea of a plugin is to future proof. Imagine your house without electric sockets, but proprietary ones. One for each: microwave, fridge, washing machine ... etc. If we don't have a standard of expandability, we can't expand...

It sounds intuitive to make things extendable/expandable. However, in software it is not working so well. Yes there are these big applications with massive plugin support, but how many you can list on top of your head? On the web the picture is far bleaker. We see very few good examples of plugin/extention abilities. Such examples are the many eCommerce platforms. They can be expanded with new functionality (via plugins) without re-compiling and re-booting the web application (or server itself).

So plugin software is such that allows you to expand a base application without the need to re-compilation, re-deployment or reboot of the said application.

Plugins communicate via interfaces and heavily rely on abstraction and dependency injection.

### Why do we need such an architecture?

As projects grow bigger and with more features over time, companies are facing increasing code complexity. This sort of architecture provides the following benefits:

- independent development
- independent deployability
- independent release cycle
- small easy to test bundles of code
- reduced regression scope
- technology agnosticity
- async loading of the packages

#### Independent development

It may sound simple to split off the development work onto 5-10 people. Once you have to scale over 1000 developers, simply relying on source control is not enough. You need an architecture that may support this kind of scale. In that sense development of plugins or micro-frontends or micro-services are very close to each other. Scaling of the development internally is not the only reason to go for such architecture. Once you have a stable foundation a company may decide to outsource part of the development to other contractors.

#### Independent deployability

In a service oriented world there is nothing worse than down time. If am able to release new software updates or as in this case extentions. It means I can release without rebooting my applications/servers. There are ways to mitigate down time if you have to. The point however is to remove complexity from a system, not to add it to manages softare design flaws.

#### Independent release cycle

A release cycle might take longer for some features than for others. If you have the ability to release features independently one from another - you may have different iteration lenght for them. This is giving you flexibility with your development.

#### Small easy to test bundles of code

This kind of DDD approach to feature splitting gives you smaller packages with lower area of impact. Package that contain few classes and are in the scope of LOC instead of KLOK are easier to reason about. The developers can easily create models of the packages in their head and discuss the source without even running it.

#### Reduced regression scope

When we introduce a new plugin that is following the contract, we do not expect regression on the busines logic, view and other plugin packages. The same goes for new features implementation in the Bl or View packages - no regression is expected on the plugins.

This doesn't mean we should not be doing integration tests. However, we do not need to conduct thorough testing of all aspects of the unaffected packages. For this project the tests suite runs very fast. Consider a system with gigabytes of source code which tests run for hours, maybe even days... This approach is going to yield packages with unit tests that run for just a couple of minutes.

#### Technology agnosticity

As long as the packages follow the interfaces we are getting the ability to implement them with different technology stacks. During projects growth we are facing three major challanges:

- third party content integration that is following a different tech stack
- new features requiring more modern tech stack/tools
- maintenance of the existing code base

While the plugins are following the provided contract they can have different implementation of their own presentation. In this demo you may find 4 different plugins relying on 4 different tech stacks to achieve the business goals.

In the case of the web - as long as the code is compiled to JavaScript, there is no reason not to use the tech stack of your own choice.

Example: message bus interface is implemented by a class working over the network that links with Bl running on the back end in whatever language/platform.

#### Async loading of the packages

Code can be loaded on the page on demand. Async communication via message bus ensures that components can link at any point in time.

How many plugins do you need to render the page? One - twenty? You may choose your download strategy based on your business requirements. While plugins are independently bundles and deployed, you don't need to redeploy or restart anything.

### How do we control version of the suite?

It is very easy to follow [semver](https://semver.org/) (MAJOR.FEATURE.PATCH) approach. Consider the version of the interfaces package as the major version.

For interfaces version 1.0.0, we ship packages starting with 1.

Other versioning approaches are also available but are not a focus of this document to discuss.

## Tech stack

This section explains some of the key decisions with regards to dependencies. It is not going to explore the reasons behind choosing **THIS** build tool or **THAT** testing/assertion library.

### Why TypeScript

The point here is not to explain all of the TypeScript's pros/cons nor compare to other type systems, but focus on why it was the tool of choise.

1. It is very easy to create interfaces only packages.
2. Static type checks ensure seamless implementation in production code and unit tests.
3. Easy to transform the code based on browser/module compatibility requirements.
4. Compile-time code improvements.
5. Solutions to different code scaling problems which this architecture is aiming to explore.

### Why MobX

1. MobX is react agnostic. It doesn't care if you use it with React and TypeScript, making this a flexible solution. Very easy to create adapters for other event driven implementations.
1. Very little amount of boiler plate code.
1. The redux pattern is just not suitable for this implementation.
1. Provides observable model with @decorators, making for super simple and readable implementations.
1. Internal state mutation provides improved performance for large scale applications dealing with a lot of fast updating data.

### Why React

Two main reasons:

1. Inital implementation for this concept was implemented in a company where React is **the** view library.
1. This demo was written and documented for [http://react-not-a-conf.com/](http://react-not-a-conf.com/) 11.05.2019.

Additional reasons:

1. Functional approach
1. Good rendering performance
1. Good TypeScript integration
1. React is super cool :)

No, there are no React hooks in this demo, as they are not relevant to the architecture.

### Why EventEmitter3

The message bus interface was designed based on the NodeJS EventEmitter implementation. The [event-emitter3](https://www.npmjs.com/package/event-emitter3) is designed for compatibility and performance. To quote the developers:

> "EventEmitter3 is a high performance EventEmitter. It has been micro-optimized for various of code paths making this, one of, if not the fastest EventEmitter available for Node.js. The module is API compatible with the EventEmitter that ships by default with Node.js but there are some slight differences..."

In practice any message bus can do the trick as long as there is no forced serialization/deserialization of the passed objects. This design expects us to pass objects by reference.

## Detailed design

This section provides a bit more light onto what is inside the different packages. Note that the different plugins implementation may vary! Thus only the general design of a plugin is being explored here.

[Event-emitter3](https://www.npmjs.com/package/event-emitter3) is not listed as dependency of any of the packages as it is compliant with our interfaces. Technically we do not depend on it, and you may notice inside the demo that it is not referenced anywhere. As long as you provide a message bus implementation compatible with our interfaces and requirements, the code is going to continue working as before. It is being imported only inside the unit tests and injected via the constructors in the "runtime" demo. Additional reason for that is that the event emitter is not the only package suitable for this kind of communication. Let's assume the Bl package is running on the back-end. The injected message bus could sport a web socket or SSE or even a simple polling implementation.

In the reference implementation all instances communicate over the same message channels. If the need to have multiple instances talking over multiple channels arises, there are different approaches to take. Examples: pass the enum with message channels via the constructor; pass a prefix/sufix to be used with the default message channels; etc.

Check the detailed docs per package:

- [View](./docs/view.md)
- [Bl](./docs/bl.md)
- [Plugin](./docs/plugin.md)
- [Composed example](./docs/indexhtml.md)

### Contracts package

Very simple package providing interfaces and enums.

**Why do we use interfaces and not base classes?**
Base classes expect some kind of implementation that could possibly tie you to a language/platform. There are other issues that could arise with the increasing scope of the product. On general we follow the GOF principle - "Always prefer composition over inheritance".

## Real life examples

Examples of plugin based UI architectures can be found in many places. A lot more advanced version of what is presented here is being used at [SBTech](www.sbtech.com) where I first developed this version of the concept with React and TypeScript. At SBTech we are using this approach for integration with different video streaming providers. A big surprise for us was that many streaming providers are using very big, and very old video players. The provided JS is usualy incompatible with React and TypeScript, not to mention ... huge in terms of KB. Some of the examples require us to load 400+ KB of JS, just to run a stream.

Plugin based systems such as [wordpress](https://wordpress.org), [magento](https://magento.com) are very common in the eCommerce space. Every web application build with such system is a mashup of plugins communicating via shared interface.

More or less the success of [jQuery](https://jquery.com) was because of how easy it is to create and distribute plugins for it.

Plugin based systems are also: your operating system, your mobile OS; complex applications as 3DSMax, Photoshop and others...

## Summary

This architecture solves a particular problem. To enable the company using it to deliver faster. Time to market is important for the business. This approach enables you to do more granular code reuse by splitting a feature into it's useful components. You are free to develop N number of plugins in parallel on top of the same business logic, injected into the same view. Same goes for the views and bl packages.

### What this architecture isn't

- This is not a cure for cancer.
- If you don't understand the pros/cons of this architecture, you should stop with the YouTube videos and read books for a while. If you saw this presentation on YouTube - this point is still valid!
- This is not how you do an entire application, but it shows how to plug stuff into one.
- Knowledge of this is not going to make you a better developer if you are not one already.
- This is not going to solve world hunger.
- This is not the answer for embedded systems or resource constrained environments (mobile web could be an exception). Example: your car's brakes, MRI scanners, real-time systems such as heart monitors and your granma's bypass.

### Pros

- independent development
- independent deployability
- independent release cycle
- small easy to test bundles of code
- reduced regression scope
- technology agnosticity
- async loading of the packages
- easier to manage packages that are no longer used

### Cons

- some code duplication is possible, but prefferable to coupling between components
- more experienced team is needed to setup the foundation for this architecture
- every component is coupled to the same interfaces package. Breaking changes to the interfaces might lead to a massive update and redeploy of the components. Interfaces package must be stable, and this is not trivial to achieve. There are ways to mitigate this such as: introducing new interfaces into new more unstable packages.
- your offering is spread into many packages, sometimes it becomes harder to organize. Example: a customer's product is combination of views/bls/plugins with different versions.
- harder to see the big picture

---

Check the detailed docs per package:

- [View](./docs/view.md)
- [Bl](./docs/bl.md)
- [Plugin](./docs/plugin.md)
- [Composed example](./docs/indexhtml.md)