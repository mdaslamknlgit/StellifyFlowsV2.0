import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReturnedNotesComponent } from './goods-returned-notes.component';

describe('GoodsReturnedNotesComponent', () => {
  let component: GoodsReturnedNotesComponent;
  let fixture: ComponentFixture<GoodsReturnedNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoodsReturnedNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodsReturnedNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
