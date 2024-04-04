import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilitymanagementComponent } from './utilitymanagement.component';

describe('UtilitymanagementComponent', () => {
  let component: UtilitymanagementComponent;
  let fixture: ComponentFixture<UtilitymanagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilitymanagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilitymanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
