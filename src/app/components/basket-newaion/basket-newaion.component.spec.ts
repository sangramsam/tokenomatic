import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketNewaionComponent } from './basket-newaion.component';

describe('BasketNewaionComponent', () => {
  let component: BasketNewaionComponent;
  let fixture: ComponentFixture<BasketNewaionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketNewaionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketNewaionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
