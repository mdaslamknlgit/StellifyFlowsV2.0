import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crmsettings-layout',
  templateUrl: './crmsettings-layout.component.html',
  styleUrls: ['./crmsettings-layout.component.css']
})
export class CrmsettingsLayoutComponent implements OnInit {
  showMenu: boolean = false;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }
  onMenuClick(eventArgs) {
    this.showMenu = !this.showMenu;
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
