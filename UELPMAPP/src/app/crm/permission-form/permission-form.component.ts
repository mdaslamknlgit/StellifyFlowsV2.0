import { Component } from '@angular/core';

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-permission-form',
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.css']
})
export class PermissionFormComponent {
  permissions: Permission[] = [
    { read: false, write: false, delete: false },
    { read: false, write: false, delete: false },
    { read: false, write: false, delete: false },
    { read: false, write: false, delete: false }
  ];

  handleDeleteChange(row: number) {
    this.permissions[row].read = this.permissions[row].write = this.permissions[row].delete;
  }

  handleReadChange(row: number) {
    this.permissions[row].delete = false;
  }

  handleWriteChange(row: number) {
    this.permissions[row].delete = false;
  }

  handleSubmit() {
    // Add API call to send this.permissions to the server
    console.log(this.permissions);
  }
}
