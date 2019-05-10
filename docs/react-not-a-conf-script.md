# Plugins

## Attention

- Feel free to interupt me at any point for questions
- Let's make a clear distinction between "React application" AND "Application using React as a view engine", I already have an application, and have 0 intentions to re-write it

## Intro to architecture

Since the main focus of this presentation is architecture. I want to make a few points clear before I move to the specific problem and it's solution.

1. Software architecture is about making fundamental structural choices which are costly to change once implemented.
2. Qualities of an architecture
- Performance – shows the response of the system to performing certain actions for a certain period of time.
- Interoperability – is an attribute of the system or part of the system that is responsible for its operation and the transmission of data and its exchange with other external systems.
- Usability – is one of the most important attributes, because, unlike in cases with other attributes, users can see directly how well this attribute of the system is worked out.
- Reliability – is an attribute of the system responsible for the ability to continue to operate under predefined conditions.
- Availability – is part of reliability and is expressed as the ratio of the available system time to the total working time.
- Security – ability of the system to reduce the likelihood of malicious or accidental actions as well as the possibility of theft or loss of information.
- Maintainability –ability of the system to support changes.
- Modifiability – determines how many common changes need to be made to the system to make changes to each individual item.
- Testability – how well the system allows performing tests, according to predefined criteria.
- Scalability – handle load increases without decreasing performance, or the possibility to rapidly increase the load.
- Reusability – chance of using a component or system in other components/systems with small or no change.
- Supportability – useful information for identifying and solving problems.

## My Problem

TTM...

How fast I can release new feature. How many systems are affected? Is restart of the system involved, can i t be avoided?

## What is a plugin

- A piece of software - a component
- Extends or enhances existing features
- Adds new features
- Can not live on it's own

Do you remember the time when you needed to reboot your PC to add/remove connected devices?

What is the best plug-in system you know?

In order to get a plug-in we need to have a system. System with clear contract for communication between the components. Let's call them interfaces :)

Let's examine an example interface...

## An interface

Every interface has some strict requirements for the consumer to meet

### Sockets

Like these sockets that work with specific plugs only.
But can be extended to handle other plugs via various crazy adapters.

### Adapters

Which in turn allows you to use...

### Appliances

...you appliances.
However, plugs are only part of the story. See the plug is your data connection. You still need to comply with the data standard in order to connect safely.

### Extension cord

If you run out of sockets, you may purchase an extension cord. The nice thing of plug-ins is, that they may come in many forms. Even plug-in that enables you to connect to more plugins.

## Back to software...

### Software UI examples

We are surrounded by software that is extended via:

- plugins
- apps
- applications
- programs
- whatever

Yet when we design for the web, we usually don't think in this way.

## Plugin based solution

- Host application      -> We need a host application/environment an ecosystem where our features are going to be plugged.
- Strict interface      -> that is going to tell us what/how we must do to be compatible with our host
- Communication         -> There are multiple ways to achieve it. I am using a message bus in the reference implementation.
- Business Logic        -> the core of our product
- View                  -> presentation of the features
- Plug-ins              -> extensions
- Packages              -> distribution
- Version management

Thus today I am going to present a solution to this problem. One that I am going to share together with all of it's documentation at the end of this talk.

This outline shows some of the major things that need to be considerd when we are creating a plugin based system.

I am not going to focus on the "host application". Any web app could be used as a base. I am also not going to focus on version management (although there is info about it in the github repo docs)

The focus of this talk is a feature developed as a plugin based system.

UML much? :)

## Pros

- independent development
- independent deployability
- independent release cycle
- small easy to test bundles of code
- reduced regression scope
- technology agnosticity
- async loading of the packages
- easier to manage packages that are no longer used

## Cons

- some code duplication is possible, but prefferable to coupling between components
- more experienced team is needed to setup the foundation for this architecture
- every component is coupled to the same interfaces package. Breaking changes to the interfaces might lead to a massive update and redeploy of the components. Interfaces package must be stable, and this is not trivial to achieve. There are ways to mitigate this such as: introducing new interfaces into new more unstable packages.
- your offering is spread into many packages, sometimes it becomes harder to organize. Example: a customer's product is combination of views/bls/plugins with different versions.
- harder to see the big picture

## Demo

## Summary
