(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mobx')) :
	typeof define === 'function' && define.amd ? define(['exports', 'mobx'], factory) :
	(factory((global.mobxUtils = {}),global.mobx));
}(this, (function (exports,mobx) { 'use strict';

var NOOP = function () { };
var IDENTITY = function (_) { return _; };
function invariant(cond, message) {
    if (message === void 0) { message = "Illegal state"; }
    if (!cond)
        throw new Error("[mobx-utils] " + message);
}
var deprecatedMessages = [];
function deprecated(msg) {
    if (deprecatedMessages.indexOf(msg) !== -1)
        return;
    deprecatedMessages.push(msg);
    console.error("[mobx-utils] Deprecated: " + msg);
}
function addHiddenProp(object, propName, value) {
    Object.defineProperty(object, propName, {
        enumerable: false,
        writable: true,
        configurable: true,
        value: value
    });
}
var isGetter = function (x, name) { return (Object.getOwnPropertyDescriptor(x, name) || {}).get; };
var isFunction = function (x, name) { return typeof x[name] === "function"; };
var deepFunctions = function (x) {
    return x && x !== Object.prototype &&
        Object.getOwnPropertyNames(x)
            .filter(function (name) { return isGetter(x, name) || isFunction(x, name); })
            .concat(deepFunctions(Object.getPrototypeOf(x)) || []);
};
var distinctDeepFunctions = function (x) { return Array.from(new Set(deepFunctions(x))); };
var getAllMethodsAndProperties = function (x) { return distinctDeepFunctions(x).filter(function (name) { return name !== "constructor" && !~name.indexOf("__"); }); };

var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";
function caseImpl(handlers) {
    switch (this.state) {
        case PENDING:
            return handlers.pending && handlers.pending(this.value);
        case REJECTED:
            return handlers.rejected && handlers.rejected(this.value);
        case FULFILLED:
            return handlers.fulfilled ? handlers.fulfilled(this.value) : this.value;
    }
}
function createObservablePromise(origPromise, oldPromise) {
    invariant(arguments.length <= 2, "fromPromise expects up to two arguments");
    invariant(typeof origPromise === "function" ||
        (typeof origPromise === "object" &&
            origPromise &&
            typeof origPromise.then === "function"), "Please pass a promise or function to fromPromise");
    if (origPromise.isPromiseBasedObservable === true)
        return origPromise;
    if (typeof origPromise === "function") {
        // If it is a (reject, resolve function, wrap it)
        origPromise = new Promise(origPromise);
    }
    var promise = origPromise;
    origPromise.then(mobx.action("observableFromPromise-resolve", function (value) {
        promise.value = value;
        promise.state = FULFILLED;
    }), mobx.action("observableFromPromise-reject", function (reason) {
        promise.value = reason;
        promise.state = REJECTED;
    }));
    promise.isPromiseBasedObservable = true;
    promise.case = caseImpl;
    var oldData = oldPromise && oldPromise.state === FULFILLED ? oldPromise.value : undefined;
    mobx.extendObservable(promise, {
        value: oldData,
        state: PENDING
    }, {}, { deep: false });
    return promise;
}
/**
 * `fromPromise` takes a Promise, extends it with 2 observable properties that track
 * the status of the promise and returns it. The returned object has the following observable properties:
 *  - `value`: either the initial value, the value the Promise resolved to, or the value the Promise was rejected with. use `.state` if you need to be able to tell the difference.
 *  - `state`: one of `"pending"`, `"fulfilled"` or `"rejected"`
 *
 * And the following methods:
 * - `case({fulfilled, rejected, pending})`: maps over the result using the provided handlers, or returns `undefined` if a handler isn't available for the current promise state.
 * - `then((value: TValue) => TResult1 | PromiseLike<TResult1>, [(rejectReason: any) => any])`: chains additional handlers to the provided promise.
 *
 * The returned object implements `PromiseLike<TValue>`, so you can chain additional `Promise` handlers using `then`. You may also use it with `await` in `async` functions.
 *
 * Note that the status strings are available as constants:
 * `mobxUtils.PENDING`, `mobxUtils.REJECTED`, `mobxUtil.FULFILLED`
 *
 * fromPromise takes an optional second argument, a previously created `fromPromise` based observable.
 * This is useful to replace one promise based observable with another, without going back to an intermediate
 * "pending" promise state while fetching data. For example:
 *
 * ```javascript
 * @observer
 * class SearchResults extends React.Component {
 *   @observable searchResults
 *
 *   componentWillReceiveProps(nextProps) {
 *     if (nextProps.query !== this.props.query)
 *       this.comments = fromPromse(
 *         window.fetch("/search?q=" + nextProps.query),
 *         // by passing, we won't render a pending state if we had a successful search query before
 *         // rather, we will keep showing the previous search results, until the new promise resolves (or rejects)
 *         this.searchResults
 *       )
 *   }
 *
 *   render() {
 *     return this.searchResults.case({
 *        pending(staleValue) {
 *          return staleValue || "searching" // <- value might set to previous results while the promise is still pending
 *        },
 *        fullfilled(value) {
 *          return value // the fresh results
 *        },
 *        rejected(error) {
 *          return "Oops: " + error
 *        }
 *     })
 *   }
 * }
 * ```
 *
 * Observable promises can be created immediately in a certain state using
 * `fromPromise.reject(reason)` or `fromPromise.resolve(value?)`.
 * The main advantage of `fromPromise.resolve(value)` over `fromPromise(Promise.resolve(value))` is that the first _synchronously_ starts in the desired state.
 *
 * It is possible to directly create a promise using a resolve, reject function:
 * `fromPromise((resolve, reject) => setTimeout(() => resolve(true), 1000))`
 *
 * @example
 * const fetchResult = fromPromise(fetch("http://someurl"))
 *
 * // combine with when..
 * when(
 *   () => fetchResult.state !== "pending",
 *   () => {
 *     console.log("Got ", fetchResult.value)
 *   }
 * )
 *
 * // or a mobx-react component..
 * const myComponent = observer(({ fetchResult }) => {
 *   switch(fetchResult.state) {
 *      case "pending": return <div>Loading...</div>
 *      case "rejected": return <div>Ooops... {fetchResult.value}</div>
 *      case "fulfilled": return <div>Gotcha: {fetchResult.value}</div>
 *   }
 * })
 *
 * // or using the case method instead of switch:
 *
 * const myComponent = observer(({ fetchResult }) =>
 *   fetchResult.case({
 *     pending:   () => <div>Loading...</div>,
 *     rejected:  error => <div>Ooops.. {error}</div>,
 *     fulfilled: value => <div>Gotcha: {value}</div>,
 *   }))
 *
 * // chain additional handler(s) to the resolve/reject:
 *
 * fetchResult.then(
 *   (result) =>  doSomeTransformation(result),
 *   (rejectReason) => console.error('fetchResult was rejected, reason: ' + rejectReason)
 * ).then(
 *   (transformedResult) => console.log('transformed fetchResult: ' + transformedResult)
 * )
 *
 * @param {IThenable<T>} promise The promise which will be observed
 * @param {IThenable<T>} oldPromise? The promise which will be observed
 * @returns {IPromiseBasedObservable<T>}
 */
var fromPromise = createObservablePromise;
fromPromise.reject = mobx.action("fromPromise.reject", function (reason) {
    var p = fromPromise(Promise.reject(reason));
    p.state = REJECTED;
    p.value = reason;
    return p;
});
fromPromise.resolve = mobx.action("fromPromise.resolve", function (value) {
    if (value === void 0) { value = undefined; }
    var p = fromPromise(Promise.resolve(value));
    p.state = FULFILLED;
    p.value = value;
    return p;
});
/**
 * Returns true if the provided value is a promise-based observable.
 * @param value any
 * @returns {boolean}
 */
function isPromiseBasedObservable(value) {
    return value && value.isPromiseBasedObservable === true;
}

/**
 * Moves an item from one position to another, checking that the indexes given are within bounds.
 *
 * @example
 * const source = observable([1, 2, 3])
 * moveItem(source, 0, 1)
 * console.log(source.map(x => x)) // [2, 1, 3]
 *
 * @export
 * @param {ObservableArray<T>} target
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {ObservableArray<T>}
 */
function moveItem(target, fromIndex, toIndex) {
    checkIndex(target, fromIndex);
    checkIndex(target, toIndex);
    if (fromIndex === toIndex) {
        return;
    }
    var oldItems = target[mobx.$mobx].values;
    var newItems;
    if (fromIndex < toIndex) {
        newItems = oldItems.slice(0, fromIndex).concat(oldItems.slice(fromIndex + 1, toIndex + 1), [
            oldItems[fromIndex]
        ], oldItems.slice(toIndex + 1));
    }
    else {
        // toIndex < fromIndex
        newItems = oldItems.slice(0, toIndex).concat([
            oldItems[fromIndex]
        ], oldItems.slice(toIndex, fromIndex), oldItems.slice(fromIndex + 1));
    }
    target.replace(newItems);
    return target;
}
/**
 * Checks whether the specified index is within bounds. Throws if not.
 *
 * @private
 * @param {ObservableArray<any>} target
 * @param {number }index
 */
function checkIndex(target, index) {
    if (index < 0) {
        throw new Error("[mobx.array] Index out of bounds: " + index + " is negative");
    }
    var length = target[mobx.$mobx].values.length;
    if (index >= length) {
        throw new Error("[mobx.array] Index out of bounds: " + index + " is not smaller than " + length);
    }
}

/**
 * `lazyObservable` creates an observable around a `fetch` method that will not be invoked
 * until the observable is needed the first time.
 * The fetch method receives a `sink` callback which can be used to replace the
 * current value of the lazyObservable. It is allowed to call `sink` multiple times
 * to keep the lazyObservable up to date with some external resource.
 *
 * Note that it is the `current()` call itself which is being tracked by MobX,
 * so make sure that you don't dereference to early.
 *
 * @example
 * const userProfile = lazyObservable(
 *   sink => fetch("/myprofile").then(profile => sink(profile))
 * )
 *
 * // use the userProfile in a React component:
 * const Profile = observer(({ userProfile }) =>
 *   userProfile.current() === undefined
 *   ? <div>Loading user profile...</div>
 *   : <div>{userProfile.current().displayName}</div>
 * )
 *
 * // triggers refresh the userProfile
 * userProfile.refresh()
 *
 * @param {(sink: (newValue: T) => void) => void} fetch method that will be called the first time the value of this observable is accessed. The provided sink can be used to produce a new value, synchronously or asynchronously
 * @param {T} [initialValue=undefined] optional initialValue that will be returned from `current` as long as the `sink` has not been called at least once
 * @returns {{
 *     current(): T,
 *     refresh(): T,
 *     reset(): T
 *     pendind: boolean
 * }}
 */
function lazyObservable(fetch, initialValue) {
    if (initialValue === void 0) { initialValue = undefined; }
    var started = false;
    var value = mobx.observable.box(initialValue, { deep: false });
    var pending = mobx.observable.box(false);
    var currentFnc = function () {
        if (!started) {
            started = true;
            pending.set(true);
            fetch(function (newValue) {
                mobx._allowStateChanges(true, function () {
                    value.set(newValue);
                    pending.set(false);
                });
            });
        }
        return value.get();
    };
    var resetFnc = mobx.action("lazyObservable-reset", function () {
        started = false;
        value.set(initialValue);
        return value.get();
    });
    return {
        current: currentFnc,
        refresh: function () {
            if (started) {
                started = false;
                return currentFnc();
            }
            else {
                return value.get();
            }
        },
        reset: function () {
            return resetFnc();
        },
        get pending() {
            return pending.get();
        }
    };
}

/**
 * `fromResource` creates an observable whose current state can be inspected using `.current()`,
 * and which can be kept in sync with some external datasource that can be subscribed to.
 *
 * The created observable will only subscribe to the datasource if it is in use somewhere,
 * (un)subscribing when needed. To enable `fromResource` to do that two callbacks need to be provided,
 * one to subscribe, and one to unsubscribe. The subscribe callback itself will receive a `sink` callback, which can be used
 * to update the current state of the observable, allowing observes to react.
 *
 * Whatever is passed to `sink` will be returned by `current()`. The values passed to the sink will not be converted to
 * observables automatically, but feel free to do so.
 * It is the `current()` call itself which is being tracked,
 * so make sure that you don't dereference to early.
 *
 * For inspiration, an example integration with the apollo-client on [github](https://github.com/apollostack/apollo-client/issues/503#issuecomment-241101379),
 * or the [implementation](https://github.com/mobxjs/mobx-utils/blob/1d17cf7f7f5200937f68cc0b5e7ec7f3f71dccba/src/now.ts#L43-L57) of `mobxUtils.now`
 *
 * The following example code creates an observable that connects to a `dbUserRecord`,
 * which comes from an imaginary database and notifies when it has changed.
 *
 * @example
 * function createObservableUser(dbUserRecord) {
 *   let currentSubscription;
 *   return fromResource(
 *     (sink) => {
 *       // sink the current state
 *       sink(dbUserRecord.fields)
 *       // subscribe to the record, invoke the sink callback whenever new data arrives
 *       currentSubscription = dbUserRecord.onUpdated(() => {
 *         sink(dbUserRecord.fields)
 *       })
 *     },
 *     () => {
 *       // the user observable is not in use at the moment, unsubscribe (for now)
 *       dbUserRecord.unsubscribe(currentSubscription)
 *     }
 *   )
 * }
 *
 * // usage:
 * const myUserObservable = createObservableUser(myDatabaseConnector.query("name = 'Michel'"))
 *
 * // use the observable in autorun
 * autorun(() => {
 *   // printed everytime the database updates its records
 *   console.log(myUserObservable.current().displayName)
 * })
 *
 * // ... or a component
 * const userComponent = observer(({ user }) =>
 *   <div>{user.current().displayName}</div>
 * )
 *
 * @export
 * @template T
 * @param {(sink: (newValue: T) => void) => void} subscriber
 * @param {IDisposer} [unsubscriber=NOOP]
 * @param {T} [initialValue=undefined] the data that will be returned by `get()` until the `sink` has emitted its first data
 * @returns {{
 *     current(): T;
 *     dispose(): void;
 *     isAlive(): boolean;
 * }}
 */
function fromResource(subscriber, unsubscriber, initialValue) {
    if (unsubscriber === void 0) { unsubscriber = NOOP; }
    if (initialValue === void 0) { initialValue = undefined; }
    var isActive = false;
    var isDisposed = false;
    var value = initialValue;
    var suspender = function () {
        if (isActive) {
            isActive = false;
            unsubscriber();
        }
    };
    var atom = mobx.createAtom("ResourceBasedObservable", function () {
        invariant(!isActive && !isDisposed);
        isActive = true;
        subscriber(function (newValue) {
            mobx._allowStateChanges(true, function () {
                value = newValue;
                atom.reportChanged();
            });
        });
    }, suspender);
    return {
        current: function () {
            invariant(!isDisposed, "subscribingObservable has already been disposed");
            var isBeingTracked = atom.reportObserved();
            if (!isBeingTracked && !isActive)
                console.warn("Called `get` of a subscribingObservable outside a reaction. Current value will be returned but no new subscription has started");
            return value;
        },
        dispose: function () {
            isDisposed = true;
            suspender();
        },
        isAlive: function () { return isActive; }
    };
}

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function observableSymbol() {
    return (typeof Symbol === "function" && Symbol.observable) || "@@observable";
}
function self() {
    return this;
}
/**
 * Converts an expression to an observable stream (a.k.a. TC 39 Observable / RxJS observable).
 * The provided expression is tracked by mobx as long as there are subscribers, automatically
 * emitting when new values become available. The expressions respect (trans)actions.
 *
 * @example
 *
 * const user = observable({
 *   firstName: "C.S",
 *   lastName: "Lewis"
 * })
 *
 * Rx.Observable
 *   .from(mobxUtils.toStream(() => user.firstname + user.lastName))
 *   .scan(nameChanges => nameChanges + 1, 0)
 *   .subscribe(nameChanges => console.log("Changed name ", nameChanges, "times"))
 *
 * @export
 * @template T
 * @param {() => T} expression
 * @param {boolean} fireImmediately (by default false)
 * @returns {IObservableStream<T>}
 */
function toStream(expression, fireImmediately) {
    if (fireImmediately === void 0) { fireImmediately = false; }
    var _a;
    var computedValue = mobx.computed(expression);
    return _a = {
            subscribe: function (observer) {
                return {
                    unsubscribe: computedValue.observe(typeof observer === "function"
                        ? function (_a) {
                            var newValue = _a.newValue;
                            return observer(newValue);
                        }
                        : function (_a) {
                            var newValue = _a.newValue;
                            return observer.next(newValue);
                        }, fireImmediately)
                };
            }
        }, _a[observableSymbol()] = self, _a;
}
var StreamListener = /** @class */ (function () {
    function StreamListener(observable$$1, initialValue) {
        var _this = this;
        this.current = undefined;
        mobx.runInAction(function () {
            _this.current = initialValue;
            _this.subscription = observable$$1.subscribe(_this);
        });
    }
    StreamListener.prototype.dispose = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    StreamListener.prototype.next = function (value) {
        this.current = value;
    };
    StreamListener.prototype.complete = function () {
        this.dispose();
    };
    StreamListener.prototype.error = function (value) {
        this.current = value;
        this.dispose();
    };
    __decorate([
        mobx.observable.ref
    ], StreamListener.prototype, "current", void 0);
    __decorate([
        mobx.action.bound
    ], StreamListener.prototype, "next", null);
    __decorate([
        mobx.action.bound
    ], StreamListener.prototype, "complete", null);
    __decorate([
        mobx.action.bound
    ], StreamListener.prototype, "error", null);
    return StreamListener;
}());
/**
 *
 * Converts a subscribable, observable stream (TC 39 observable / RxJS stream)
 * into an object which stores the current value (as `current`). The subscription can be cancelled through the `dispose` method.
 * Takes an initial value as second optional argument
 *
 * @example
 * const debouncedClickDelta = MobxUtils.fromStream(Rx.Observable.fromEvent(button, 'click')
 *     .throttleTime(1000)
 *     .map(event => event.clientX)
 *     .scan((count, clientX) => count + clientX, 0)
 * )
 *
 * autorun(() => {
 *     console.log("distance moved", debouncedClickDelta.current)
 * })
 *
 * @export
 * @template T
 * @param {IObservableStream<T>} observable
 * @returns {{
 *     current: T;
 *     dispose(): void;
 * }}
 */
function fromStream(observable$$1, initialValue) {
    if (initialValue === void 0) { initialValue = undefined; }
    return new StreamListener(observable$$1, initialValue);
}

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RESERVED_NAMES = ["model", "reset", "submit", "isDirty", "isPropertyDirty", "resetProperty"];
var ViewModel = /** @class */ (function () {
    function ViewModel(model) {
        var _this = this;
        this.model = model;
        this.localValues = mobx.observable.map({});
        this.localComputedValues = mobx.observable.map({});
        this.isPropertyDirty = function (key) {
            return _this.localValues.has(key);
        };
        invariant(mobx.isObservableObject(model), "createViewModel expects an observable object");
        // use this helper as Object.getOwnPropertyNames doesn't return getters
        getAllMethodsAndProperties(model).forEach(function (key) {
            if (key === mobx.$mobx || key === "__mobxDidRunLazyInitializers") {
                return;
            }
            invariant(RESERVED_NAMES.indexOf(key) === -1, "The propertyname " + key + " is reserved and cannot be used with viewModels");
            if (mobx.isComputedProp(model, key)) {
                var derivation = mobx._getAdministration(model, key).derivation; // Fixme: there is no clear api to get the derivation
                _this.localComputedValues.set(key, mobx.computed(derivation.bind(_this)));
            }
            var enumerable = Object.getOwnPropertyDescriptor(model, key).enumerable;
            Object.defineProperty(_this, key, {
                enumerable: enumerable,
                configurable: true,
                get: function () {
                    if (mobx.isComputedProp(model, key))
                        return _this.localComputedValues.get(key).get();
                    if (_this.isPropertyDirty(key))
                        return _this.localValues.get(key);
                    else
                        return _this.model[key];
                },
                set: mobx.action(function (value) {
                    if (value !== _this.model[key]) {
                        _this.localValues.set(key, value);
                    }
                    else {
                        _this.localValues.delete(key);
                    }
                })
            });
        });
    }
    Object.defineProperty(ViewModel.prototype, "isDirty", {
        get: function () {
            return this.localValues.size > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "changedValues", {
        get: function () {
            return this.localValues.toJS();
        },
        enumerable: true,
        configurable: true
    });
    ViewModel.prototype.submit = function () {
        var _this = this;
        mobx.keys(this.localValues).forEach(function (key) {
            var source = _this.localValues.get(key);
            var destination = _this.model[key];
            if (mobx.isObservableArray(destination)) {
                destination.replace(source);
            }
            else if (mobx.isObservableMap(destination)) {
                destination.clear();
                destination.merge(source);
            }
            else if (!mobx.isComputed(source)) {
                
                _this.model[key] = source;
            }
        });
        this.localValues.clear();
    };
    ViewModel.prototype.reset = function () {
        this.localValues.clear();
    };
    ViewModel.prototype.resetProperty = function (key) {
        this.localValues.delete(key);
    };
    __decorate$1([
        mobx.computed
    ], ViewModel.prototype, "isDirty", null);
    __decorate$1([
        mobx.computed
    ], ViewModel.prototype, "changedValues", null);
    __decorate$1([
        mobx.action.bound
    ], ViewModel.prototype, "submit", null);
    __decorate$1([
        mobx.action.bound
    ], ViewModel.prototype, "reset", null);
    __decorate$1([
        mobx.action.bound
    ], ViewModel.prototype, "resetProperty", null);
    return ViewModel;
}());
/**
 * `createViewModel` takes an object with observable properties (model)
 * and wraps a viewmodel around it. The viewmodel proxies all enumerable properties of the original model with the following behavior:
 *  - as long as no new value has been assigned to the viewmodel property, the original property will be returned.
 *  - any future change in the model will be visible in the viewmodel as well unless the viewmodel property was dirty at the time of the attempted change.
 *  - once a new value has been assigned to a property of the viewmodel, that value will be returned during a read of that property in the future. However, the original model remain untouched until `submit()` is called.
 *
 * The viewmodel exposes the following additional methods, besides all the enumerable properties of the model:
 * - `submit()`: copies all the values of the viewmodel to the model and resets the state
 * - `reset()`: resets the state of the viewmodel, abandoning all local modifications
 * - `resetProperty(propName)`: resets the specified property of the viewmodel
 * - `isDirty`: observable property indicating if the viewModel contains any modifications
 * - `isPropertyDirty(propName)`: returns true if the specified property is dirty
 * - `changedValues`: returns a key / value map with the properties that have been changed in the model so far
 * - `model`: The original model object for which this viewModel was created
 *
 * You may use observable arrays, maps and objects with `createViewModel` but keep in mind to assign fresh instances of those to the viewmodel's properties, otherwise you would end up modifying the properties of the original model.
 * Note that if you read a non-dirty property, viewmodel only proxies the read to the model. You therefore need to assign a fresh instance not only the first time you make the assignment but also after calling `reset()` or `submit()`.
 *
 * @example
 * class Todo {
 *   \@observable title = "Test"
 * }
 *
 * const model = new Todo()
 * const viewModel = createViewModel(model);
 *
 * autorun(() => console.log(viewModel.model.title, ",", viewModel.title))
 * // prints "Test, Test"
 * model.title = "Get coffee"
 * // prints "Get coffee, Get coffee", viewModel just proxies to model
 * viewModel.title = "Get tea"
 * // prints "Get coffee, Get tea", viewModel's title is now dirty, and the local value will be printed
 * viewModel.submit()
 * // prints "Get tea, Get tea", changes submitted from the viewModel to the model, viewModel is proxying again
 * viewModel.title = "Get cookie"
 * // prints "Get tea, Get cookie" // viewModel has diverged again
 * viewModel.reset()
 * // prints "Get tea, Get tea", changes of the viewModel have been abandoned
 *
 * @param {T} model
 * @returns {(T & IViewModel<T>)}
 * ```
 */
function createViewModel(model) {
    return new ViewModel(model);
}

/**
 * Like normal `when`, except that this `when` will automatically dispose if the condition isn't met within a certain amount of time.
 *
 * @example
 * test("expect store to load", t => {
 *   const store = {
 *     items: [],
 *     loaded: false
 *   }
 *   fetchDataForStore((data) => {
 *     store.items = data;
 *     store.loaded = true;
 *   })
 *   whenWithTimeout(
 *     () => store.loaded
 *     () => t.end()
 *     2000,
 *     () => t.fail("store didn't load with 2 secs")
 *   )
 * })
 *
 *
 * @export
 * @param {() => boolean} expr see when, the expression to await
 * @param {() => void} action see when, the action to execut when expr returns truthy
 * @param {number} [timeout=10000] maximum amount when spends waiting before giving up
 * @param {any} [onTimeout=() => {}] the ontimeout handler will be called if the condition wasn't met within the given time
 * @returns {IDisposer} disposer function that can be used to cancel the when prematurely. Neither action or onTimeout will be fired if disposed
 */
function whenWithTimeout(expr, action$$1, timeout, onTimeout) {
    if (timeout === void 0) { timeout = 10000; }
    if (onTimeout === void 0) { onTimeout = function () { }; }
    deprecated("whenWithTimeout is deprecated, use mobx.when with timeout option instead");
    return mobx.when(expr, action$$1, {
        timeout: timeout,
        onError: onTimeout
    });
}

/**
 * MobX normally suspends any computed value that is not in use by any reaction,
 * and lazily re-evaluates the expression if needed outside a reaction while not in use.
 * `keepAlive` marks a computed value as always in use, meaning that it will always fresh, but never disposed automatically.
 *
 * @example
 * const obj = observable({
 *   number: 3,
 *   doubler: function() { return this.number * 2 }
 * })
 * const stop = keepAlive(obj, "doubler")
 *
 * @param {Object} target an object that has a computed property, created by `@computed` or `extendObservable`
 * @param {string} property the name of the property to keep alive
 * @returns {IDisposer} stops this keep alive so that the computed value goes back to normal behavior
 */
/**
 * @example
 * const number = observable(3)
 * const doubler = computed(() => number.get() * 2)
 * const stop = keepAlive(doubler)
 * // doubler will now stay in sync reactively even when there are no further observers
 * stop()
 * // normal behavior, doubler results will be recomputed if not observed but needed, but lazily
 *
 * @param {IComputedValue<any>} computedValue created using the `computed` function
 * @returns {IDisposer} stops this keep alive so that the computed value goes back to normal behavior
 */
function keepAlive(_1, _2) {
    var computed$$1 = mobx.getAtom(_1, _2);
    if (!computed$$1)
        throw new Error("No computed provided, please provide an object created with `computed(() => expr)` or an object + property name");
    return computed$$1.observe(function () { });
}

/**
 * `queueProcessor` takes an observable array, observes it and calls `processor`
 * once for each item added to the observable array, optionally deboucing the action
 *
 * @example
 * const pendingNotifications = observable([])
 * const stop = queueProcessor(pendingNotifications, msg => {
 *   // show Desktop notification
 *   new Notification(msg);
 * })
 *
 * // usage:
 * pendingNotifications.push("test!")
 *
 * @param {T[]} observableArray observable array instance to track
 * @param {(item: T) => void} processor action to call per item
 * @param {number} [debounce=0] optional debounce time in ms. With debounce 0 the processor will run synchronously
 * @returns {IDisposer} stops the processor
 */
function queueProcessor(observableArray, processor, debounce) {
    if (debounce === void 0) { debounce = 0; }
    if (!mobx.isObservableArray(observableArray))
        throw new Error("Expected observable array as first argument");
    if (!mobx.isAction(processor))
        processor = mobx.action("queueProcessor", processor);
    var runner = function () {
        // construct a final set
        var items = observableArray.slice(0);
        // clear the queue for next iteration
        mobx.runInAction(function () { return observableArray.splice(0); });
        // fire processor
        items.forEach(processor);
    };
    if (debounce > 0)
        return mobx.autorun(runner, { delay: debounce });
    else
        return mobx.autorun(runner);
}

/**
 * `chunkProcessor` takes an observable array, observes it and calls `processor`
 * once for a chunk of items added to the observable array, optionally deboucing the action.
 * The maximum chunk size can be limited by number.
 * This allows both, splitting larger into smaller chunks or (when debounced) combining smaller
 * chunks and/or single items into reasonable chunks of work.
 *
 * @example
 * const trackedActions = observable([])
 * const stop = chunkProcessor(trackedActions, chunkOfMax10Items => {
 *   sendTrackedActionsToServer(chunkOfMax10Items);
 * }, 100, 10)
 *
 * // usage:
 * trackedActions.push("scrolled")
 * trackedActions.push("hoveredButton")
 * // when both pushes happen within 100ms, there will be only one call to server
 *
 * @param {T[]} observableArray observable array instance to track
 * @param {(item: T[]) => void} processor action to call per item
 * @param {number} [debounce=0] optional debounce time in ms. With debounce 0 the processor will run synchronously
 * @param {number} [maxChunkSize=0] optionally do not call on full array but smaller chunks. With 0 it will process the full array.
 * @returns {IDisposer} stops the processor
 */
function chunkProcessor(observableArray, processor, debounce, maxChunkSize) {
    if (debounce === void 0) { debounce = 0; }
    if (maxChunkSize === void 0) { maxChunkSize = 0; }
    if (!mobx.isObservableArray(observableArray))
        throw new Error("Expected observable array as first argument");
    if (!mobx.isAction(processor))
        processor = mobx.action("chunkProcessor", processor);
    var runner = function () {
        var _loop_1 = function () {
            var chunkSize = maxChunkSize === 0
                ? observableArray.length
                : Math.min(observableArray.length, maxChunkSize);
            // construct a final set
            var items = observableArray.slice(0, chunkSize);
            // clear the slice for next iteration
            mobx.runInAction(function () { return observableArray.splice(0, chunkSize); });
            // fire processor
            processor(items);
        };
        while (observableArray.length > 0) {
            _loop_1();
        }
    };
    if (debounce > 0)
        return mobx.autorun(runner, { delay: debounce });
    else
        return mobx.autorun(runner);
}

var tickers = {};
/**
 * Returns the current date time as epoch number.
 * The date time is read from an observable which is updated automatically after the given interval.
 * So basically it treats time as an observable.
 *
 * The function takes an interval as parameter, which indicates how often `now()` will return a new value.
 * If no interval is given, it will update each second. If "frame" is specified, it will update each time a
 * `requestAnimationFrame` is available.
 *
 * Multiple clocks with the same interval will automatically be synchronized.
 *
 * Countdown example: https://jsfiddle.net/mweststrate/na0qdmkw/
 *
 * @example
 *
 * const start = Date.now()
 *
 * autorun(() => {
 *   console.log("Seconds elapsed: ", (mobxUtils.now() - start) / 1000)
 * })
 *
 *
 * @export
 * @param {(number | "frame")} [interval=1000] interval in milliseconds about how often the interval should update
 * @returns
 */
function now(interval) {
    if (interval === void 0) { interval = 1000; }
    if (!mobx._isComputingDerivation()) {
        // See #40
        return Date.now();
    }
    if (!tickers[interval]) {
        if (typeof interval === "number")
            tickers[interval] = createIntervalTicker(interval);
        else
            tickers[interval] = createAnimationFrameTicker();
    }
    return tickers[interval].current();
}
function createIntervalTicker(interval) {
    var subscriptionHandle;
    return fromResource(function (sink) {
        subscriptionHandle = setInterval(function () { return sink(Date.now()); }, interval);
    }, function () {
        clearInterval(subscriptionHandle);
    }, Date.now());
}
function createAnimationFrameTicker() {
    var frameBasedTicker = fromResource(function (sink) {
        function scheduleTick() {
            window.requestAnimationFrame(function () {
                sink(Date.now());
                if (frameBasedTicker.isAlive())
                    scheduleTick();
            });
        }
        scheduleTick();
    }, function () { }, Date.now());
    return frameBasedTicker;
}

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * _deprecated_ this functionality can now be found as `flow` in the mobx package. However, `flow` is not applicable as decorator, where `asyncAction` still is.
 *
 *
 *
 * `asyncAction` takes a generator function and automatically wraps all parts of the process in actions. See the examples below.
 * `asyncAction` can be used both as decorator or to wrap functions.
 *
 * - It is important that `asyncAction should always be used with a generator function (recognizable as `function*` or `*name` syntax)
 * - Each yield statement should return a Promise. The generator function will continue as soon as the promise settles, with the settled value
 * - When the generator function finishes, you can return a normal value. The `asyncAction` wrapped function will always produce a promise delivering that value.
 *
 * When using the mobx devTools, an asyncAction will emit `action` events with names like:
 * * `"fetchUsers - runid: 6 - init"`
 * * `"fetchUsers - runid: 6 - yield 0"`
 * * `"fetchUsers - runid: 6 - yield 1"`
 *
 * The `runId` represents the generator instance. In other words, if `fetchUsers` is invoked multiple times concurrently, the events with the same `runid` belong toghether.
 * The `yield` number indicates the progress of the generator. `init` indicates spawning (it won't do anything, but you can find the original arguments of the `asyncAction` here).
 * `yield 0` ... `yield n` indicates the code block that is now being executed. `yield 0` is before the first `yield`, `yield 1` after the first one etc. Note that yield numbers are not determined lexically but by the runtime flow.
 *
 * `asyncActions` requires `Promise` and `generators` to be available on the target environment. Polyfill `Promise` if needed. Both TypeScript and Babel can compile generator functions down to ES5.
 *
 *  N.B. due to a [babel limitation](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy/issues/26), in Babel generatos cannot be combined with decorators. See also [#70](https://github.com/mobxjs/mobx-utils/issues/70)
 *
 *
 * @example
 * import {asyncAction} from "mobx-utils"
 *
 * let users = []
 *
 * const fetchUsers = asyncAction("fetchUsers", function* (url) {
 *   const start = Date.now()
 *   const data = yield window.fetch(url)
 *   users = yield data.json()
 *   return start - Date.now()
 * })
 *
 * fetchUsers("http://users.com").then(time => {
 *   console.dir("Got users", users, "in ", time, "ms")
 * })
 *
 * @example
 * import {asyncAction} from "mobx-utils"
 *
 * mobx.configure({ enforceActions: "observed" }) // don't allow state modifications outside actions
 *
 * class Store {
 * 	\@observable githubProjects = []
 * 	\@state = "pending" // "pending" / "done" / "error"
 *
 * 	\@asyncAction
 * 	*fetchProjects() { // <- note the star, this a generator function!
 * 		this.githubProjects = []
 * 		this.state = "pending"
 * 		try {
 * 			const projects = yield fetchGithubProjectsSomehow() // yield instead of await
 * 			const filteredProjects = somePreprocessing(projects)
 * 			// the asynchronous blocks will automatically be wrapped actions
 * 			this.state = "done"
 * 			this.githubProjects = filteredProjects
 * 		} catch (error) {
 * 			this.state = "error"
 * 		}
 * 	}
 * }
 *
 * @export
 * @returns {Promise}
 */
function asyncAction(arg1, arg2) {
    // decorator
    if (typeof arguments[1] === "string") {
        var name_1 = arguments[1];
        var descriptor_1 = arguments[2];
        if (descriptor_1 && descriptor_1.value) {
            return Object.assign({}, descriptor_1, {
                value: mobx.flow(descriptor_1.value)
            });
        }
        else {
            return Object.assign({}, descriptor_1, {
                set: function (v) {
                    Object.defineProperty(this, name_1, __assign({}, descriptor_1, { value: mobx.flow(v) }));
                }
            });
        }
    }
    // direct invocation
    var generator = typeof arg1 === "string" ? arg2 : arg1;
    deprecated("asyncAction is deprecated. use mobx.flow instead");
    return mobx.flow(generator); // name get's dropped..
}

/**
 * _deprecated_ whenAsync is deprecated, use mobx.when without effect instead.
 *
 * Like normal `when`, except that this `when` will return a promise that resolves when the expression becomes truthy
 *
 * @example
 * await whenAsync(() => !state.someBoolean)
 *
 * @export
 * @param {() => boolean} fn see when, the expression to await
 * @param {number} timeout maximum amount of time to wait, before the promise rejects
 * @returns Promise for when an observable eventually matches some condition. Rejects if timeout is provided and has expired
 */
function whenAsync(fn, timeout) {
    if (timeout === void 0) { timeout = 0; }
    deprecated("whenAsync is deprecated, use mobx.when without effect instead");
    return mobx.when(fn, {
        timeout: timeout
    });
}

/**
 * expr can be used to create temporarily views inside views.
 * This can be improved to improve performance if a value changes often, but usually doesn't affect the outcome of an expression.
 *
 * In the following example the expression prevents that a component is rerender _each time_ the selection changes;
 * instead it will only rerenders when the current todo is (de)selected.
 *
 * @example
 * const Todo = observer((props) => {
 *     const todo = props.todo;
 *     const isSelected = mobxUtils.expr(() => props.viewState.selection === todo);
 *     return <div className={isSelected ? "todo todo-selected" : "todo"}>{todo.title}</div>
 * });
 *
 */
function expr(expr) {
    if (!mobx._isComputingDerivation())
        console.warn("'expr' should only be used inside other reactive functions.");
    // optimization: would be more efficient if the expr itself wouldn't be evaluated first on the next change, but just a 'changed' signal would be fired
    return mobx.computed(expr).get();
}

var memoizationId = 0;
function createTransformer(transformer, arg2) {
    invariant(typeof transformer === "function" && transformer.length < 2, "createTransformer expects a function that accepts one argument");
    // Memoizes: object id -> reactive view that applies transformer to the object
    var views = {};
    var onCleanup = undefined;
    var debugNameGenerator = undefined;
    function createView(sourceIdentifier, sourceObject) {
        var latestValue;
        if (typeof arg2 === "object") {
            onCleanup = arg2.onCleanup;
            debugNameGenerator = arg2.debugNameGenerator;
        }
        else if (typeof arg2 === "function") {
            onCleanup = arg2;
        }
        else {
            onCleanup = undefined;
            debugNameGenerator = undefined;
        }
        var prettifiedName = debugNameGenerator ?
            debugNameGenerator(sourceObject) :
            "Transformer-" + transformer.name + "-" + sourceIdentifier;
        var expr = mobx.computed(function () {
            return (latestValue = transformer(sourceObject));
        }, {
            name: prettifiedName
        });
        var disposer = mobx.onBecomeUnobserved(expr, function () {
            delete views[sourceIdentifier];
            disposer();
            if (onCleanup)
                onCleanup(latestValue, sourceObject);
        });
        return expr;
    }
    return function (object) {
        var identifier = getMemoizationId(object);
        var reactiveView = views[identifier];
        if (reactiveView)
            return reactiveView.get();
        // Not in cache; create a reactive view
        reactiveView = views[identifier] = createView(identifier, object);
        return reactiveView.get();
    };
}
function getMemoizationId(object) {
    var objectType = typeof object;
    if (objectType === "string")
        return "string:" + object;
    if (objectType === "number")
        return "number:" + object;
    if (object === null || (objectType !== "object" && objectType !== "function"))
        throw new Error("[mobx-utils] transform expected an object, function, string or number, got: " + String(object));
    var tid = object.$transformId;
    if (tid === undefined) {
        tid = "memoizationId:" + ++memoizationId;
        addHiddenProp(object, "$transformId", tid);
    }
    return tid;
}

function buildPath(entry) {
    var res = [];
    while (entry.parent) {
        res.push(entry.path);
        entry = entry.parent;
    }
    return res.reverse().join("/");
}
function isRecursivelyObservable(thing) {
    return mobx.isObservableObject(thing) || mobx.isObservableArray(thing) || mobx.isObservableMap(thing);
}
/**
 * Given an object, deeply observes the given object.
 * It is like `observe` from mobx, but applied recursively, including all future children.
 *
 * Note that the given object cannot ever contain cycles and should be a tree.
 *
 * As benefit: path and root will be provided in the callback, so the signature of the listener is
 * (change, path, root) => void
 *
 * The returned disposer can be invoked to clean up the listener
 *
 * deepObserve cannot be used on computed values.
 *
 * @example
 * const disposer = deepObserve(target, (change, path) => {
 *    console.dir(change)
 * })
 */
function deepObserve(target, listener) {
    var entrySet = new WeakMap();
    function genericListener(change) {
        var entry = entrySet.get(change.object);
        processChange(change, entry);
        listener(change, buildPath(entry), target);
    }
    function processChange(change, parent) {
        switch (change.type) {
            // Object changes
            case "add": // also for map
                observeRecursively(change.newValue, parent, change.name);
                break;
            case "update": // also for array and map
                unobserveRecursively(change.oldValue);
                observeRecursively(change.newValue, parent, change.name || "" + change.index);
                break;
            case "remove": // object
            case "delete": // map
                unobserveRecursively(change.oldValue);
                break;
            // Array changes
            case "splice":
                change.removed.map(unobserveRecursively);
                change.added.forEach(function (value, idx) {
                    return observeRecursively(value, parent, "" + (change.index + idx));
                });
                // update paths
                for (var i = change.index + change.addedCount; i < change.object.length; i++) {
                    if (isRecursivelyObservable(change.object[i])) {
                        var entry = entrySet.get(change.object[i]);
                        if (entry)
                            entry.path = "" + i;
                    }
                }
                break;
        }
    }
    function observeRecursively(thing, parent, path) {
        if (isRecursivelyObservable(thing)) {
            if (entrySet.has(thing)) {
                var entry = entrySet.get(thing);
                if (entry.parent !== parent || entry.path !== path)
                    // MWE: this constraint is artificial, and this tool could be made to work with cycles,
                    // but it increases administration complexity, has tricky edge cases and the meaning of 'path'
                    // would become less clear. So doesn't seem to be needed for now
                    throw new Error("The same observable object cannot appear twice in the same tree, trying to assign it to '" + buildPath(parent) + "/" + path + "', but it already exists at '" + buildPath(entry.parent) + "/" + entry.path + "'");
            }
            else {
                var entry_1 = {
                    parent: parent,
                    path: path,
                    dispose: mobx.observe(thing, genericListener)
                };
                entrySet.set(thing, entry_1);
                mobx.entries(thing).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    return observeRecursively(value, entry_1, key);
                });
            }
        }
    }
    function unobserveRecursively(thing) {
        if (isRecursivelyObservable(thing)) {
            var entry = entrySet.get(thing);
            if (!entry)
                return;
            entrySet.delete(thing);
            entry.dispose();
            mobx.values(thing).forEach(unobserveRecursively);
        }
    }
    observeRecursively(target, undefined, "");
    return function () {
        unobserveRecursively(target);
    };
}

/**
 * @private
 */
var DeepMapEntry = /** @class */ (function () {
    function DeepMapEntry(base, args) {
        this.base = base;
        this.args = args;
        this.closestIdx = 0;
        this.isDisposed = false;
        var current = this.closest = this.root = base;
        var i = 0;
        for (; i < this.args.length - 1; i++) {
            current = current.get(args[i]);
            if (current)
                this.closest = current;
            else
                break;
        }
        this.closestIdx = i;
    }
    DeepMapEntry.prototype.exists = function () {
        this.assertNotDisposed();
        var l = this.args.length;
        return this.closestIdx >= l - 1 && this.closest.has(this.args[l - 1]);
    };
    DeepMapEntry.prototype.get = function () {
        this.assertNotDisposed();
        if (!this.exists())
            throw new Error("Entry doesn't exist");
        return this.closest.get(this.args[this.args.length - 1]);
    };
    DeepMapEntry.prototype.set = function (value) {
        this.assertNotDisposed();
        var l = this.args.length;
        var current = this.closest;
        // create remaining maps
        for (var i = this.closestIdx; i < l - 1; i++) {
            var m = new Map();
            current.set(this.args[i], m);
            current = m;
        }
        this.closestIdx = l - 1;
        this.closest = current;
        current.set(this.args[l - 1], value);
    };
    DeepMapEntry.prototype.delete = function () {
        this.assertNotDisposed();
        if (!this.exists())
            throw new Error("Entry doesn't exist");
        var l = this.args.length;
        this.closest.delete(this.args[l - 1]);
        // clean up remaining maps if needed (reconstruct stack first)
        var c = this.root;
        var maps = [c];
        for (var i = 0; i < l - 1; i++) {
            c = c.get(this.args[i]);
            maps.push(c);
        }
        for (var i = maps.length - 1; i > 0; i--) {
            if (maps[i].size === 0)
                maps[i - 1].delete(this.args[i - 1]);
        }
        this.isDisposed = true;
    };
    DeepMapEntry.prototype.assertNotDisposed = function () {
        // TODO: once this becomes annoying, we should introduce a reset method to re-run the constructor logic
        if (this.isDisposed)
            throw new Error("Concurrent modification exception");
    };
    return DeepMapEntry;
}());
/**
 * @private
 */
var DeepMap = /** @class */ (function () {
    function DeepMap() {
        this.store = new Map();
        this.argsLength = -1;
    }
    DeepMap.prototype.entry = function (args) {
        if (this.argsLength === -1)
            this.argsLength = args.length;
        else if (this.argsLength !== args.length)
            throw new Error("DeepMap should be used with functions with a consistent length, expected: " + this.argsLength + ", got: " + args.length);
        if (this.last)
            this.last.isDisposed = true;
        return this.last = new DeepMapEntry(this.store, args);
    };
    return DeepMap;
}());

/**
 * computedFn takes a function with an arbitrarily amount of arguments,
 * and memoized the output of the function based on the arguments passed in.
 *
 * computedFn(fn) returns a function with the very same signature. There is no limit on the amount of arguments
 * that is accepted. However, the amount of arguments must be consistent and default arguments are not supported.
 *
 * By default the output of a function call will only be memoized as long as the
 * output is being observed.
 *
 * The function passes into `computedFn` should be pure, not be an action and only be relying on
 * observables.
 *
 * Setting `keepAlive` to `true` will cause the output to be forcefully cached forever.
 * Note that this might introduce memory leaks!
 *
 * @example
 * const store = observable({
    a: 1,
    b: 2,
    c: 3,
    m: computedFn(function(x) {
      return this.a * this.b * x
    })
  })

  const d = autorun(() => {
    // store.m(3) will be cached as long as this autorun is running
    console.log((store.m(3) * store.c))
  })
 *
 * @param fn
 * @param keepAlive
 */
function computedFn(fn, keepAlive) {
    if (keepAlive === void 0) { keepAlive = false; }
    if (mobx.isAction(fn))
        throw new Error("computedFn shouldn't be used on actions");
    var memoWarned = false;
    var i = 0;
    var d = new DeepMap();
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var self = this;
        var entry = d.entry(args);
        // cache hit, return
        if (entry.exists())
            return entry.get().get();
        // if function is invoked, and its a cache miss without reactive, there is no point in caching...
        if (!keepAlive && !mobx._isComputingDerivation()) {
            if (!memoWarned) {
                console.warn("invoking a computedFn from outside an reactive context won't be memoized, unless keepAlive is set");
                memoWarned = true;
            }
            return fn.apply(self, args);
        }
        // create new entry
        var c = mobx.computed(function () {
            return fn.apply(self, args);
        }, {
            name: "computedFn(" + fn.name + "#" + (++i) + ")",
            keepAlive: keepAlive
        });
        entry.set(c);
        // clean up if no longer observed
        if (!keepAlive)
            mobx.onBecomeUnobserved(c, function () {
                d.entry(args).delete();
            });
        // return current val
        return c.get();
    };
}

exports.computedFn = computedFn;
exports.PENDING = PENDING;
exports.FULFILLED = FULFILLED;
exports.REJECTED = REJECTED;
exports.fromPromise = fromPromise;
exports.isPromiseBasedObservable = isPromiseBasedObservable;
exports.moveItem = moveItem;
exports.lazyObservable = lazyObservable;
exports.fromResource = fromResource;
exports.toStream = toStream;
exports.fromStream = fromStream;
exports.ViewModel = ViewModel;
exports.createViewModel = createViewModel;
exports.whenWithTimeout = whenWithTimeout;
exports.keepAlive = keepAlive;
exports.queueProcessor = queueProcessor;
exports.chunkProcessor = chunkProcessor;
exports.now = now;
exports.NOOP = NOOP;
exports.IDENTITY = IDENTITY;
exports.invariant = invariant;
exports.deprecated = deprecated;
exports.addHiddenProp = addHiddenProp;
exports.getAllMethodsAndProperties = getAllMethodsAndProperties;
exports.asyncAction = asyncAction;
exports.whenAsync = whenAsync;
exports.expr = expr;
exports.createTransformer = createTransformer;
exports.deepObserve = deepObserve;

Object.defineProperty(exports, '__esModule', { value: true });

})));
