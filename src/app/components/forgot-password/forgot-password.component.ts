import { Component, OnInit, EventEmitter, Output  } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AmplifyService } from 'aws-amplify-angular';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
	@Output() changeActivePage = new EventEmitter<string>();
  public forgotPasswordForm : FormGroup;
  public passwordResetForm : FormGroup;
  public sendReqServerError : string = '';
  public restPasswordServerError : string = '';
  public isLoading = false;
  public currentForm : string;
  private auth : any;
  private userEmail : string = '';
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";

  constructor(
    private fb : FormBuilder,
    private amplifyService : AmplifyService,
  ) {
    this.auth = amplifyService.auth()
  }

  setActivePage = (activePage) => {
    if (this.isLoading)
      return
  	this.changeActivePage.emit(activePage)
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
  showForm = (formName) => {
    if (this.isLoading)
      return;
    if (formName == 'verify') {
      this.passwordResetForm.patchValue({email: this.userEmail})
      this.currentForm = 'verify'  
    } else {
      this.forgotPasswordForm.reset()
      this.currentForm = formName
    }
  }
  ngOnInit() {
    // create login form
    this.currentForm = 'forgot-password'
    this.forgotPasswordForm = this.fb.group({
      email :['', [Validators.required, Validators.pattern(this.emailPattern)]],
    })
    this.passwordResetForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', Validators.required],
      confirmPassword :['', Validators.required],
      'verification-code' : ['', Validators.required],
    })
  }
  onSubmit = () => {
    if (this.forgotPasswordForm.status == 'INVALID') {
      this.forgotPasswordForm.get('email').markAsDirty();
      return;
    }
    let email = this.forgotPasswordForm.get('email').value;
    this.isLoading = true
    this.toggleInputDisable(this.forgotPasswordForm)
    this.auth.forgotPassword(email)
    .then(data => {
      this.isLoading = false
      this.toggleInputDisable(this.forgotPasswordForm)
      console.log(data)
      this.userEmail = email;
      this.showForm('verify')
    })
    .catch(err => {
      this.isLoading = false
      this.toggleInputDisable(this.forgotPasswordForm)
      console.log(err)
      this.sendReqServerError = err.message
    })
  }
  onSubmitNewPassword = () => {
    if (this.passwordResetForm.status == 'INVALID') {
      this.passwordResetForm.get('password').markAsDirty();
      this.passwordResetForm.get('confirmPassword').markAsDirty();
      this.passwordResetForm.get('email').markAsDirty();
      return;
    }
    let email = this.passwordResetForm.get('email').value;
    let password = this.passwordResetForm.get('password').value;
    let confirmPassword = this.passwordResetForm.get('confirmPassword').value;
    let verify = this.passwordResetForm.get('verification-code').value;
    // Do addition checks on password
    // lower case test
    if (!/^(?=.*[a-z])/.test(password)) {
      this.passwordResetForm.get('password').setErrors({
        'lowercase': true
      });
      return;
    }
    if (!/^(?=.*[A-Z])/.test(password)) {
      this.passwordResetForm.get('password').setErrors({
        'caps': true
      });
      return;
    }
    if (!/^(?=.*[0-9])/.test(password)) {
      this.passwordResetForm.get('password').setErrors({
        'number': true
      });
      return;
    }
    if (!/^(?=.*[!@#\$%\^&\*])/.test(password)) {
      this.passwordResetForm.get('password').setErrors({
        'specialCharacter': true
      });
      return;
    }
    if (!/^(?=.{8,})/.test(password)) {
      this.passwordResetForm.get('password').setErrors({
        'length': true
      });
      return;
    }

    if (password !== confirmPassword) {
      // this.showSpinner = false;
      this.passwordResetForm.get('confirmPassword').setErrors({
        'notmatch': true
      });
      return;
    }
    // Register
    this.isLoading = true
    this.toggleInputDisable(this.passwordResetForm)
    this.auth.forgotPasswordSubmit(email, verify, password)
    .then(data => {
      this.isLoading = false
      this.toggleInputDisable(this.passwordResetForm)
      this.currentForm  = 'verify-success'
      console.log(data)
    })
    .catch(err => {
      this.isLoading = false
      this.toggleInputDisable(this.passwordResetForm)
      console.log(err)
      this.restPasswordServerError = err.message
    });
  }
}
