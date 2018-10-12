---
path: '/angular-ngrx-router-store'
date: '2018-08-19'
title: 'Testing Angular Directives with a fake TestComponent'
author: 'Simar Paul Singh'
published: false
---


* * *

Typical **Angular** application is a set of **Container / Smart / Stateful** components, containing one ore more re-usable **Presentation / Dumb / Stateless** components.

**Business Logic** should abstracted away on _Services_, **Data Logic** in _Pipes_ and _Store Selectors_. and **Model / State**  should be in _Store_, manged with _reducers_ and _effects_ (ngrx) handling state selection and mutations.

**Container components** are responsible for wiring up everything, services, data to/from store, pass in data to presentation components for rendering, and process for any events

_Services, Pipes , Store (Reducers & Selectors)_ are usually straight forward to _unit test_

Testing container components must be done at three levels, **Unit Test**, **Shallow Test** and **Deep Test**, to test rendering done by container component, then its wiring to contained presentation components, and finally the whole arrangement as one.


Consider an example `<Details-Container/>` component is a container component, responsible for providing and / or managing state `details`, (ex. using ngrx store, state selectors and/or actions).
It a presentation components `<Contact-Presentation/>`, which receive `contact` data as `@Input()` property for rendering, and _emits_ `(onAdd)` event when user clicks on a _Add to my Contacts_ `<button/>`.


```
@Component({
  'selector': 'Details-Container',
  'template': `<Details-Container *ngIf='details$ | async as details'>

    <h3>{{details.title}}</h3>
    <p>{{details.description}}</p>

       <Location-Presentation [location]='details.address'/>
       <Contact-Presentation 
         [contact]='details.contact'
         (onAdd)='addContact($event)'
       />
    </DetailsPage-Container>`
})
export class DetailsContainerComponent {

  details$: Observable<any>;
  
  constructor(private store: Store<any>) {
    this.details$ = store.select(getDetailsSelector)
  }
  
  addContact(contactId: number) {
    this.store.dispatch({ 
      type: 'add_my_contact', 
      payload: contactId  
     } : ActionWithPayload<number>)
  }

}
```


```
@Component({
  'selector': 'Contact-Presentation',
  'template': `<span> 
      <strong> {{contact.firstName}} |</strong>  
      <a href='mailto'> {{contact.email}} </a>
      <button (click)='this.onAdd.emit(contact.id)'>
        Add to My Contacts 
      </button>
    </span>`
})
export class DetailsContainerComponent {
  @Input() contact: {firstName: string, email?: string, id: number};
  @Output() ontAdd = new EventEmitter<number>(); 
}
```


## Testing Angular Components



### Shallow Test

Our Objective in **Shallow Test(s)** is to assert Container Component render stuff it is responsible for rendering properly

The trick here is to configure `TestBed` with only `declarations: [DetailsContainerComponent]`
Avoid the the contained presentation components with `schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]`

1. `<Details-Container/>` instantiates properly.
2. `<Details-Container/>`, selects `details` data from store (it could be `ActivatedRoute` , some _service_, etc)
3. `<Details-Container/>` renders `details.title` and `details.description`, re-renders with changes on change detection


```
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DetailsContainerComponent } from './details.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviourSubject } from 'rxjs';


describe('DetailsContainerComponent', () => {

  let details : any;
  let details$: BehaviourSubject<any>;
  let store;
  let fixture: ComponentFixture<DetailsContainerComponent>;
  let comp: ContainerComponent;

  beforeEach(async(() => {
    details = {
     title: 'This is a test title',
     description: 'This is a test description`
     contact: {
       id: 1,
       name: 'Simar',
       email: 'simar@simar.simar'
     }
    };

    details$ = new BehaviourSubject<any>(details);

    TestBed.configureTestingModule({
      declarations: [
        DetailsContainerComponent
      ],
      providers: [
        provide: Store,
        useValue: {
          select: jasmine.createSpy('select').and.return(details$)},
          dispatch: jasmine.createSpy('dispatch')
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsContainerComponent);
    comp = fixture.debugElement.componentInstance;
  }));

  it('should create the comp', async(() => {
    expect(comp).toBeTruthy();
  }));

  it('should select details from store', async(() => {
    expect(store.select).toHaveBeenCallWith(getContainerDetails);
    expect(comp.details$).subscribe((d)=> expect(d).toBe(details)); // without jasmine marbles
    expect(comp.details$).toBeObsevable('(a|)', {a: details}); // with jasmine marbles
  }));

  it('should render title in a h3 tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain(details.title);
    const title = 'Changed Title';
    details$.next({...details, title});
    fixture.detectChanges();
    expect(compiled.querySelector('h3').textContent).toContain(changedTitle);
  }));

  it('should render description in a p tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const description = 'Changed Description'
    details.next({...details, description});
    fixture.detectChanges();
    expect(compiled.querySelector('p').textContent).toContain(description);
  }));

});

```


### Deep Test

Our Objective in **Deep Test(s)** is to assert interactions of Container Component with presentation Components, store, and any services if any.


1. `<Container-Details\>` passes the correct `@Input() contact` = `details.location` to `<Location-Contact/>`
2. `<Container-Details\>` can receive `(onAdd)` event from `<Presentation-Contact/>` & react by dispatching `add-my-contact` action to `Store`

```
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DetailsContainerComponent } from './details.component';
import { Store } from '@ngrx/store';
import { BehaviourSubject } from 'rxjs';


describe('DetailsContainerComponent', () => {

  let details : any;
  let details$: BehaviourSubject<any>;
  let store;
  let fixture: ComponentFixture<DetailsContainerComponent>;
  let comp: ContainerComponent;

  beforeEach(async(() => {
    details = {
     title: 'This is a test title',
     description: 'This is a test description`
     contact: {
       id: 1,
       name: 'Simar',
       email: 'simar@simar.simar'
     }
    };
    
    details$ = new BehaviourSubject<any>(details);
    
    TestBed.configureTestingModule({
      declarations: [
        DetailsContainerComponent
      ],
      providers: [
        provide: Store,
        useValue: {
          select: jasmine.createSpy('select').and.return(details$)},
          dispatch: jasmine.createSpy('dispatch')
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsContainerComponent);
    comp = fixture.debugElement.componentInstance;
  }));

  it('should pass contact.details as inpiut to <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const contactComp = fixture.debugElement.query(By.css('Contact-Presentation'));
    expect(contactComp).toBeTruhty();
    expect(contactComp.contact).toEqual(details.contact);
    const contact = { firstName: 'Paul', email: 'paul@paul.com' }
    details.next({...details, contact});
    fixture.detectChanges();
    expect(contactComp.contact).toEqual(contact);
  }));

  it('should pass contact.details as inpiut to <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const contactComp = fixture.debugElement.query(By.css('Contact-Presentation'));
    expect(contactComp).toBeTruhty();
    spyOn(comp,'addContact').and.callThrough();
    const contactId = 10;
    contactComp.onAdd.emit(contactId);
    expect(comp.addContact).toHaveBeenCalledWith(contactId);
    expect(store.dispatch).toHaveBeenCalledWith({
        type: 'add_my_contact',
        payload: 10
      } : ActionWithPayload<number>);
  }));


});

```


### How deep should we test

In **Deep Test(s)** We will test, the container component, along with all its contained components as one unit 
along with the cross cutting concerns like _routing_ and _store_ management.

We will have set up our test-bed extensively 

```
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DetailsContainerComponent } from './details.component';

import {ActivatedRoute, Router, RouterModule, Routes} from '@angular/router';
import {Observable} from 'rxjs';
import {CommonModule, Location} from '@angular/common';

import {RouterTestingModule} from '@angular/router/testing';
import {ActionReducerMap, Store, StoreModule} from '@ngrx/store';
import {routerReducer, StoreRouterConnectingModule, RouterStateSerializer, StoreRouterConfig} from '@ngrx/router-store';
import { CustomRouterStateSerializer } from './router.state.seralizer';
import {NgModule} from '@angular/core';

describe('DetailsContainerComponent', () => {

  let details : any;
  let details$: BehaviourSubject<any>;
  let store;
  let fixture: ComponentFixture<DetailsContainerComponent>;
  let comp: ContainerComponent;

  beforeEach(async(() => {

    details = {
     title: 'This is a test title',
     description: 'This is a test description`
     contact: {
       name: 'Simar',
       email: 'simar@simar.simar'
     },
     location: {
       city: 'Toronto',
       country: 'Canada'
     }
    };
    
    details$ = new BehaviourSubject<any>(details);
    
    
    TestBed.configureTestingModule({
      declarations: [
        DetailsContainerComponent
      ],
      imports: [
        RouterTestingModule
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsContainerComponent);
    comp = fixture.debugElement.componentInstance;
  }));

  it('should create the comp', async(() => {
    expect(comp).toBeTruthy();
  }));

  it(`should have as title 'comp'`, async(() => {
    expect(comp.details$).subscribe((d)=> expect(d).toBe(details)); // without jasmine marbles
    expect(comp.details$).toBeObsevable('(a|)', {a: details}); // with jasmine marbles
  }));

  it('should render title in a h3 tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain(details.title);
  }));

  it('should render description in a p tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain(details.description);
  }));
});

/**
 * Module to Import in your deep tests, to set up ngrx router-reducer
 */
@NgModule({
  imports: [
    StoreModule.forRoot(mockReducer),
    StoreRouterConnectingModule.forRoot({
      stateKey: 'routerState', // name of  reducer key
    }),
  ],
  exports: [
    StoreModule,
    StoreRouterConnectingModule
  ],
  providers: [
    {
      provide: RouterStateSerializer,
      useClass: CustomRouterStateSerializer,
    }
  ]
})
export class TestStoreModule {

}


```


```
import {RouterStateSerializer} from '@ngrx/router-store';
import {RouterStateUrl} from '../domain/app.router.model';
import {ActivatedRouteSnapshot, Data, Params, RouterStateSnapshot} from '@angular/router';

export class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    return {
      url: routerState.url,
      params: mergeRouteParams(routerState.root, r => r.params),
      queryParams: mergeRouteParams(routerState.root, r => r.queryParams),
      data: mergeRouteData(routerState.root)
    };
  }
}

function mergeRouteParams(route: ActivatedRouteSnapshot, getter: (r: ActivatedRouteSnapshot) => Params): Params {
  if (!route) {
    return {};
  }
  const currentParams = getter(route);
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return {...currentParams, ...mergeRouteParams(primaryChild, getter)};
}

function mergeRouteData(route: ActivatedRouteSnapshot): Data {
  if (!route) {
    return {};
  }

  const currentData = route.data;
  const primaryChild = route.children.find(c => c.outlet === 'primary') || route.firstChild;
  return {...currentData, ...mergeRouteData(primaryChild)};
}

```
