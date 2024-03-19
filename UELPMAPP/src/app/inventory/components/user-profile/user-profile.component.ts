import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { UserProfileService } from "../../services/user-profile.service";


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers:[UserProfileService]
})
export class UserProfileComponent 
{


  userProfileForm:FormGroup;

  userProfile:{ UserName:string };

  constructor(private userProfileServiceObj:UserProfileService) 
  {

        this.userProfileForm = new FormGroup({

            'UserName':new FormControl("",[Validators.required])
        });
   }



   /**
    * this method will be called when user clicks on the
    * submit button
    */
   submitUserProfile()
   {

        if(this.userProfileForm.status!="INVALID")
        {

            let userProfileData = this.userProfileForm.value;

            this.userProfileServiceObj.saveUserProfile(userProfileData).subscribe((data)=>{





            });
        }

   }


   /**
    * this method will be called on component intialization...
    */
   getUserProfile()
   {

            this.userProfileServiceObj.getUserProfile(1).subscribe((data:{ UserName:string })=>{

                this.userProfile = data;

            });
   }
}
