import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccrualManagementComponent } from './accrual-management.component';

describe('AccrualManagementComponent', () => {
  let component: AccrualManagementComponent;
  let fixture: ComponentFixture<AccrualManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccrualManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccrualManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
