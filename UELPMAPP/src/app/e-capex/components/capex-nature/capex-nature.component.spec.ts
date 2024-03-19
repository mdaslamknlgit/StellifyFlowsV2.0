import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapexNatureComponent } from './capex-nature.component';

describe('CapexNatureComponent', () => {
  let component: CapexNatureComponent;
  let fixture: ComponentFixture<CapexNatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapexNatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapexNatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
