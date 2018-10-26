---
path: "/ngrx-http-effects-should-listen-for-cancel-action"
date: "2018-10-05"
title: "Ngrx http$ Effects should listen for CANCEL action"
author: "Simar Paul Singh"
published: true
---

In a **Ngrx** implementation, a Store Effect loads an entity from from REST APIs when it receives a `FETCH_ENTITIES` action and then dispatch a `FETCHED_ENTITIES` action with payload for reducers to merge them in Store.


```
import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, switchMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {EntityService} from './';

@Injectable()
export class Effects {

  constructor(
    private actions$: Actions,
    private enService: EntityService,
    private store: Store<{entities: any[]}>
  ) {}

  @Effect()
  getUsers$ = this.actions$.pipe(
  ofType('FETCH_ENTITIES', 'CANCEL_FETCH_ENTITIES'),
  .switchMap(action => action.type === 'CANCEL_FETCH_ENTITIES' ?
    of() :
    this.enService.getEntities().pipe(
      map(users => ({type: 'FETCHED_ENTITIES', entity})),
      catchError(error => of( {type: 'ERROR', error}))
      )
    )
  );
}

```


If you notice, the same effect now listens to both `ofType(‘FETCH_ENTITIES’, ‘CANCEL_FETCH_ENTITIES’)` actions. It can now switch an ongoing `this.getEntities()` _Observable_ for `of()` . Upon `CANCEL_FETCH_ENTITIES` We could also return `of({type:'FETCHED_ENTITIES_ACTION, []})` depending on what reducing layer expects. However the main point is since we are using `switchMap(…)` to switch to a different Observable upon `CANCEL_FETCH_ENTITIES` it will unsubscribe the the previously emitted `this.getEntities()` _http$_ observable and when the _http$_ observable is unsubscribed will cancel any ongoing requests.

```
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class EntityService {
  constructor(private http: HttpClient) { }

  getEntities() {
   return this.http.get<any[]>('/api/entities');
  }
}
```

To learn more about cancel / abort works on an _http_ requests running inside an `http<div class="section-inner sectionLayout--insetColumn" on `http$.unsubscribe()` checkout __[Custom Observables from Event Sources](/rxjs-create_custom_observables_from_event_sources)__.

Now that our effect processes both `ofType(‘FETCH_ENTITIES’, ‘CANCEL_FETCH_ENTITIES’)` actions, when should we emit `CANCEL_FETCH_ENTITIES` ?

It depends, sometimes with an explicit user-case where a user clicks on a `<button (click)=”cancel()”>Cancel</button>`, to cancel an operation. Trickier one’s are implicit, like when we navigate away and a component which dispatched `FETCH_ENTITIES` action is getting destroyed.

```
import {select, Store} from '@ngrx/store';
import {Component, OnInit, OnDestroy} from '@angular/core';
@Component({
  selector: 'some-comp',
  template: `
  <ng-container *ngIf="en$ | async en; else #loading ">
   {{en | json}}
  </ng-container>
  <ng-template #loading>
     <button (click)="cancel()">Cancel</button>
  </ng-template>
`
})
export class SomeComponent implements OnInit, OnDestroy {
   en$: Observable<any[]>;
   constructor(store: Store) {
     this.en$ = this.store.select('entities');
   }
   cancel() {
    this.store.dispatch({type: 'CANCEL_FETCH_ENTITIES'});
   }

   ngOnInit() {
      this.store.dispatch({type: 'FETCH_ENTITIES'});
   }
   ngOnDestroy() {
     this.cancel();
   }

}
```