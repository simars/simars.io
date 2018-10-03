---
path: "/improve-ngfor-usability-and-performance-with-trackby"
date: "2018-04-09"
title: "Improve Angular’s *ngFor performance and usability with trackBy"
author: "Simar Paul Singh"
published: true
---


* * *


### Prevent loss of focus and reconstruction of elements in your *ngFor on collection change with trackBy

Note: “change the collection-data” means to replace the collection with new objects and not just modifying the objects in the same collection object.


* * *


### Let us consider a following example.

#### Tracking *ngFor on array of items changing every 5 seconds to switch line bullets between English & Spanish in different colors

#### Find full implementation on [Github](https://github.com/simars/angular-lessons/tree/master/projects/ngx-lesson-ngfor-trackby/src/lib) and play with it on [CodePen](https://codepen.io/simars/pen/KBGZVw) or [StackBlitz](https://stackblitz.com/edit/angular-ngfor-tracking)

* * *

## Without trackBy :(

#### ngFor here is not tracking elements by id or index. When items-collection changes ngFor just destroys and recreates elements for each item in the collection.


#### Try inputting text in the first set of input boxes available on any of these links [[CodePen](https://codepen.io/simars/pen/KBGZVw)] or [[StackBlitz]](https://angular-ngfor-tracking.stackblitz.io)

#### Notice, as the *ngFor items change, the focus and cursor from the input box you were typing in goes away, and you will find you aren’t typing anywhere.

#### On mobile browsers it is even worse. Every time focus from active input is lost, the soft-keyboard closes


![](https://cdn-images-1.medium.com/max/1400/1*NNOu-AZIHmWFeFiLPqgrtA.gif)


* * *

## With track by :)

#### ngFor is tracking each element to its rendering in dom by id, and it just renders the corresponding changes in place using using standard change detection instead of destroying and recreating elements

### ngFor with trackBy


#### Try inputting text in the second set of input boxes available on this these links [[CodePen](https://codepen.io/simars/pen/KBGZVw)] or [[StackBlitz](https://angular-ngfor-tracking.stackblitz.io)].

#### Notice, as the ngFor items change, the text, focus and cursor in the active input box stays, and you can continue typing even as the bullets keep changing


![](https://cdn-images-1.medium.com/max/1400/1*upjr4zfKw-dEcsmGaVHe0A.gif)


#### Note: If you don’t have id (unique-key) for each data-item in your collection, you can always trackBy index (second argument passed to trackByFn). If you use a field to track by that is not unique across items in your collection, angular will throw an error


## Try it out yourself

<iframe height='265' scrolling='no' title='angular-ngfor-tracking' src='//codepen.io/simars/embed/KBGZVw/?height=265&theme-id=0&default-tab=js,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/simars/pen/KBGZVw/'>angular-ngfor-tracking</a> by Simar Paul Singh (<a href='https://codepen.io/simars'>@simars</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

### Why is trackBy so important for Angular?

Angular by default tracks items in a collection by object reference. When we replace the collection with new collection which is not keeping the same objects by reference, Angular can’t keep track of items in the collection even if the objects inside the new collection are same by values, but just clone of previous ones.

Unless trackBy provides a unique id per element in *ngFor iteration, angular will have no knowledge of which items have been removed or added or changed in the new collection.

As a result, Angular needs to remove all the DOM elements that associated with the data items in collection and create them again ( unnecessary DOM manipulations).

We all know DOM manipulations are expensive, and for a collection of (n) items, it’s of order(n). Also on every recreation, any focus from the element is lost posing a big usability problem as user may not understand where and why the cursor / focus went away from active element recreated.

Hence, for performance and usability, prefer using trackBy with *ngFor unless the collection never changes and / or items are expected to lose all state on change and be recreated which is seldom the case.

If you liked this article please click the ❤ below or (clap) on __[Medium](https://medium.com/simars/improve-ngfor-usability-and-performance-with-trackby-97f32ab92f1c)__ on the left side. It’ll motivate me to write more articles like this, and it’ll help other people discover the article as well.
