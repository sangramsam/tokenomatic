import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboadAnouncementsComponent } from './dashboad-anouncements.component';

describe('DashboadAnouncementsComponent', () => {
  let component: DashboadAnouncementsComponent;
  let fixture: ComponentFixture<DashboadAnouncementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboadAnouncementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboadAnouncementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
