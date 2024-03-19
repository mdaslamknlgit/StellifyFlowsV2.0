import { Component, Input, OnInit } from '@angular/core';
import { environment } from './../../../../environments/environment';
import { Attachments } from '../../models/shared.model';
import { ValidateFileType } from '../../shared';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  @Input() Attachments: Attachments[] = [];
  apiEndPoint: string;
  uploadedFiles: Array<File> = [];
  @Input() IsViewMode: boolean;
  constructor() {this.apiEndPoint = environment.apiEndpoint; }
  ngOnInit() {
    
  }
  onFileUploadChange(event: any) {
    let files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateFileType(fileItem.name)) {
        this.uploadedFiles.push(fileItem);
      }
      else {
        event.preventDefault();
        break;
      }
    }
  }
  onFileClose(fileIndex: number) {
    this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
  }
}
