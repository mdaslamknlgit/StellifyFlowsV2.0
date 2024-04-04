import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-leadsearch',
  templateUrl: './leadsearch.component.html',
  styleUrls: ['./leadsearch.component.css']
})
export class LeadsearchComponent implements OnInit {
  @Input() public LeadSearch;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    console.log(this.LeadSearch);
  }
  passBack() {
    this.passEntry.emit(this.LeadSearch);
    this.activeModal.close(this.LeadSearch);
  }
}
