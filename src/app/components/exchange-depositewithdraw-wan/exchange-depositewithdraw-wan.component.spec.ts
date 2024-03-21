import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeDepositewithdrawWanComponent } from './exchange-depositewithdraw-wan.component';

describe('ExchangeDepositewithdrawWanComponent', () => {
  let component: ExchangeDepositewithdrawWanComponent;
  let fixture: ComponentFixture<ExchangeDepositewithdrawWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeDepositewithdrawWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeDepositewithdrawWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
