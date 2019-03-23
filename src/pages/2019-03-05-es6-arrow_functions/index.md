---
path: "/es6-arrow-functions-when_not_to_use"
date: "2019-03-05"
title: "S6+ Arrow Functions (Lambdas) | When NOT to use"
author: "Simar Paul Singh"
published: true
---


Arrow functions or Lambdas, were introduced in ES 6. Apart from its elegance in minimal syntax, most notable functional **difference is scoping of** `this` **inside an arrow function**

> In **regular function** expressions, the `this` keyword is bound to different values based on the _context_ in which it is called.

> In **arrow functions**, `this` is _lexically_ bound, which means it closes over `this` from the scope in which the arrow function was defined (parent-scope), and does not change no matter where and how it is invoked / called.

### Limitations Arrow-Functions as methods on an Object

```
// this = global Window
let objA = {
 id: 10,
 name: "Simar",
 print () { // same as print: function() 
  console.log(`[${this.id} -> ${this.name}]`);
 }
}
objA.print(); // logs: [10 -> Simar]
objA = {
 id: 10,
 name: "Simar",
 print: () => {
  // closes over this lexically (global Window)
  console.log(`[${this.id} -> ${this.name}]`);
 }
};
objA.print(); // logs: [undefined -> undefined]
```

In the case of `objA.print()` when `print()` method defined using regular `function` , it worked by resolving `this` properly to `objA` for method invocation but failed when defined as an arrow`=>` function. It is because `this` in a regular function when invoked as a method on an object (`objA`), is the object itself. However, in case of an arrow function, `this` gets lexically bound to the the `this` of the enclosing scope where it was defined (global / Window in our case) and stays it stays same during its invocation as a method on `objA`.

### Advantages of an arrow-functions over regular functions in method(s) of an object BUT only when `this` is expected to be fixed & bound at the time definition.

```
/* this = global | Window (enclosing scope) */

let objB = {
 id: 20,
 name: "Paul",
 print () { // same as print: function() 
  setTimeout( function() {
    // invoked async, not bound to objB
    console.log(`[${this.id} -> ${this.name}]`);
  }, 1)
 }
};
objB.print(); // logs: [undefined -> undefined]'
objB = {
 id: 20,
 name: "Paul",
 print () { // same as print: function() 
  setTimeout( () => {
    // closes over bind to this from objB.print()
    console.log(`[${this.id} -> ${this.name}]`);
  }, 1)
 }
};
objB.print(); // logs: [20 -> Paul]
```

In the case of `objB.print()` where `print()` method is defined as function that invokes `console.log(`[${this.id} -> {this.name}]`)` asynchronously as a call-back on `setTimeout` , `this` resolved correctly to `objB` when an arrow function was used as call-back but failed when call-back was defined as as regular function. It is because arrow `=>` function passed to `setTimeout(()=>..)` closed over `this` lexically from its parent ie. invocation of `objB.print()` which defined it. In other-words, the arrow `=>` function passed in to to `setTimeout(()==>...` bound to `objB` as its `this` because the in invocation of `objB.print()` `this` was `objB` itself.

We could easily use `Function.prototype.bind()`, to make the call-back defined as a regular function work, by binding it to the correct `this`.

```
const objB = {
 id: 20,
 name: "Singh",
 print () { // same as print: function() 
  setTimeout( (function() {
    console.log(`[${this.id} -> ${this.name}]`);
  }).bind(this), 1)
 }
}
objB.print() // logs: [20 -> Singh]
```

However, arrow functions come in handy and less error prone for the case of async call-backs where we know the `this` at the time of the functions definition to which it gets and should be bound.

### Limitation of Arrow-Functions where this needs to change across invocations

Anytime, we need function whose `this` can be changed at time of invocation, we can’t use arrow functions.

```
/* this = global | Window (enclosing scope) */

function print() { 
   console.log(`[${this.id} -> {this.name}]`);
}
const obj1 = {
 id: 10,
 name: "Simar",
 print // same as print: print
};
obj.print(); // logs: [10 -> Simar]
const obj2 = {
 id: 20,
 name: "Paul",
};
printObj2 = obj2.bind(obj2);
printObj2(); // logs: [20 -> Paul]
print.call(obj2); // logs: [20 -> Paul]
```

None of the above will work with arrow function `const print = () => { console.log(`[${this.id} -> {this.name}]`);}` as `this` can’t be changed and will stay bound to the `this` of the enclosing scope where it was defined (global / Window). In all these examples, we invoked the same function with different objects (`obj1` and `obj2`) one after the another, both of which were created after the `print()` function was declared.

These were contrived examples, but let’s think about some more real life examples. If we had to write our `reduce()` method similar to one that works on `arrays` , we again can’t define it as a lambda, because it needs to infer `this` from the invocation context, ie. the array on which it was invoked

For this reason, `constructor` functions can never be defined as arrow functions, as `this` for a constructor function is created at the time of constructor invocation, not declaration

Also when when frameworks or systems accept a callback function(s) to be invoked later with dynamic context `this` , we can’t use arrow functions as again `this` may need to change with every invocation. This situation commonly arrises with DOM event handlers

```
'use strict'
var button = document.getElementById('button');
button.addEventListener('click', function {
  // web-api invokes with this bound to current-target in DOM
  this.classList.toggle('on');
});
var button = document.getElementById('button');
button.addEventListener('click', () => {
  // TypeError; 'use strict' -> no global this
  this.classList.toggle('on');
});
```

This is also the reason why in frameworks like **Angular 2+** and **Vue.js** expectthe template-component binding methods to be regular function / methods as `this` for their invocation is managed by the frameworks for the binding functions. (Angular uses Zone.js to manage async context for invocations of view-template binding functions)

-------

This article is also aviable on my [**Medium**][Medium] publication. If you like the artile, or have any comments and suggestions, please **_clap_** or leave **_comments_** on [**Medium**][Medium].

[Medium]:https://medium.com/simars/when-not-to-use-es6-arrow-functions-lambdas-41537a042839?source=friends_link&sk=8fc731e7afa441ee16ec694a499750b9
