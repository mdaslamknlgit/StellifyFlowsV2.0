import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
@Component({
  selector: 'app-reports-layout',
  templateUrl: './reports-layout.component.html',
  styleUrls: ['./reports-layout.component.css']
})
export class ReportsLayoutComponent implements OnInit {

  showMenu: boolean = false;
  mainData: boolean = false;
  hideAppBar: boolean = false;
  constructor(private sharedServiceObj: SharedService) {
    this.sharedServiceObj.hideAppBar$.subscribe((hide: boolean) => {
      this.hideAppBar = hide;
    });
  }
  ngOnInit() { }
  onMenuClick(eventArgs) {
    this.showMenu = !this.showMenu;
  }

}
