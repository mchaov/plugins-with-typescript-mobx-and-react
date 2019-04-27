# plugins-with-typescript-mobx-and-react

Plugins based solution for decoupled FE with TypeScript, React, MobX.

![](./docs/ReactPlugins-Overview.png)

## Overview

Simple implementation for plugin based solution focused on the UI. Implementation focuses on decoupled developement and independant deployability. For the purposes of this example project all the code is the folder ```./packages```. However, consider every "package" a separate project, with it's own developmen and release cycles.

### Why do we need such an architecture?

As projects grow bigger and with more features over time, companies are facing increasing code complexity. This sort of architecture provides the following benefits:

- independent development
- independent deployability
- independent release cycle
- small easy to test bundles of code
- reduced regression scope
- technology agnosticity
- async loading of the packages

#### Reduced regression scope

When we introduce a new plugin that is following the contract, we do not expect regression on the busines logic and view packages. The same goes for new features implementation in the Bl or View packages - no regression is expected on the plugins.

This doesn't mean we should not be doing integration tests. However, we do not need to conduct thorough testing of all aspects of the unaffected packages. For this project the tests suite runs very fast. Consider a system with gigabytes of source code which tests run for hours, maybe even days...

#### Technology agnosticity

As long as the different packages follow the interfaces we are getting the ability to implement different packages with different technology stacks. During projcets growth we are facing two major challanges:

- third party content integration that is following a different tech stack
- new features requiring more modern tech stack/tools

### How do we control version of the suite?

It is very easy to follow [semver](https://semver.org/) (MAJOR.FEATURE.PATCH) approach. Consider the version of the interfaces package as the major version.

For interfaces version 1.0.0, we ship packages starting with 1.

Other versioning approaches are also available.

## 