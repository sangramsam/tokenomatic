import { Component, OnInit, EventEmitter, Output, Directive  } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { AmplifyService } from 'aws-amplify-angular';


@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
	@Output() changeActivePage = new EventEmitter<string>();
  public registerForm : FormGroup;
  public registerVerifyForm : FormGroup;
  public userEmail : string = ''
  private auth : any;
  public currentForm = 'register'
  public serverSignUpError = ''
  public serverVerificationError = ''
  public isLoading = false;
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  constructor(
    private fb : FormBuilder,
    private amplifyService : AmplifyService,
  ) {
    this.auth = amplifyService.auth()
  }

  setActivePage = (activePage) => {
    if (this.isLoading)
      return;
  	this.changeActivePage.emit(activePage)
  }

  ngOnInit() {
    // create login form
    this.currentForm = 'register'
    this.registerForm = this.fb.group({
      //email : [{value : '', disabled: false}, [Validators.required, Validators.email]],
      email :['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password : [{value : '', disabled: false}, Validators.required],
      // username : ['', Validators.required],
			confirmPassword :[{value : '', disabled: false}, Validators.required],
			agreetoterms : [{value : '', disabled: false}, Validators.required],
    })
    this.registerVerifyForm = this.fb.group({
      'verification-code' : [{value : '', disabled: false}, Validators.required],
      email : [{value : '', disabled: false}, [Validators.required, Validators.email]],
    })
  }
  showForm = (formName) => {
    if (this.isLoading) {
      return;
    }
    if (formName == 'verify') {
      this.registerVerifyForm.patchValue({email: this.userEmail})
      this.currentForm = 'verify'  
    } else {
      this.registerForm.reset()
      this.currentForm = formName
    }
  }
  toggleInputDisable = (form) => {
    Object.keys(form.controls).forEach(it => {
      if (this.isLoading)
        form.controls[it].disable()
      else {
        form.controls[it].enable()
      }
    })
  }
  onSubmit = () => {
    if (this.registerForm.status == 'INVALID') {
      this.registerForm.get('email').markAsDirty();
      // this.registerForm.get('username').markAsDirty();
      this.registerForm.get('password').markAsDirty();
      this.registerForm.get('confirmPassword').markAsDirty();      
      this.registerForm.get('agreetoterms').markAsDirty();
      return;
    }
    let email = this.registerForm.get('email').value;
    let password = this.registerForm.get('password').value;
    let agreetoterms = this.registerForm.get('agreetoterms').value;
    let confirmPassword = this.registerForm.get('confirmPassword').value;
    // Do addition checks on password
    // lower case test
    if (!/^(?=.*[a-z])/.test(password)) {
      this.registerForm.get('password').setErrors({
        'lowercase': true
      });
      return;
    }
    if (!/^(?=.*[A-Z])/.test(password)) {
      this.registerForm.get('password').setErrors({
        'caps': true
      });
      return;
    }
    if (!/^(?=.*[0-9])/.test(password)) {
      this.registerForm.get('password').setErrors({
        'number': true
      });
      return;
    }
    if (!/^(?=.*[!@#\$%\^&\*])/.test(password)) {
      this.registerForm.get('password').setErrors({
        'specialCharacter': true
      });
      return;
    }
    if (!/^(?=.{8,})/.test(password)) {
      this.registerForm.get('password').setErrors({
        'length': true
      });
      return;
    }

    if (password !== confirmPassword) {
      // this.showSpinner = false;
      this.registerForm.get('confirmPassword').setErrors({
        'notmatch': true
      });
      return;
    }
    // Register
    this.isLoading = true
    // disable all formcontrols 
    this.toggleInputDisable(this.registerForm)


    this.auth.signUp({
      username: email,
    password,
    attributes: {
        email
    }
    })
    .then(data => {
      this.userEmail = email
      this.isLoading = false
      this.toggleInputDisable(this.registerForm)
      this.showForm('verify')
    })
    .catch(err => {
      console.log(err)
      this.isLoading = false
      this.toggleInputDisable(this.registerForm)
      this.serverSignUpError = err.message
    });
  }
  onVerifySubmit = () => {
    if (this.registerVerifyForm.status == 'INVALID') {
      this.registerVerifyForm.get('verification-code').markAsDirty();
      this.registerVerifyForm.get('email').markAsDirty();
      return;
    }
    let verify = this.registerVerifyForm.get('verification-code').value;
    let email = this.registerVerifyForm.get('email').value;
    // Register
    this.isLoading = true
    this.toggleInputDisable(this.registerVerifyForm)
    this.auth.confirmSignUp(email, verify)
    .then(data => {
      this.isLoading = false
      this.toggleInputDisable(this.registerVerifyForm)
      this.showForm('verify-success')
    })
    .catch(err =>  {
      console.log(err)
      this.isLoading = false
      this.toggleInputDisable(this.registerVerifyForm)
      this.serverVerificationError = err.message
    });
  }

}
