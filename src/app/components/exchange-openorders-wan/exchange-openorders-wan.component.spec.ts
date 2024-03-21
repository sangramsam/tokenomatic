import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOpenordersWanComponent } from './exchange-openorders-wan.component';

describe('ExchangeOpenordersWanComponent', () => {
  let component: ExchangeOpenordersWanComponent;
  let fixture: ComponentFixture<ExchangeOpenordersWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOpenordersWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOpenordersWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
