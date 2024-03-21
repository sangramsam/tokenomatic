import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTradehistorySidepaneWanComponent } from './exchange-tradehistory-sidepane-wan.component';

describe('ExchangeTradehistorySidepaneWanComponent', () => {
  let component: ExchangeTradehistorySidepaneWanComponent;
  let fixture: ComponentFixture<ExchangeTradehistorySidepaneWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeTradehistorySidepaneWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeTradehistorySidepaneWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
