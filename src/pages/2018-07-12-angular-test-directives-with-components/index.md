---
path: "/testing-angular-directives-with-test-component"
date: "2018-07-12"
title: "Testing Angular Directives with a Test or Real Component"
author: "Simar Paul Singh"
published: true
---

* * *

**Angular Directives** are an important construct in angular to make **DOM** _manipulation_ and / or _event handling_ abstract.

We should _Unit Test_ directives by mocking all dependencies with jasmine mocks and spies. We should also _Shallow / Deep Test_ directives using concrete Components (Compiled DOM). 

A reasonable approach is to create **_TestComponent_** or pick up any component which uses the directive we want to test. **Dependencies to the _TestComponent_ are mocked**, but the **directive itself tests with a concrete component (compiled DOM)**. 

This involves setting up of a _TestBed_ to create a _TestModule (also creates a zone for testing)_ and compile _TestComponent_ with the directive to be tested.


Let us write a simple directive DisableLinkDirective which will provide `[attr.disabled]="condition"` functionality of anchor links `<a/>` so they can be disabled like `<button/>` natively do.

```
import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: 'a[disabled]'
})
export class DisableLinkDirective {

  @HostListener('click', ['$event'])
  click(event: Event) {
    console.log('event', event);
    event.preventDefault();
  }
}
```

We will test this directive with `TestDisableLinkComponent` component that has compiles anchor-links `<a/>` with `disabled` attribute.

```

import {DisableLinkDirective} from './disable-link.directive';
import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
// creating a test component in the spec file
@Component(
  {
    selector: 'ngx-mix-test-disable-link-directive',
    template: `
    <div>
     <a id="disabled-link" disabled (click)="onClick()">Disabled</a>
     <a id="normal-link" (click)="onClick()">Normal</a>
    </div>
    `
  }
)
class TestDisableLinkComponent {
toggle = false;
onClick() {
    this.toggle = !this.toggle;
  }
}
// tests start here
describe('DisableLinkDirective', () => {
let component: TestDisableLinkComponent;
  let fixture: ComponentFixture ;
beforeEach(async () => {
await TestBed.configureTestingModule({
      declarations: [TestDisableLinkComponent, DisableLinkDirective]
    }).compileComponents();
  });
beforeEach(async () => {
    fixture = TestBed.createComponent(TestDisableLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
it('should create an instance', () => {
    const directive = new DisableLinkDirective();
    expect(directive).toBeTruthy();
  });
it('should not toggle between enabled / disabled when the link with disabled attribute is clicked', async () => {
    const testDe: DebugElement = fixture.debugElement;
    const linkDe = testDe.query(By.css('#disabled-link'));
    const link: HTMLElement = linkDe.nativeElement;
    await expect(link.getAttribute('disabled')).not.toBe(null);
    const toggleValueBeforeClick = component.toggle;
    linkDe.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    await expect(toggleValueBeforeClick).toBe(component.toggle);
  });
it('should toggle between enabled / disabled when the link does not have disabled attribute', async () => {
    const testDe: DebugElement = fixture.debugElement;
    const linkDe = testDe.query(By.css('#normal-link'));
    const link: HTMLElement = linkDe.nativeElement;
    await expect(link.getAttribute('disabled')).toBe(null);
    const toggleValueBeforeClick = component.toggle;
    linkDe.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    await expect(toggleValueBeforeClick).not.toBe(component.toggle);
  });
});

```


