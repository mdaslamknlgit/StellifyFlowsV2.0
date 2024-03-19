import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CommonModule } from '@angular/common';
import *  as moment from "moment";
import { Messages } from '../../../shared/models/shared.model';
@Component({
  selector: 'app-project-retentionmanagement',
  templateUrl: './project-retentionmanagement.component.html',
  styleUrls: ['./project-retentionmanagement.component.css']
})
export class ProjectRetentionmanagementComponent implements OnInit {
  customerRetentions: any[];
  totalRecords: number = 0;
  //gridColumns: Array<{ field: string, header: string }> = [];
  gridColumns: any[];
  scrollbarOptions: any;
  rightsection:boolean=false;
  owners = [];
  costFilter: number;
  dateFilter = new Date()
  costTimeout: any;
  dateTimeout: any;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  constructor() { }

  ngOnInit() {

    this.gridColumns = [
      { field: 'ProjectID', header: 'Project ID' },
      { field: 'ProjectName', header: 'Project Name' },
      { field: 'OwnerName', header: 'Owner Name' },
      { field: 'StartDate', header: 'StartDate' },
      { field: 'EndDate', header: 'EndDate' },
      { field: 'TotalCost', header: 'TotalCost' },
      { field: 'Retentionpercentage', header: 'Retention Percentage' },
      { field: 'RetentionAmount', header: 'Retention Amount' },
      { field: 'RetetionDueDate', header: 'Retetion Due Date' }
    ];

    this.owners = [
      { label: 'All Owners', value: null },
      { label: 'Williams', value: 'Williams' },
      { label: 'Joseph', value: 'Joseph' },
      { label: 'David', value: 'David' },
      { label: 'John', value: 'John' },
      { label: 'Kate', value: 'Kate' }    
  ];

    this.customerRetentions = [
      { ProjectID: '#56454525', ProjectName: 'Inventory Project', OwnerName: 'Williams', StartDate: '2018/09/05', EndDate: '2018/09/25', TotalCost: 10000.00, Retentionpercentage: '20%', RetentionAmount: '1000.00', RetetionDueDate: '2018/09/20' },
      { ProjectID: '#4343325', ProjectName: 'Asset Project', OwnerName: 'Williams', StartDate: '2018/08/25', EndDate: '2018/09/20', TotalCost: 20000.00, Retentionpercentage: '20%', RetentionAmount: '4000.00', RetetionDueDate: '2018/09/20' },
      { ProjectID: '#3334525', ProjectName: 'Fixed Assets', OwnerName: 'Joseph', StartDate: '2018/09/01', EndDate: '2018/09/15', TotalCost: 5000.00, Retentionpercentage: '10%', RetentionAmount: '500.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#84334525', ProjectName: 'Facility Project', OwnerName: 'David', StartDate: '2018/09/01', EndDate: '2018/09/30', TotalCost: 50000.00, Retentionpercentage: '10%', RetentionAmount: '5000.00', RetetionDueDate: '2018/09/20' },
      { ProjectID: '#74334525', ProjectName: 'Property Project', OwnerName: 'Williams', StartDate: '2018/08/05', EndDate: '2018/08/31', TotalCost: 40000.00, Retentionpercentage: '20%', RetentionAmount: '8000.00', RetetionDueDate: '2018/08/20' },
      { ProjectID: '#64334525', ProjectName: 'Construction Project', OwnerName: 'John', StartDate: '2018/08/15', EndDate: '2018/09/15', TotalCost: 20000.00, Retentionpercentage: '10%', RetentionAmount: '2000.00', RetetionDueDate: '2018/09/05' },
      { ProjectID: '#55334525', ProjectName: 'New Inventory Project', OwnerName: 'Joseph', StartDate: '2018/08/05', EndDate: '2018/08/25', TotalCost: 30000.00, Retentionpercentage: '20%', RetentionAmount: '6000.00', RetetionDueDate: '2018/08/22' },
      { ProjectID: '#22334525', ProjectName: 'Building Project', OwnerName: 'Williams', StartDate: '2018/08/01', EndDate: '2018/09/30', TotalCost: 60000.00, Retentionpercentage: '20%', RetentionAmount: '12000.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#11334525', ProjectName: 'Transport Project', OwnerName: 'Kate', StartDate: '2018/07/01', EndDate: '2018/09/25', TotalCost: 80000.00, Retentionpercentage: '20%', RetentionAmount: '16,000.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#22234525', ProjectName: 'Construction 1 Project', OwnerName: 'John', StartDate: '2018/08/15', EndDate: '2018/09/15', TotalCost: 50000.00, Retentionpercentage: '10%', RetentionAmount: '5000.00', RetetionDueDate: '2018/09/05' },
      { ProjectID: '#45434525', ProjectName: 'Old Inventory Project', OwnerName: 'Joseph', StartDate: '2018/08/05', EndDate: '2018/08/25', TotalCost: 50000.00, Retentionpercentage: '20%', RetentionAmount: '10000.00', RetetionDueDate: '2018/08/22' },
      { ProjectID: '#6664525', ProjectName: 'Building 1 Project', OwnerName: 'Williams', StartDate: '2018/08/01', EndDate: '2018/09/30', TotalCost: 40000.00, Retentionpercentage: '20%', RetentionAmount: '8000.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#99934525', ProjectName: 'Transport New Project', OwnerName: 'Kate', StartDate: '2018/07/01', EndDate: '2018/09/25', TotalCost: 40000.00, Retentionpercentage: '5%', RetentionAmount: '2000.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#32664525', ProjectName: 'Building 2 Project', OwnerName: 'Williams', StartDate: '2018/08/01', EndDate: '2018/09/30', TotalCost: 40000.00, Retentionpercentage: '20%', RetentionAmount: '8000.00', RetetionDueDate: '2018/09/10' },
      { ProjectID: '#66734525', ProjectName: 'Transport 2 Project', OwnerName: 'Kate', StartDate: '2018/07/01', EndDate: '2018/09/25', TotalCost: 40000.50, Retentionpercentage: '5%', RetentionAmount: '2000.00', RetetionDueDate: '2018/09/10' }

    ];
  }

  onCostChange(event, dt) {
    if (this.costTimeout) {
        clearTimeout(this.costTimeout);
    }

    this.costTimeout = setTimeout(() => {     
        dt.filter(event.value, 'TotalCost', 'gt');
    }, 250);
}

onStartDateChange(event, dt) {
  if (this.dateTimeout) {
      clearTimeout(this.dateTimeout);
  }

  this.dateTimeout = setTimeout(() => {    
     let date = moment(event).format("yy/mm/dd").toLocaleString();
      dt.filter(date, 'StartDate', 'gt');
  }, 250);
}

}
