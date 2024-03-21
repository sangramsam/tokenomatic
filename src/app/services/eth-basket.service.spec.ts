import { TestBed, inject } from '@angular/core/testing';

import { EthBasketService } from './eth-basket.service';

describe('EthBasketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EthBasketService]
    });
  });

  it('should be created', inject([EthBasketService], (service: EthBasketService) => {
    expect(service).toBeTruthy();
  }));
});
