import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../services/login.service'
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DataService } from '../../services/data.service';
import { faEyeSlash,faEye } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {
  faEyeSlash = faEyeSlash;
  faEye=faEye;
  signupForm: FormGroup;
  formSubmitAttempt: boolean = false;
  showError: boolean = false;
  selecttab: boolean = false;
  eyeIcon: boolean= true;
  eyeIcon2: boolean;
  returnUrl: string;
  password:string ="password" ;
  constructor(public route: ActivatedRoute, private router: Router, private LoginService: LoginService,
    public sessionService: SessionStorageService, private dataService: DataService) { }

  ngOnInit() {

    this.signupForm = new FormGroup({
      "UserName": new FormControl("", [Validators.required]),
      "Password": new FormControl("", Validators.required)
    });

    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/inventory/dashboard';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/crm/dashboard';

  }

  validateControl(control: any) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  Login() {

    this.formSubmitAttempt = true;
    this.signupForm.get('Password').setValidators([Validators.required]);
    this.signupForm.get('Password').updateValueAndValidity();
    let status = this.signupForm.status;
    sessionStorage.removeItem("access_token");
    if (status != "INVALID") {
      this.LoginService.login(this.signupForm.value)
        .subscribe((response: { status: string, userDetails: any, tokenDetails: any }) => {
          if (response.status) {
            debugger;  
            //let tokenDetails = JSON.parse(response.tokenDetails);   
            let tokenDetails=response.tokenDetails;
            this.sessionService.setToken(tokenDetails);
            this.sessionService.setUser(response.userDetails);
           
            this.router.navigateByUrl(this.returnUrl);
            this.formSubmitAttempt = false;
          }
          else {
            this.showError = true;
          }
        });

    }
    else {
      // this.signupForm.markAsUntouched();
      Object.keys(this.signupForm.controls).forEach((key: string) => {
        if (this.signupForm.controls[key].status == "INVALID" && this.signupForm.controls[key].touched == false) {
          this.signupForm.controls[key].markAsTouched();
        }
      });
    }

  }
  eyeSymbol(event){
this.password= "text"; 
this.eyeIcon2=true;
this.eyeIcon=false;
  }
  eyeSymbol2 (event){
this.password= "password"; 
this.eyeIcon2=false;
this.eyeIcon=true;
  }
  tabClick (event){
this.selecttab = !this.selecttab
  }
  validateUsername() {
    this.signupForm.get("Password").clearValidators();
    this.signupForm.get('Password').updateValueAndValidity();

    if (this.signupForm.status != "INVALID") {
      this.dataService.userName = this.signupForm.get("UserName").value;
      this.router.navigate(['/user/forgetpassword'])
    }
    else {
      Object.keys(this.signupForm.controls).forEach((key: string) => {
        if (this.signupForm.controls[key].status == "INVALID" && this.signupForm.controls[key].touched == false) {
          this.signupForm.controls[key].markAsTouched();
        }
      });
    }
  }
}
