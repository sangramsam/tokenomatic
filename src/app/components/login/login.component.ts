import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AmplifyService } from 'aws-amplify-angular';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	@Output() changeActivePage = new EventEmitter<string>();
	@Output() showMainContent = new EventEmitter<boolean>();
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
 
  public serverError : string = '';
  public loginForm : FormGroup;
  public isLoading = false;
  private auth : any;
  public logdata:boolean=false;
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
  toggleInputDisable = (form) => {
    Object.keys(form.controls).forEach(it => {
      if (this.isLoading)
        form.controls[it].disable()
      else {
        form.controls[it].enable()
      }
    })
  }
  ngOnInit() {
    // create login form
    this.loginForm = this.fb.group({
      // email : [{value:'', disabled : false}, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"),Validators.email]],
      email :['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password : [{value:'', disabled : false}, Validators.required],
      rememberme : [{value:false, disabled : false}]
    })
  }
  onSubmit = () => {
    if (this.loginForm.status == 'INVALID') {
      this.loginForm.get('email').markAsDirty();
      this.loginForm.get('password').markAsDirty();
      return;
    }
    let email = this.loginForm.get('email').value;
    let password = this.loginForm.get('password').value;
    let rememberme = this.loginForm.get('rememberme').value;

    this.isLoading = true
    this.toggleInputDisable(this.loginForm)
    this.auth.signIn(email, password)
    .then(user => {
      this.isLoading = false
      this.toggleInputDisable(this.loginForm)
      this.showMainContent.emit(true)
      if(this.logdata)
      {
      sessionStorage.setItem("username",user.username);
      }
      console.log(user)
    })
    .catch(err => {
      this.isLoading = false
      this.toggleInputDisable(this.loginForm)
      this.serverError = err.message
      console.log(err)
    });
  }

  selectBadge (e) {
console.log(e.target.checked);

    if (e.target.checked) {
      this.logdata=true;
    }  else {
      this.logdata=false;
    }
   
   }
   
}
