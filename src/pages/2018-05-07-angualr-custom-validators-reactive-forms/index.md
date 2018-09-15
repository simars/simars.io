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

For example, if a field _(email)_ is required only when _field (phone)_ is not filled in, *`ngIf` can simply remove or `attr.disabled` can disable the unrequited _field (email)_ from the DOM, and put it back as a required field based on the _field (phone)_ value.

<pre>

&lt;form #ngForm=&quot;f&quot; (ngSubmit)=&quot;f.valid &amp;&amp; onSubmit(f)&quot; novalidate&gt;
 &lt;label&gt;
    Phone &lt;input name=&quot;phone&quot; #ngModel=&quot;phone&quot;   pattern=&quot;[0-9]{9}&quot;&gt;
 &lt;/label&gt;
 &lt;label&gt; `*ngIf=&quot;phone.errors.pattern&quot;&gt;
   Phone Number should be digits
 &lt;/label&gt;`&lt;/pre&gt;
 &lt;label&gt;
   Email &lt;input name=&quot;email&quot; #ngModel=&quot;email&quot;&gt;
 &lt;/label&gt;
 &lt;label&gt; `*ngIf=&quot;`phone?.value?.length || email.value?.length`&quot;&gt;
   Email is required if phone number is not given
 &lt;/label&gt;`
 &lt;button type=&quot;submit'
  [disabled]=&quot;!f.valid || (!phone.value?.length &amp;&amp; !email.value?.length)&quot;&gt;Submit&lt;/button&gt;&lt;/pre&gt;
&lt;/form&gt;

</pre>

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

<pre>
class CustomValidators {

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
  }

  static requiredEither(requiredControlName, controlToCheckName) {
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
  }

  static requiredWhenNot(requiredControlName, controlToCheckName) {
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
  }

}

function setErrors(error: {[key: string]: any }, control: AbstractControl) {
  control.setErrors({...control.errors, ...error});  
}

function  removeErrors(keys: string[], control: AbstractControl) {
  const remainingErrors = keys.reduce((errors, key) => {  
    delete  errors[key];  
    return errors;  
  }, {...control.errors});  
  control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);  
}
</pre>

Use them declarively in your your FromBuilder group definations.

<pre>

 class AppComponent implements OnInit  {

  registerForm: FormGroup;
  submitted = false;

  constructor(@Inject() private formBuilder: FormBuilder) {}

  ngOnInit() {
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
    }
  }
</pre>

Template just reacts to validation control

<pre>
&lt;form [formGroup]="registerForm" (ngSubmit)="onSubmit()"&gt
 &lt;label&gt;
    Phone &lt;input formControlName=&quot;phone&quot;&gt;
 &lt;/label&gt;
 &lt;div *ngIf=&quot;f.phone.errors&quot; class=&quot;invalid-feedback&quot;&gt;
    &lt;div *ngIf=&quot;f.phone.errors.required&quot;&gt;
     Phone number is required if email is not given.&lt;/div&gt;
     &lt;div *ngIf=&quot;f.phone.errors.pattern&quot;&gt;
     Phone number must match pattern digits&lt;/div&gt;
 &lt;/div&gt;
 &lt;label&gt;
   Email &lt;input formControlName=&quot;email&quot;&gt;
 &lt;/label&gt;
 &lt;div *ngIf=&quot;f.email.errors&quot;&gt;
    &lt;div *ngIf=&quot;f.email.errors.required&quot;&gt;
    Email is required ({{f.email.errors.required}}).
    &lt;/div&gt;
    &lt;div *ngIf=&quot;f.email.errors.email&quot;&gt;
    Email must be a valid email address
    &lt;/div&gt;
 &lt;/div&gt;

 &lt;button [disabled]=&quot;registerForm.invalid&quot; type=&quot;submit&quot;&gt;
 Register
 &lt;/button&gt;
&lt;form&gt;
</pre>

## Try it out on [CodePen](https://codepen.io/simars/pen/ZMYxrm)

<iframe height='720' scrolling='no' title='angular-reactive-from-requiredWhen' src='//codepen.io/simars/embed/ZMYxrm/?height=265&theme-id=0&default-tab=js,result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/simars/pen/ZMYxrm/'>angular-reactive-from-requiredWhen</a> by Simar Paul Singh (<a href='https://codepen.io/simars'>@simars</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
