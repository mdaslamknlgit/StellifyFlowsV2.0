import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-adhoc-layout',
  templateUrl: './adhoc-layout.component.html',
  styleUrls: ['./adhoc-layout.component.css'],
  providers: [SharedService]
})
export class AdhocLayoutComponent implements OnInit {
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
