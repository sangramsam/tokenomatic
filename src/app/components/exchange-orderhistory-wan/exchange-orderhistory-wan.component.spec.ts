import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOrderhistoryWanComponent } from './exchange-orderhistory-wan.component';

describe('ExchangeOrderhistoryWanComponent', () => {
  let component: ExchangeOrderhistoryWanComponent;
  let fixture: ComponentFixture<ExchangeOrderhistoryWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOrderhistoryWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOrderhistoryWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
