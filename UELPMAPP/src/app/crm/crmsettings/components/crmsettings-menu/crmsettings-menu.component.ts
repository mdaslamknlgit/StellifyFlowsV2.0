import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crmsettings-menu',
  templateUrl: './crmsettings-menu.component.html',
  styleUrls: ['./crmsettings-menu.component.css']
})
export class CrmsettingsMenuComponent implements OnInit {
  showMenu: boolean = false;
  constructor(
    private router: Router,

  ) { }

  ngOnInit() {
  }
  onMenuClick(eventArgs) {
    this.showMenu = !this.showMenu;
  }
  ClickCRMSettings(e)
  {
    this.router.navigate([`/crmsettings/crmsettings`]);
  }
  ClickLeadSettings(e)
  {
    this.router.navigate([`/crmsettings/leadsettings`]);
  }


  ClickContactSettings(e)
  {
    this.router.navigate([`/crmsettings/contactssettings`]);
  }



}
