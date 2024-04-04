import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.css']
})
export class ReleaseNotesComponent implements OnInit {
  releaseNotes: ReleaseNotes[] = [];
  constructor() { }

  ngOnInit() {
    this.releaseNotes.push(
      {
        Changes: ['Supplier Delete Issue fixed'],
        ReleasedDate: '09-07-2020',
        Version: '1.77'
      },
      {
        Changes: ['Workflow Issue fixed','Email Notification Issue fixed'],
        ReleasedDate: '22-06-2020',
        Version: '1.76'
      },
      {
        Changes: ['Supplier Invoice Workflow Issue fixed'],
        ReleasedDate: '22-06-2020',
        Version: '1.75'
      },
      {
        Changes: ['Account codes delete functionality', 'Attachment download Issue','Release notes screen'],
        ReleasedDate: '17-06-2020',
        Version: '1.74'
      }
    );
  }
}

export class ReleaseNotes {
  Version: string;
  ReleasedDate: string;
  Changes: string[];
}