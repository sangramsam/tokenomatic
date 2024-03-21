import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketOrderWanComponent } from './basket-order-wan.component';

describe('BasketOrderWanComponent', () => {
  let component: BasketOrderWanComponent;
  let fixture: ComponentFixture<BasketOrderWanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketOrderWanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketOrderWanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
