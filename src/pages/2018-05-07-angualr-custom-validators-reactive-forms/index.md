---
path: "/custom-transitive-validators-in-reactive-forms-angular"
date: "2018-05-07"
title: "Build {Cross-field / Transitive Validators} for {Reactive Forms} | Angular"
author: "Simar Paul Singh"
---

* * *

Advantages of **Reactive** **Forms** over Template Driven Forms stem from the fact, controls are defined in **Component** **programmatically** and assigned to form and its inputs in **Template declaratively**

This makes adding controls dynamically with `FormArray`, reacting to events with RxJs, Unit testing sans `Template` all easier with code in component driving the logic, over html directives and /or pipes handling the same in template / dom.

However, there are aspects to form handling, in particular field validation and respective error messages that are more convenient in templates.

For example, if a field _(email)_ is required only when _field (phone)_ is not filled in, *`ngIf` can simply remove or disable the unrequited _field (email)_ from the DOM, and put it back as a required field based on the _field (phone)_ value.

<pre name="d2c5" id="d2c5" class="graf graf--pre graf-after--p"><form #ngForm="f" (ngSubmit)="f.valid && onSubmit(f)" novalidate>  
 <label>   
    Phone <input name="phone" #ngModel="phone"   pattern="[0-9]{9}">  
 </label>  
 <label> `*ngIf="phone.errors.pattern">   
   Phone Number should be digits  
 </label>`</pre>

<pre name="2b32" id="2b32" class="graf graf--pre graf-after--pre"><label>   
   Email <input name="email" #ngModel="email">  
 </label>  
 <label> `*ngIf="`phone?.value?.length || email.value?.length`">   
   Email is required if phone number is not given  
 </label>`  
 <button type="submit'  
  [disabled]= "!f.valid || (!phone.value?.length && !email.value?.length)">Submit</button></pre>

<pre name="8ce0" id="8ce0" class="graf graf--pre graf-after--pre"></form></pre>

In reactive form setup, having `*ngIf` ain’t going to do any good. The form controls in form group, controlling form’s fields are decoupled from template DOM by design.

In a reactive form setup even If an *ngIf disables a required input in template DOM, an event must be handled in component to instrument the FormGroup’s contol declared for this input.

**So how can we do declarative style validations in Reactive Forms**?

### Built in Angular input validators

Angular has handful of built in validaitors we could use in our `FormGroupBuilder` to match the basic HTML 5 validators we use use in templates / DOM (`required`,`minLength`,`maxLength`,`pattern`,`email` ).

A special one `compose`: is used when more than one validation is needed for the same form field.

A **limitation** here is, there is **no transitive / cross field validation** built-in where state of one field effects the other. We need custom group level validators, which we can build in a reusable pattern.

### How to Build reusable custom Cross-Field / Transitive validations

Checkout the full implementation by clicking [[CodePen]](https://codepen.io/simars/pen/ZMYxrm)

Let consider possible relationships between Field-1 with Field-2, there are 3 possible cases.

1\. Field-1 is required only when Field-2 is given or vice-versa

2\. Field-1 is not required when Field-2 is given or vice-versa

3\. Either of Field-1 or Field-2 are required.

If Both fields are required, there isn’t any relationship, simply both are Validation.required at their respective field levels.

This is how we can build a reusable Custom validates for each of these cases.

<pre name="a34e" id="a34e" class="graf graf--pre graf-after--p">class CustomValidators {  

  static requiredWhen(requiredControlName, controlToCheckName) {  
    return (control: AbstractControl) => {  
      const required = control.get(requiredControlName);  
      const toCheck = control.get(controlToCheckName);  
      if (required.value || !toCheck.value) {  
        removeErrors(['required'], required);  
        return null;  
      }  
      const errorValue = `${requiredControlName}_Required_When_${controlToCheckName}`;  
      setErrors({required: errorValue}, required);  
      return {[errorValue]: true};  
    };  
  }</pre>

<pre name="20ef" id="20ef" class="graf graf--pre graf-after--pre">static requiredEither(requiredControlName, controlToCheckName) {  
    return (control) => {  
      const required = control.get(requiredControlName);  
      const toCheck = control.get(controlToCheckName);  
      if (required.value || toCheck.value) {  
        removeErrors(['required'], required);  
        removeErrors(['required'], toCheck);  
        return null;  
      }  
      const errorValue = `${requiredControlName}_Required_Either_${controlToCheckName}`;  
      setErrors({required: errorValue}, required);  
      setErrors({required: errorValue}, toCheck);  
      return {[errorValue]: true};  
    };  
  }</pre>

<pre name="5e9f" id="5e9f" class="graf graf--pre graf-after--pre">static requiredWhenNot(requiredControlName, controlToCheckName) {  
    return (control) => {  
      const required = control.get(requiredControlName);  
      const toCheck = control.get(controlToCheckName);  
      if (required.value || toCheck.value) {  
        removeErrors(['required'], required);  
        return null;  
      }  
      const errorValue = `${requiredControlName}_Required_When_Not_${controlToCheckName}`;  
      setErrors({required: errorValue}, required);  
      return  {[errorValue]: true};  
    };  
  }</pre>

<pre name="6a83" id="6a83" class="graf graf--pre graf-after--pre">}</pre>

<pre name="8f05" id="8f05" class="graf graf--pre graf-after--pre">function setErrors(error: {[key: string]: any }, control: AbstractControl) {  
  control.setErrors({...control.errors, ...error});  
}</pre>

<pre name="54a1" id="54a1" class="graf graf--pre graf-after--pre">function  removeErrors(keys: string[], control: AbstractControl) {  
  const remainingErrors = keys.reduce((errors, key) => {  
    delete  errors[key];  
    return errors;  
  }, {...control.errors});  
  control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);  
}</pre>

Use them declarively in your your FromBuilder group definations.

<pre name="abff" id="abff" class="graf graf--pre graf-after--p">class AppComponent implements OnInit  {</pre>

<pre name="040f" id="040f" class="graf graf--pre graf-after--pre">registerForm: FormGroup;  
    submitted = false;  

  constructor( [@Inject](http://twitter.com/Inject "Twitter profile for @Inject")(FormBuilder) private formBuilder: FormBuilder) {}</pre>

<pre name="dbfe" id="dbfe" class="graf graf--pre graf-after--pre">ngOnInit() {  
        this.registerForm = this.formBuilder.group({  
            firstName: ['', Validators.required],  
            phone: ['', [Validators.pattern('[0-9]*')]],  
            email: ['', [ Validators.email]]  
        },  
        {  
          validator: [  
            CustomValidators.requiredEither('email', 'phone')  
          ]  
        }                                             
       );  
    }  

    // convenience getter for easy access to form fields  
    get f() { return this.registerForm.controls; }  

    onSubmit() {  
        this.submitted = true;  

        // stop here if form is invalid  
        if (this.registerForm.invalid) {  
            return;  
        }  
        alert(`Submitted -> ${JSON.stringify(this.registerForm.value)}`);  
    }</pre>

<pre name="2459" id="2459" class="graf graf--pre graf-after--pre">}</pre>

Template just reacts to validation control

<pre name="4ad8" id="4ad8" class="graf graf--pre graf-after--p"><form [formGroup]="registerForm" (ngSubmit)="onSubmit()">  
 <label>   
    Phone <input formControlName="phone">  
 </label>  
 <div *ngIf="f.phone.errors" class="invalid-feedback">  
    <div *ngIf="f.phone.errors.required">  
     Phone number is required if email is not given.</div>  
     <div *ngIf="f.phone.errors.pattern">  
     Phone number must match pattern digits</div>  
 </div></pre>

<pre name="4f4c" id="4f4c" class="graf graf--pre graf-after--pre"><label>   
   Email <input formControlName="email">  
 </label>  
 <div *ngIf="f.email.errors">  
    <div *ngIf="f.email.errors.required">  
    Email is required ({{f.email.errors.required}}).  
    </div>  
    <div *ngIf="f.email.errors.email">  
    Email must be a valid email address  
    </div>                          
</div></pre>

<pre name="6adf" id="6adf" class="graf graf--pre graf-after--pre"><button [disabled]="registerForm.invalid" type="submit">  
 Register  
</button></pre>

<pre name="73df" id="73df" class="graf graf--pre graf-after--pre"></form></pre>

Checkout full working code at [https://codepen.io/simars/pen/ZMYxrm](https://codepen.io/simars/pen/ZMYxrm)
