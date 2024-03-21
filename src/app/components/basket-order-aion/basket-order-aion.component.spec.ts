import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketOrderAionComponent } from './basket-order-aion.component';

describe('BasketOrderAionComponent', () => {
  let component: BasketOrderAionComponent;
  let fixture: ComponentFixture<BasketOrderAionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketOrderAionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketOrderAionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
