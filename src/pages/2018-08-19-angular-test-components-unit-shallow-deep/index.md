---
path: "/angular-test-components-unit-shallow-deep"
date: "2018-08-19"
title: "Testing Angular Directives with a fake TestComponent"
author: "Simar Paul Singh"
published: false
---


* * *

Typical **Angular** application is a set of *Container / Smart ? Stateful* components, containing one ore more re-usable *Presentation / Dumb / Stateless* components.
Consider an example `<Details-Container/>` component is a container component, responsible for providing and / or managing state `details`, (ex. using ngrx store, state selectors and/or actions).
It uses two presentation components `<Location-Presentation/>` and `<Contact-Presentation/>` , which receive data as input properties to rendered.


```
<Details-Container>

  <h3>{{details.name}}</h3>
  <p>{{details.description}}</p>

   <Location-Presentation [data-location]="details.address"/>
   <Contact-Presentation [data-contact]="details.contact"/>
</DetailsPage-Container>
```


How should we test this arrangement?

Assuming that we have already written and tested our presentation components in isolation,  we will first focus on testing our container component.

We should test our `Details-Container` at 3 levels

1. **Unit Test** The container component Renders `details.name` and `details.description`, the stuff it is responsible for rendering properly
2. **Shallow Test** The container passes the correct inputs to the two presentation components, and is able t receive expected events, and react appropriately
3. **Deep Test** Treat the whole arrangement as one, and assert for a given detail, it renders properly.


## Unit Test

**We must *Unit Test* components by mocking all dependencies**
1. Very Simple to write, no need for TestBed, just work with jasmine spies and mocks
2. Run them as often, fast and effective


## Shallow and Deep Tests

**Since components compile to be actual DOM in the browser we must also test them with an actual component**
1. Need TestComponent, and TestBed, to create a TestModule which compiles your fake TestComponent with directive to be tested
2. Dependencies to the fake TestComponent are mocked, instead of mocking the containerRef to directive
3. Besides little complexity setting up the TestBed, fast and effective

