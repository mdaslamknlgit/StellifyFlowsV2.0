import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Messages } from '../../../shared/models/shared.model';

@Component({
  selector: 'app-project-billing',
  templateUrl: './project-billing.component.html',
  styleUrls: ['./project-billing.component.css']
})
export class ProjectBillingComponent implements OnInit {
  projectBillingInForm: FormGroup;
  projectBillingDeTailsInForm: FormGroup;
  hidetext: boolean = false;
  tentativeStartDate = new Date()
  tentativeEndDate = new Date()
  projectMileStones: any[];
  totalRecords: number = 0;
  gridColumns: Array<{ field: string, header: string }> = [];
  selectedProject: Project
  scrollbarOptions: any;
  totalBilledAmount: number;
  totalUnBilledAmount: number;
  rightsection:boolean=false;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  constructor(public fb: FormBuilder) {
    this.selectedProject = new Project();
  }

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

  projects =
    [
      {
        ProjectID: '#56454525',
        ProjectName: 'Inventory Project',
        ProjectOwner: 'Williams',
        TentativeStartDate: '2018/09/05',
        TentativeEndDate: '2018/09/25',
        ProjectCost: 10000,
      },
      {
        ProjectID: '#4343325',
        ProjectName: 'Asset Project',
        ProjectOwner: 'Williams',
        TentativeStartDate: '2018/08/25',
        TentativeEndDate: '2018/09/15',
        ProjectCost: 50000
      },
      {
        ProjectID: '#3334525',
        ProjectName: 'Fixed Assets',
        ProjectOwner: 'Joseph',
        TentativeStartDate: '2018/08/01',
        TentativeEndDate: '2018/09/30',
        ProjectCost: 20000
      },
      {
        ProjectID: '#84334525',
        ProjectName: 'Facility Project',
        ProjectOwner: 'David',
        TentativeStartDate: '2018/09/01',
        TentativeEndDate: '2018/09/30',
        ProjectCost: 25000
      },
    ]

  ngOnInit() {

    this.projectBillingInForm = new FormGroup({
      'ProjectID': new FormControl(null),
      'ProjectName': new FormControl(null, [Validators.required]),
      'OwnerID': new FormControl(null, [Validators.required]),
      'TentativeStartDate': new FormControl(null, [Validators.required]),
      'TentativeEndDate': new FormControl(null, [Validators.required]),
      'BillingDetails': this.fb.array([
      ]),
    });

    let billingDetails = this.projectBillingInForm.get('BillingDetails') as FormArray;
    billingDetails.controls = [];

    this.gridColumns = [
      { field: 'Sno', header: 'S.no.' },
      { field: 'TaskDescription', header: 'Task Description' },
      { field: 'Percentage', header: 'Percentage' },
      { field: 'Value', header: 'Value' },
      { field: 'Status', header: 'Status' }
    ];

    this.projectMileStones = [
      { Sno: 1, TaskDescription: 'First Milestone', Percentage: '10%', Value: '1000.00', Status: 'Billed' },
      { Sno: 2, TaskDescription: 'Second Milestone', Percentage: '5%', Value: '500.00', Status: '' },
      { Sno: 3, TaskDescription: 'Third Milestone', Percentage: '20%', Value: '2000.00', Status: '' },
      { Sno: 4, TaskDescription: 'Fourth Milestone', Percentage: '25%', Value: '2500.00', Status: 'Billed' },
      { Sno: 5, TaskDescription: 'Fifth Milestone', Percentage: '50%', Value: '5000.00', Status: '' },
      { Sno: 6, TaskDescription: 'Sixth Milestone', Percentage: '5%', Value: '500.00', Status: '' },
      { Sno: 7, TaskDescription: 'Seven Milestone', Percentage: '20%', Value: '2000.00', Status: 'Billed' }

    ];

    billingDetails.patchValue(this.projectMileStones);

    this.totalRecords = this.projectMileStones.length;
  }

  cancleData() {
    this.hidetext = false;
    this.projectBillingInForm.get('ProjectID').setValue("");
  }

  onChange(event) {
    this.selectedProject = this.projects.filter(x => x.ProjectID === event.target.value)[0];
    this.hidetext = true;
    this.totalBilledAmount = this.projectMileStones
      .filter(c => c.Status === "Billed")
      .map(c => Number(c.Value))
      .reduce((sum, current) => sum + current);

    this.totalUnBilledAmount = this.projectMileStones
      .filter(c => c.Status === "")
      .map(c => Number(c.Value))
      .reduce((sum, current) => sum + current);
  }
}


export class Project {
  ProjectID: string
  ProjectName: string
  ProjectOwner: string
  TentativeStartDate: string
  TentativeEndDate: string
  ProjectCost: number
}
