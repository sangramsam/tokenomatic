import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderhistoryAionComponent } from './exchange-orderhistory-aion.component';

describe('ExchangeOrderhistoryAionComponent', () => {
  let component: ExchangeOrderhistoryAionComponent;
  let fixture: ComponentFixture<ExchangeOrderhistoryAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderhistoryAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderhistoryAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
