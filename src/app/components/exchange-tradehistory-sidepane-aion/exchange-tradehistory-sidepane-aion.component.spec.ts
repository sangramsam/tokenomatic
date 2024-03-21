import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeTradehistorySidepaneAionComponent } from './exchange-tradehistory-sidepane-aion.component';

describe('ExchangeTradehistorySidepaneAionComponent', () => {
  let component: ExchangeTradehistorySidepaneAionComponent;
  let fixture: ComponentFixture<ExchangeTradehistorySidepaneAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeTradehistorySidepaneAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeTradehistorySidepaneAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
