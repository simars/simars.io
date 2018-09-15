---
path: "/create-generic-angular-pipes-apply-and-applypure"
date: "2018-04-22"
title: "Create Generic Angular Pipes | apply and applyPure"
author: "Simar Paul Singh"
---


* * *

### Fulfill your pipe dream in templates

1.  Keep one-off (non-reusable) transform impure functions in components, pass them as value-argument to be applied
2.  Define your re-usable pure functions separately, and import them in components as needed and pass them as value-argument to be applied

For source click on [**[GitHub]**](https://github.com/simars/ngx-mix-libraries/blob/master/projects/ngx-mix/src/lib/pipe/apply) & To Tryout click on **[**[**CodePen**](https://codepen.io/simars/pen/wxRpjN/)**]**

<pre>
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({  
  name: 'applyPure',  
  pure: true // immutable (value) inputs & pure fn (function)  
})  
export class ApplyPurePipe implements PipeTransform {  

  transform(value: any, fn: Function): any {  
    return fn(value);  
  }  
}  

@Pipe({  
  name: 'apply',  
  pure: false // any (value) inputs & any fn (function)  
})  
export class ApplyPipe implements PipeTransform {  

  transform(value: any, fn: Function): any {  
    return fn(value);  
  }  

}
</pre>

Write your functions in components, and pass the function itself as pipe value-arg to be applied

<pre>
@Component()({
  selector: 'my-app',  
  template: `&lt;p&gt;SUM of {{fib | json}} = {{fib | apply: sum}}&lt;/p&gt;`
})  
class AppComponent  {

fib = [1, 2, 3, 5, 8];

public sum(collection: [number]): number {
    return collection.reduce((first, second) => first + second);
  }  

}
</pre>

### Why do we need two kinds (apply & applyPure)?

**Pure pipes leverage** many advantages which come with [**Pure functions**](https://en.wikipedia.org/wiki/Pure_function)

1.  First pure pipes **evaluate only when input changes**, second they **cache the outputs for previously evaluated inputs**, and can bind the result from cache **without re-evaluating the pipe expression if the same input was previously evaluated**.
2.  **Single instance** of a pure pipe is used for all bindings in the app, across components
3.  **Just need to test transform function**, known input to known output.

**Impure pipes** can’t leverage caching, instance re-use and simple tests

### **When should we declare a Pipe as {pure: false}**?

1.  Either, the transform function they are evaluating isn’t pure.
2.  Or, there is no way to identify or differentiate between different inputs.

(1) is obvious but (2) is something easy to trip over. Let us see it with examples

## Try it out on **[**[**CodePen**](https://codepen.io/simars/pen/wxRpjN/)**]**

<iframe height='844' scrolling='no' title='angular-apply-pipes' src='//codepen.io/simars/embed/wxRpjN/?height=265&theme-id=0&default-tab=js,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/simars/pen/wxRpjN/'>angular-apply-pipes</a> by Simar Paul Singh (<a href='https://codepen.io/simars'>@simars</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>