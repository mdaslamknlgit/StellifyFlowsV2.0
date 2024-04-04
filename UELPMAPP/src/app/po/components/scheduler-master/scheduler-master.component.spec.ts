import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerMasterComponent } from './scheduler-master.component';

describe('SchedulerMasterComponent', () => {
  let component: SchedulerMasterComponent;
  let fixture: ComponentFixture<SchedulerMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
