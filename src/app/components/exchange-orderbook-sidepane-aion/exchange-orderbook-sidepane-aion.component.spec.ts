import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderbookSidepaneAionComponent } from './exchange-orderbook-sidepane-aion.component';

describe('ExchangeOrderbookSidepaneAionComponent', () => {
  let component: ExchangeOrderbookSidepaneAionComponent;
  let fixture: ComponentFixture<ExchangeOrderbookSidepaneAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderbookSidepaneAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderbookSidepaneAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
