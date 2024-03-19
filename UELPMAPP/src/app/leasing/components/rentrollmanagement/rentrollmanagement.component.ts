import { Component, OnInit } from '@angular/core';
import { Messages } from '../../../shared/models/shared.model';

@Component({
  selector: 'app-rentrollmanagement',
  templateUrl: './rentrollmanagement.component.html',
  styleUrls: ['./rentrollmanagement.component.css']
})
export class RentrollmanagementComponent implements OnInit {
  customerRetentions: any[];
  totalRecords: number = 0;
  gridColumns: Array<{ field: string, header: string }> = [];
  scrollbarOptions: any;
  hidetext?: boolean=null;
  rightsection:boolean=false;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  constructor() { }

  ngOnInit() {

    this.gridColumns = [
      { field: 'UnitNo', header: 'Unit No' },
      { field: 'TenantName', header: 'Tenant Name' },
      { field: 'MonthlyRent', header: 'Monthly Rent S($)' },
      { field: 'StartDate', header: 'Start Date' },
      { field: 'EndDate', header: 'End Date' },
      { field: 'LeaseExpires', header: 'Lease Expires' },
      { field: 'DueDate', header: 'DueDate' },
     
    ];


    this.customerRetentions = [
      { UnitNo: '#56454525', TenantName: 'Williams', MonthlyRent: '200', StartDate: '2018/09/05', EndDate: '2018/09/25', LeaseExpires: '2022/09/25', DueDate: '2018/09/25'},
      { UnitNo: '#56454425', TenantName: 'James', MonthlyRent: '150', StartDate: '2018/10/05', EndDate: '2018/11/25', LeaseExpires: '2020/09/25', DueDate: '2018/09/25'},
      { UnitNo: '#56454425', TenantName: 'Alok', MonthlyRent: '1000', StartDate: '2018/10/05', EndDate: '2018/11/25', LeaseExpires: '2020/09/25', DueDate: '2018/09/25'},
    ];
  }

}
