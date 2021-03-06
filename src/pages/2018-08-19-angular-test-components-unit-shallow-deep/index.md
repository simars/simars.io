---
path: '/angular-test-components-unit-shallow-deep'
date: '2018-10-01'
title: 'Testing Angular Components | Shallow and Deep'
author: 'Simar Paul Singh'
published: true
---

* * *


Typical **Angular** application renders and interacts with set of **_Container_** _(Smart / Stateful)_ components, containing one or more re-usable **_Presentation_** _(Dumb / Stateless)_ components.

**Services** contain _Business Logic_. **_Pipes_** and **_Store Selectors_** contain _Re-usable Data Transformers / Functions_.

**_Store_** pattern works well for managing _State / Model_. **_Ngrx_** is one such implementation for state management with _reducers_ and _effects_ handling state mutations and _selectors_ handling retrieval.

**_Container_** _components_ are responsible for wiring up, _Services_, data to/from _Store,_ pass in `@Input()` data to **_Presentation_** _components_ for rendering and process `@Output()` event(s) emitted by them by dispatching _actions_.

_Services, Pipes , Store (Reducers & Selectors)_ are usually straight forward to _unit test_ as they don’t involve any DOM _rendering_ or async _event-handling_ and mostly take pure functions approach for easy testability. (with the exception of _Effects_ and _Impure-Pipes_).

If in tests, our _components_ are instantiated as simple class instance without _TestBed_, we wouldn’t have Zone to test its bindings to template. We cannot test DOM rendering and event-handling.

Since a well designed component usually has all the _business / state manipulation & selection_ logic abstracted away in _services, store, store-reducers, store-selectors / pipes respectively_, traditional unit tests wouldn’t have much to test, as component’s main responsibility then is to serve its template.

**Testing** of **_Container_** _Components_ must be done at 2 levels, **Shallow Test** and **Deep Test**. First test any direct _rendering / event-handling_ done by **_Container_** _component_, then its **_wiring_** to its **_Providers_** (ex store) and contained **_Presentation_** _components_ respectively.

Consider an example `<Details-Container/>` is a _Container_ component, interacts with store to select and manage state slice `details`, (ex. using ngrx store, state selectors and/or actions). It contains a _Presentation_ component `<Contact-Presentation/>`, which receives `details.contact` data as `@Input() contact` property for rendering, and _emits_ `@Output() onAdd.emit(contact.id)` event when user clicks on a _Add to my Contacts_ `<button/>`.


```
import { Component } from '@angular/core';
import { select, Store, Action } from '@ngrx/store';


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
    this.details$ = store.pipe(select(getDetailsSelector));
  }
  
  addContact(contactId: number) {
    this.store.dispatch({ 
      type: 'add_my_contact', 
      payload: contactId  
     } : Action)
  }

}
```


```
import { Component, Input, Output EventEmitter } from '@angular/core';

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

Our Objective in **Shallow Test(s)** is to assert _Container Component render stuff it is responsible for rendering properly_.

Its usual that we write our _Container component_ before we figure out which presentation components to re-use or create to abstract away the DOM handling.

Therefore for TDD its important for us to write unit tests for the container component ignoring all inner components at first if any to focus on the testing the containing component in isolation.


The trick here is to configure `TestBed` with only `declarations: [DetailsContainerComponent]`
Avoid the the contained presentation components with `schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]`

1. `<Details-Container/>` instantiates properly.
2. `<Details-Container/>`, selects `details` data from store (it could be `ActivatedRoute` , some direct _service_, etc if you are not using Store / Ngrx)
3. `<Details-Container/>` renders `details.title` and `details.description`, re-renders with changes on change detection


```
import { TestBed, async } from '@angular/core/testing';
import { DetailsContainerComponent } from './details.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviourSubject } from 'rxjs';
import { select, Store } from '@ngrx/store';


describe('DetailsContainerComponent', () => {

  let details: any;
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
          pipe: jasmine.createSpy('pipe').and.return(details$)},
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
    expect(store.pipe).toHaveBeenCallWith(select(getContainerDetails));
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

Our Objective in **Deep Test(s)** is to assert _Interactions of Container Component with presentation Components, store, and any services if any_.


1. `<Container-Details\>` passes the correct `@Input() contact` = `details.location` to `<Contact-Presentation/>`
2. `<Container-Details\>` can receive `(onAdd)` event from `<Contact-Presentation/>` & react by dispatching `add-my-contact` action to `Store`

```
import { TestBed, async } from '@angular/core/testing';
import { DetailsContainerComponent } from './details.component';
import { ContactPresetationComponent } from './contact.component';
import { Store } from '@ngrx/store';
import { BehaviourSubject } from 'rxjs';
import { select, Store } from '@ngrx/store';


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
          pipe: jasmine.createSpy('pipe').and.return(details$)},
          dispatch: jasmine.createSpy('dispatch')
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DetailsContainerComponent);
    comp = fixture.debugElement.componentInstance;
  }));

  it('should pass contact.details as inpiut to <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const de = fixture.debugElement;
    const contactEl = de.query(By.css('Contact-Presentation'));
    const contactComp = contactEl.componentInstance as ContactPresetationComponent;
    expect(contactComp).toBeTruhty();
    expect(contactComp.contact).toEqual(details.contact);
    const contact = { firstName: 'Paul', email: 'paul@paul.com' }
    details.next({...details, contact});
    fixture.detectChanges();
    expect(contactComp.contact).toEqual(contact);
  }));

  it('should listen to onAdd() event from <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const de = fixture.debugElement;
    const contactEl = de.query(By.css('Contact-Presentation'));
    const contactComp = contactEl.componentInstance as ContactPresetationComponent;
    expect(contactComp).toBeTruhty();
    spyOn(comp,'addContact').and.callThrough();
    const contactId = 10;
    contactComp.onAdd.emit(contactId);
    expect(comp.addContact).toHaveBeenCalledWith(contactId);
    expect(store.dispatch).toHaveBeenCalledWith({
        type: 'add_my_contact',
        payload: 10
      } : Action);
  }));

});

```


### How deep should we test?

We can always test the rendering and event handling of inner components in deep tests for container components.
However, that is necessary if we are not writing any shallow tests for those inner components.
Assuming we write shallow tests for all component, unit tests for store reducers, selectors and effects, writing deep tests for container components to just test the interactions is reasonable.


Let us consider we don't have a shallow test for `<Contact-Presentation>`, and we don't need writing one as it is not going to be used anywhere other than `<Details-Container>`
We could re-write the last two tests as follows.

```
  it('should pass contact.details as inpiut to <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const contactComp = fixture.debugElement.query(By.css('Contact-Presentation'));
    expect(contactComp).toBeTruhty();
    const contactEl = contactComp.nativeElement;
    // check rendering on contact element
    expect(contactEl.querySelector('strong').textContent).toContain(details.contact.firstName);
    expect(contactEl.querySelector('a').textContent).toContain(details.contact.email);
    const contact = { firstName: 'Paul', email: 'paul@paul.com' }
    details.next({...details, contact});
    fixture.detectChanges();
    expect(contactEl.querySelector('strong').textContent).toContain(contact.firstName);
    expect(contactEl.querySelector('a').textContent).toContain(contact.email);
  }));

  it('should listen to onAdd() event from <Contact-Presentation/>', async(() => {
    fixture.detectChanges();
    const contactComp = fixture.debugElement.query(By.css('Contact-Presentation'));
    expect(contactComp).toBeTruhty();
    spyOn(comp,'addContact').and.callThrough();
    const contactId = 10;
    // click event triggerred from contact elemnt button
    contactComp.nativeElement.querySelector('button').click();
    expect(comp.addContact).toHaveBeenCalledWith(contactId);
    expect(store.dispatch).toHaveBeenCalledWith({
        type: 'add_my_contact',
        payload: 10
      } : ActionWithPayload<number>);
  }));


```


Its more _maintainable_ to test _DOM rendering and event handling_ of `<Contact-Presentation/>` in its own spec and not have the same tests in the `<Details-Container/>`

**_Presentation_** _components_ are re-usable and may be used by many other components. It is a maintenance overhead when the same component for same cases gets tested in many different places.

If you are concerned about how the whole component tree renders, **E2E** _(End to End Testing)_ tests are a better solution than complicating our deep tests for containers.

Check out [**Protractor**](https://github.com/angular/protractor) , a popular framework / tool for Angular _end to end testing_ **E2E** .

**Shallow** and **Deep Tests** fall under **Unit Testing** which are much easier to write, run faster and are self-contained which makes them more maintainable than **E2E Tests**

**E2E Tests** are great for high-level validation of the entire system. But they can’t give you the comprehensive test coverage that you would expect from **Unit Tests**.