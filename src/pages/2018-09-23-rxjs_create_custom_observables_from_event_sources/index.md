---
path: "/rxjs-create_custom_observables_from_event_sources"
date: "2018-09-23"
title: "RxJS | Create Custom Observables from event sources directly"
author: "Simar Paul Singh"
published: true
---

**RxJs** simplifies working with event streams. In **Angular**, we get notified of almost all events and changes by _subscribing_ to **RxJs** `Observable(s)` Ex ([_ActvatedRoute#params_](https://angular.io/api/router/ActivatedRoute#params) , [_HttpClient_](https://angular.io/guide/http)_#get)_.

We seldom create our own `Observable(s)` from an actual _event source._ Unless, you consider emitting known values, with of and from as we usually do in our tests.

```
import { Observable, of } from 'rxjs';
Observable<String> one = Observable.of('1');
Observable<String> oneTwoThree = Observable.from(['1','2', '3']);

```

**RxJs** provides us handy utility _function_ `from(...) : Observable<T>` to create `Observable(s)` from well known event sources, (Ex. a native _dom-event)_.

Here is an example of`**_Observable.from_**_(input[click])_`_,_ implementing a text-input search-box, which can notify us of changing text.

```
import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, startWith, tap} from 'rxjs/operators';
@Component({
  selector: 'search-box',
  template: `
    <div>
      <input placeholder="search" #searchInput autocomplete="off"/>
    </div>
`
})
export class SearchBoxComponent implements AfterViewInit, OnDestroy {
@Output('onSearch')
onSearch = new EventEmitter<string>();
@ViewChild('searchInput')
input: ElementRef;
private subscription: Subscription;
ngAfterViewInit(): void {
 const terms$ = fromEvent<any>(this.input.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged()
      );
   this.subscription = term$
      .subscribe(
        criterion => {
          this.onSearch.emit(criterion);
        }
      );
}
ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

```

### Custom Observable(s)

Sometimes source of your event(s) is not well known, and likely **RxJs** wouldn’t have any stock functions to create `Observable(s)` of it.

Sometimes source of your event(s) is not well known, and likely **RxJs** wouldn’t have any stock functions to create `Observable(s)` of it.

**_Observable.create(function(observer) {_**

_// create or listen to an event-source (ex promises)_

_// decide when to call observer.(next|error|complete)_

**_})_**

For example, Let us try creating our own `Observable` the works like Angular’s `Http.get` using the **browser’s native** `fetch`-api

```
import {Observable} from 'rxjs';


export function createHttp$(url:string) {
  return Observable.create(observer => {

    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, {signal})
      .then(response => {
         if (response.ok) {
           return response.json();
         }
         else {
           observer.error(`Failed HTTP : response.status`);
         }
      })
      .then(body => {
         observer.next(body);
         observer.complete();
      })
      .catch(err => {
         observer.error(err);
       //observable which immediately errors out
      });

   return () => controller.abort()
   // this return function? executed on unsubscribe
  });
}
```

This is how we can use it

```
const http$ = createHttp$('/some/url');
http$.subscribe({
 next: (value: any) => console.log(`next ${value}`),
 complete: () => console.log(`complete`)};
);

```

Everything in the above code-snippet is straightforward besides the _function_ returned by `Observable.create(…)` which is the one **_that’s called when you unsubscribe to the observable created_ **created by `createHttp$(...)`.

Browser’s `fetch(…)` API gives us way to cancel ongoing requests by sending an abort signal. Therefore we send the abort signal when the subscriber unsubscribes before the the created observable before it completes. This will cancel long running _http-get-request_ to which no one now is subscribing.

```
const url = '/some/entity';
const http$ = this.activatedRoute.params.pipe(
 switchMap( id => createHttp$(`${url}/${id}`))
).subscribe({
  next: (value: any) => console.log(`next ${value}`),
  complete: () => console.log(`complete`)};
);

```

In the example above, we listen to changing URL parameters emitted from `Router’s` from `activatedRoute.params` and issue corresponding _http_ requests with newly emitted param value `{id}` using `Observables(s)` created by calling`createHttp$(`${url}/${id}`))`

However since we are using `switchMap(…)` to emit new `create_Http$(…)_` `Observales`, the previously emitted `Observable` is first _unsubscribed_ (cancelled) before a new one is created and emitted by `switchMap(…)`.

Since `Observable(s)` created from `createHttp$(...)` implements and returns function for cancellation, if _http_ request inside was still on going in the `Observable` being _unsubscribed_, it will get _aborted_ before new `_createHttp$(...)_` `Observable` is created and emitted by `switchMap` with in which a new _http_ request gets issued.
