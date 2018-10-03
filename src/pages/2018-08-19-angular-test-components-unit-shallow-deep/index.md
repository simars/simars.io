---
path: "/angular-test-components-unit-shallow-deep"
date: "2018-08-19"
title: "Testing Angular Directives with a fake TestComponent"
author: "Simar Paul Singh"
published: false
---


* * *

**Angular Directives** are an important construct in angular to make **DOM** *manipulation* and / or *event handling* abstract.


**We must *Unit Test* directives by mocking all dependencies of directive.**
1. Very Simple to write, no need for TestBed, just work with jasmine spies and mocks
2. Run them as often, fast and effective


**Since directive work on components (compiled DOM) we must also test them with an actual component**
1. Need TestComponent, and TestBed, to create a TestModule which compiles your fake TestComponent with directive to be tested
2. Dependencies to the fake TestComponent are mocked, instead of mocking the containerRef to directive
3. Besides little complexity setting up the TestBed, fast and effective


Unit Tests are easy to write and understand. We are going to discuss here testing of directives with an actual TestComponent

## Lets write some tests

