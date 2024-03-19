import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RentrollmanagementComponent } from './rentrollmanagement.component';

describe('RentrollmanagementComponent', () => {
  let component: RentrollmanagementComponent;
  let fixture: ComponentFixture<RentrollmanagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RentrollmanagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RentrollmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
