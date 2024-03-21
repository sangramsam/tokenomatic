import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderbookSidepaneWanComponent } from './exchange-orderbook-sidepane-wan.component';

describe('ExchangeOrderbookSidepaneWanComponent', () => {
  let component: ExchangeOrderbookSidepaneWanComponent;
  let fixture: ComponentFixture<ExchangeOrderbookSidepaneWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderbookSidepaneWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderbookSidepaneWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
