import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeDepositewithdrawAionComponent } from './exchange-depositewithdraw-aion.component';

describe('ExchangeDepositewithdrawAionComponent', () => {
  let component: ExchangeDepositewithdrawAionComponent;
  let fixture: ComponentFixture<ExchangeDepositewithdrawAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeDepositewithdrawAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeDepositewithdrawAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
