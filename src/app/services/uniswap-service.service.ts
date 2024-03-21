import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { SavedWalletsService } from './saved-wallets.service';
import { CustomWalletService } from './custom-wallet.service';
import { FactoryArtifact } from "../artifacts/factory";
import { erc20Artifact } from '../artifacts/erc20';

@Injectable()
export class UniswapServiceService {

  web3Instance: any;
  deployedFactoryContract: any;

  private selectedWallet : any ;
  private savedWalletsServiceSub : any;
  private account: string;

  constructor(
    private web3: Web3Service,
    private savedWalletsService: SavedWalletsService,
    private wallet: CustomWalletService
  ) {
    this.initialize();
  }

  initialize() {
    this.web3.initialize();
    this.savedWalletsServiceSub = this.savedWalletsService.serviceStatus$.subscribe((d) => {
      if (d == 'currentWalletChanged') {
        this.selectedWallet = this.savedWalletsService.getCurrentWallet();
        this.wallet.setWallet(this.selectedWallet);
        this.web3.setDefaultAccount();
        this.account = [this.selectedWallet.address][0];
      }
    });

    this.web3Instance = this.web3.getWeb3();
    this.deployedFactoryContract = this.web3Instance.eth.contract(FactoryArtifact.contractAbi).at(FactoryArtifact.contractAddress);
  }


  // Get the address of the exchange for a given token
  public getExchangeAddress(token_address: string) {
    return new Promise(resolve => {
      this.deployedFactoryContract.getExchange(token_address, (err, res) => {
        if(err !== null)
          resolve('0x0000000000000000000000000000000000000000');
        else
          resolve(res);
      });
    });
  }

  // Get respective ERC20 Tokens received on selling ETH
  public ethToTokenValue(buy_exchange_artifact: any, sell_value: string) {
    return new Promise(resolve => {
      console.log('ethToTokenValue',buy_exchange_artifact.contractAddress)
      let deployedExchangeContract = this.web3Instance.eth.contract(buy_exchange_artifact.contractAbi).at(buy_exchange_artifact.contractAddress);
      deployedExchangeContract.getEthToTokenInputPrice(sell_value, (err, res) => {
        if(err !== null)
          resolve('0');
        else
          resolve(res);
      });
    });
  }

  // Get ETH received on selling respective ERC20 Token
  public tokenToEthValue(sell_exchange_artifact: any, sell_value: string) {
    return new Promise(resolve => {
      let deployedExchangeContract = this.web3Instance.eth.contract(sell_exchange_artifact.contractAbi).at(sell_exchange_artifact.contractAddress);
      deployedExchangeContract.getTokenToEthInputPrice(sell_value, (err, res) => {
        console.log('price',res);
        
        if(err != null)
          resolve('0');
        else
          resolve(res);
      });
    });
  }

  // Get respective ERC20 Token received on selling another ERC20 Token
  public tokenToTokenValues(sell_exchange_artifact: any, sell_value: string, buy_exchange_artifact: any) {
    return new Promise(resolve => {
      var foo = this;
      foo.tokenToEthValue(sell_exchange_artifact, sell_value).then(function(res) {
        if(res === '0')
          resolve(res);
        let eth_bought = '0x' + Number(res).toString(16);
        foo.ethToTokenValue(buy_exchange_artifact, eth_bought).then(function(res) {
          resolve(res);
        });
      });
    });
  }

  // Confirm ETH to ERC20 Token swap transaction
  public confirmEthToToken(buy_value: string, sell_value: string, buy_exchange_artifact: any) {
    return new Promise(resolve => {
      let deployedExchangeContract = this.web3Instance.eth.contract(buy_exchange_artifact.contractAbi).at(buy_exchange_artifact.contractAddress);
      let time = Date.now() + 300000;
      const data = deployedExchangeContract.ethToTokenSwapInput.getData(buy_value, time);
      var transaction = { from: this.account, to: buy_exchange_artifact.contractAddress, data: data, value: sell_value, gasPrice: '0x' + (22 * Math.pow(10, 9)).toString(16), gasLimit: 200000 }
      resolve(transaction);
    });
  }

  // Confirm ERC20 to ETH swap transaction
  public confirmTokenToEth(buy_value: string, sell_value: string, sell_exchange_artifact: any) {
    return new Promise(resolve => {
      let deployedExchangeContract = this.web3Instance.eth.contract(sell_exchange_artifact.contractAbi).at(sell_exchange_artifact.contractAddress);
      let time = Date.now() + 300000;
      const data = deployedExchangeContract.tokenToEthSwapInput.getData(sell_value, buy_value, time);
      var transaction = { from: this.account, to: sell_exchange_artifact.contractAddress, data: data, value: 0, gasPrice: '0x' + (22 * Math.pow(10, 9)).toString(16), gasLimit: 200000 }
      resolve(transaction);
    });
  }

  // Confirm ERC20 to ERC20 token swap transaction
  public confirmTokenToToken(buy_value: string, sell_value: string, sell_exchange_artifact: any, buy_address: string) {
    return new Promise(resolve => {
      var foo = this;
      let deployedExchangeContract = this.web3Instance.eth.contract(sell_exchange_artifact.contractAbi).at(sell_exchange_artifact.contractAddress);
      let time = Date.now() + 300000;
      this.tokenToEthValue(sell_exchange_artifact, sell_value).then(function(res) {
        let min_eth_bought = Math.floor(Number(res) * 0.97);
        const data = deployedExchangeContract.tokenToTokenSwapInput.getData(sell_value, buy_value, min_eth_bought, time, buy_address);
        var transaction = { from: foo.account, to: sell_exchange_artifact.contractAddress, data: data, value: 0, gasPrice: '0x' + (22 * Math.pow(10, 9)).toString(16), gasLimit: 200000 }
        resolve(transaction);
      });
    });
  }

  // Approve the respective exchange to spend an ERC20 token on account's behalf
  public getApproval(token_address: string, exchange_address: string, sell_value: string) {
    return new Promise(async resolve => {
      let deployedTokenContract = this.web3Instance.eth.contract(erc20Artifact.contractAbi).at(token_address);
      var foo = this;
      deployedTokenContract.allowance(this.account, exchange_address, (err, res) => {
        if(err !== null) {
          resolve(false);
          return;
        }
        let allowance = '0x' + res.toString(16);
        if(allowance >= sell_value) {
          resolve(true);
          return;
        }
        const data = deployedTokenContract.approve.getData(exchange_address, sell_value);
        var transaction = { from: foo.account, to: token_address, data: data, value: 0, gasPrice: '0x' + (22 * Math.pow(10, 9)).toString(16), gasLimit: 200000 }
        resolve(transaction);
      });     
    });
  }
}
