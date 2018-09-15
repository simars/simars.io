---
path: "/manage-scrolls-on-router-outlets-angular"
date: "2018-05-30"
title: "Manage Scrolls on router-outlets | Angular"
author: "Simar Singh"
---

* * *

**Angular** Single Page Applications (**SPA**s) handle routes with `router-outlets`, keeping the browser window on the same page (`index.html`), enriching experience after initial page load with just post-back / ajax calls

However, by <span class="markup--quote markup--p-quote is-other" name="24f1c4d769fe" data-creator-ids="a31b1c2b9e8f">preventing the Browser Window from reacting on route change (fetch a new page), now `router-outlet` (s) must assume the responsibility of what a browser Window usually does on fetching a new page</span> “_Scrolls are reset on the Window, and the complete DOM is new. Neither the window, nor elements retain any scroll state from the previous page._”

How angular Router works is very well explained [here](https://vsavkin.com/angular-router-understanding-router-state-7b5b95a12eab). Once a route is activated, by default routing strategy, all navigation changes matching the route `[URL]-> {router-outlet, component}` are pushed through the same instance of the `component` activated inside the target /current `router-outlet` until we navigate out to a parent route, or where a different route-tree.

This means we could store the state of scrolls before a `router-outlet` activates, and restore the previous state when its destroyed.

Let’s solve this with a directive that targets all `router-outlet`

<pre>
 import {Attribute, Directive, ElementRef, Inject, InjectionToken, OnDestroy, OnInit, Optional} from '[@angular/core](http://twitter.com/angular/core "Twitter profile for @angular/core")';
 import {Event, NavigationEnd, Router} from '[@angular/router](http://twitter.com/angular/router "Twitter profile for @angular/router")';
 import {Subscription} from 'rxjs/Subscription';
 import {distinctUntilChanged, filter} from 'rxjs/operators';
 @Directive()({
   selector: 'router-outlet'
 })
 export class RouterOutletDirective implements OnInit, OnDestroy {

  private routerEventsSubscription: Subscription;
  private currentXY: WindowXY;

  constructor(  
    private elementRef: ElementRef,  
    private router: Router  
  ) {  
    this.elementRef = elementRef;  
    this.router = router;  
    this.routerEventsSubscription = null;  
  }

  public ngOnDestroy(): void {
    if (this.routerEventsSubscription) {  
      this.routerEventsSubscription.unsubscribe();  
    }  
    this.windowCoordinates = this.currentXY;  
  }

  public ngOnInit(): void {
    this.currentXY = this.windowCoordinates;  
    this.windowScroll = [0, 0] as WindowXY; // reset window scroll
    this.routerEventsSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),  
      distinctUntilChanged((prev: NavigationEnd, next: NavigationEnd) => next && next.url === prev.url)  
    )  
      .subscribe(  
        (event: Event): void => {  
          const node = this.elementRef.nativeElement.parentNode;  
          node.scrollTop = 0;  
        }  
      );  
  }

  private get windowCoordinates(): WindowXY {
    return [window.scrollX, window.scrollY] as WindowXY;  
  }

  private set windowCoordinates(xy: WindowXY): WindowXY {
    window.scrollTo(xy[0] || 0, xy[1] || 0);  
  }
 }
</pre>

Notice, every time the route changes, the directive will grab the parent element and set `scrollTop` to `0` so if the component filling in the outlet has a content overflow with scroll, the scroll reset to top on every route change. (Assuming scroll is from parent-element to `router-outlet` marked `overflow: scroll` ).

Also, every time a `router-outlet` activates, the directive instance will note-down the current coordinates of the browser window, and restore the same coordinates when the `router-outlet` deactivates. This is useful in case we have multiple outlets, with int he same app, are in multi-app setup

Since the directive subscribes to navigation events, any change in the `window.location` whether it be through back button, router-navigation etc, the directive resets the scroll in-line with how browser window does when we navigate to a new page.

You could further enhance this directive, to remember last known scroll-positions (`window` and `router-outlet` directive‘s parent) for every URL that directive receives from navigation change subscription. To to store `url->coordinates` we could leverage an `angular-service` . If you want to remember the last scroll positions to each URL across browser refreshes / page reloads, use `history-api` and/or `local-storage`

You may have to deal with secondary outlets differently. Main idea here is the scroll on `window` and elements on top of `router-outlet` s need to managed.
