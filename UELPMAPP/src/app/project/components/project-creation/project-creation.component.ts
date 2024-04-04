import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MatSlideToggle } from '@angular/material';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-project-creation',
  templateUrl: './project-creation.component.html',
  styleUrls: ['./project-creation.component.css']
})
export class ProjectCreationComponent implements OnInit {
  hidetext: boolean = true;
  hideinput: boolean = false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  signupForm: FormGroup;
  scrollbarOptions: any;
  tentativeStartDate = new Date()
  tentativeEndDate = new Date()
  isEditMode: boolean = false;
  @ViewChild('rightPanel') rightPanelRef;


  projectMileStones =
    [
      {
        sno: '1',
        KeyMilestones: 'First MileStone',
        StartDate: '19-Aug-2017 ',
        EndDate: '18-Sept-2018',
        IsBillable: 'Yes',
        Percentage: '18%'
      },
      {
        sno: '1',
        KeyMilestones: 'Second MileStone',
        StartDate: '19-May-2017 ',
        EndDate: '18-Sept-2018',
        IsBillable: 'Yes',
        Percentage: '18%'
      },
      {
        sno: '1',
        KeyMilestones: 'Third MileStone',
        StartDate: '19-Feb-2017 ',
        EndDate: '18-Sept-2018',
        IsBillable: 'Yes',
        Percentage: '18%'
      }
    ]
  users =
    [
      {
        Id: '1',
        Name: 'User 1'
      },
      {
        Id: '2',
        Name: 'User 2'
      },
      {
        Id: '3',
        Name: 'User 3'
      },
      {
        Id: '4',
        Name: 'User 4'
      },
    ]

  locations =
    [
      {
        LocationID: '1',
        Name: 'Unit 1'
      },
      {
        LocationID: '1',
        Name: 'Unit 2'
      },
      {
        LocationID: '1',
        Name: 'Unit 3'
      },
      {
        LocationID: '4',
        Name: 'Unit 4'
      }
    ]
  constructor() { }

  deleteRow(index: number) {
    this.users.splice(index, 1); //replace your Model here instead of this.user
  }
  ngOnInit() {
    this.signupForm = new FormGroup({
      'ProjectID': new FormControl(null, [Validators.required]),
      'LocationID': new FormControl(null, [Validators.required]),
      'ProjectCode': new FormControl(null, [Validators.required]),
      'ProjectName': new FormControl(null, [Validators.required]),
      'OwnerID': new FormControl(null, [Validators.required]),
      'TentativeStartDate': new FormControl(null, [Validators.required]),
      'TentativeEndDate': new FormControl(null, [Validators.required]),
      'IsCapEx': new FormControl(null, [Validators.required]),
      'Description': new FormControl(null, [Validators.required])

    });
  }

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
}


  addData() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
    this.isEditMode = false;
  }

  editData() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
    this.isEditMode = true;
  }

  saveData() {
    this.savedsucess = true;
    this.hidetext = true;
    this.hideinput = false;
    this.isEditMode = false;
  }

  closeWindow() {
    this.savedsucess = false;
  }

  cancleData() {
    this.hidetext = true;
    this.hideinput = false;
    this.isEditMode = false;
  }

  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }
}
