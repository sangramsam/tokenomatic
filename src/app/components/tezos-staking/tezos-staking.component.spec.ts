import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TezosStakingComponent } from './tezos-staking.component';

describe('TezosStakingComponent', () => {
  let component: TezosStakingComponent;
  let fixture: ComponentFixture<TezosStakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TezosStakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TezosStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
