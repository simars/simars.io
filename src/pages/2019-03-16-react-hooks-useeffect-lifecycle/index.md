---
path: "/react-hooks-useeffect-lifecycle"
date: "2019-03-16"
title: "React Hooks | useEffect for Life-Cycle Events (Tricks & Tips)"
author: "Simar Paul Singh"
published: true
---


`useEffect()` can combine `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` but is tricky.

You can decipher most of what I have to discuss here from official docs for [hooks](https://reactjs.org/docs/hooks-effect.html). It’s easier to see hooks at work, than to reason from text.

### **Pre-render lifecycle**

**Pre-render lifecycle** events equivalent to `componentWillReceiveProps` or `getDerivedStateFromProps` and `componentWillMount` can just be the things we do first in the functional component before returning JSX (react-node) as the function itself is equivalent to `render(…)` method of class based component.

**_We don’t need hooks handling Pre-render lifecycle events._**

### **Post-render lifecycle**

**Post-render lifecycle** events, those equivalent to `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` in class based component.

**_We need to_ **_`useEffect(…)`_** _to handle these Post-render lifecycle events_** as we can’t write the logic tied to these lifecycle events inside the main component function as these should run after the component function returns JSX (react-node) to `react-dom` renderer.

This means, we have lot we can do with hooks. How?

We know `useEffect(fn, […watchStates])`, takes in 2 arguments.

1.  `fn`: (required) `useEffect` invokes this function to run as side-effect after every render cycle based on values being tracked for changes given by the (2) argument. The function `fn`, could return another function that should be run as a cleanup before the effect function runs again or component un-mounts
2.  `[…watchValues ]`: (optional) `useEffect` tracks values in this array has changed from the last render cycle then only effect `fn` is invoked. If this argument is not given, the effect will run with every render cycle.

If we don’t pass the (2) argument all-together, the effect logic in `fn` will be invoked after every render cycle.

If we pass (2) array with values the component needs to watch for changes, and invoke `fn` on change, pretty self explanatory.

The trickiest part is in using an empty array `[]` as the (2) argument, we can restrict side-effect logic in `fn` to execute only during the mounting phase as there are no changes effect hook would be watching for after subsequent render-cycles to trigger `fn` again.

```
import React, { useState, useEffect } from "react";
export default props => {
  console.log("componentWillMount");
  console.log("componentWillReceiveProps", props);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [cross, setCross] = useState(0);
  const mouseMoveHandler = event => {
    setX(event.clientX);
    setY(event.clientY);
  };
  useEffect(() => {
    console.log("componentDidMount");
    document.addEventListener("mousemove", mouseMoveHandler);
    return () => {
      console.log("componentWillUnmount");
      document.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, []); // empty-array means don't watch for any updates
  useEffect(
    () => {
      // if (componentDidUpdate & (x or y changed))
      setMoveCount(moveCount + 1);
    },
    [x, y]
  );
  useEffect(() => {
    // if componentDidUpdate or componentDidMount
    if (x === y) {
      setCross(x);
    }
  });
  return (
    <div>
      <p style={{ color: props.color }}>
        Your mouse is at {x}, {y} position.
      </p>
      <p>Your mouse has moved {moveCount} times</p>
      <p>
        X and Y positions were last equal at {cross}, {cross}
      </p>
    </div>
  );
};
```

<iframe src="https://codesandbox.io/embed/q38wpvvonq?fontsize=14&module=%2Fsrc%2FExample.jsx" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

The code snippet is simple and self explanatory. You can try it out on code-pen.

One important thing to note is that if you are making a state change inside a effect, ensure you exclude the state that’s changing inside from the watch array.

For example in the second effect (one that counts the mouse movements) we only trigger it on updates on x and y, by passing `[x , y]` as the second argument because

1.  Its logically correct to watch for changes to x and y to register a mouse movement
2.  If we don’t exclude moveCount from being watched, this useEffect will go into an infinite cycle, as we will be updating the same value we are also watching for changes

--------

This article is also aviable on my [**Medium**][Medium] publication. If you like the artile, or have any comments and suggestions, please **_clap_** or leave **_comments_** on [**Medium**][Medium].

[Medium]:https://medium.com/simars/react-hooks-manage-life-cycle-events-tricks-and-tips-7ed13f52ba12?source=friends_link&sk=1e75c8c90b14ba96ec94b114dfeeb54e
