export class Constants {
  public static ethBasketUrl: string;
  // public static ethBasketUrl: string = "http://localhost:8008";
  // ETH START
  public static TokenVault: string;
  public static TokenHistoryUrl: string;
  public static ServiceURL: string;
  public static CryptoCompareUrl: string;
  public static WandxCompareUrl: string;
  public static ThemedBasketRequest: string;
  //public static BashketURL: string = 'https://18.217.72.249:3443/api/portfolio/findPortfolio';
  public static BashketURL: string;
  public static TxAppnetURL: string;
  public static AddressAppnetURL: string;
  public static EthTokenDetailURL: string;
  public static ApiManagementSubscriptionKey: string;
  public static AllowedNetwork: any;
  public static WandxExchangeFeeRate: number;
  public static EthExchangeFeeRate: number;
  public static OtherExchageFeeRate: number;
  public static EtherTokenId: number;
  public static EtherTokenAddress: string;
  public static WandxTokenId: number;
  public static WandxTokenAddress: string;
  public static WandxTokenDecimals: number;
  public static OrderBookContractAddress: string;
  public static CretaeContractAddress: string;
  public static protoStorageAddress: string;
  public static TrasfersProxyAddress: string;
  public static BlockExpirationWindow: number;
  public static Chainid: number;
  public static tezosurl: string = "https://mytezosbaker.com/";
  // ETH END

  //aion check start
  public static OrderBookContractAddressAION: string; // ='0xa015BB803706FD50e04bbE52651baBA11667fE9B1fa91cCf79f70DD61f40c716'
  public static TrasfersProxyaionAddress: string; //='0xa0dB3Aec6247C6Af0d196677547A75Afa834cDa6145C9F097e79a917eAc02980';
  public static EtherTokenaionAddress: string; //= '0xa0a4091a7e638248DbE0130Cfc30c131548229Ce1b4C316B254c2460d4287843';
  public static VBPExchageAddress: string; //='0xA084760351b84486BC242B7d37c7f5b98dA4BfF6F8105cADc373b2CCDF789056'

  public static ServiceURLAION: string; //= 'http://ec2-3-16-169-57.us-east-2.compute.amazonaws.com:8080/api/'; //aion oreder book api
  public static AionbasketURL: string; //= 'http://52.15.173.92:4000/api/portfolio/findPortfolio';
  public static GNTTokenaddress: string; //='0xA045B62E942528F6237D100a4A61fc605F87E9c6dcc5A444aEC6A3Dd4303af5a'
  public static ZRXTokenaddress: string; //='0xA062f3aAF84eBc32084f7543A6c13f9553948868bC742dd47A13789D9d196975'
  public static QTUMTokenaddress: string; // ='0xa0dE5F29288E2D98BbAc5b4B42656efC61BdD158CA4BcBb35F70D7d3e90419F9'
  public static sandTokenaddress: string; // ='0xA050643dF89C272B6e9E46cba62226E24b422FA2A9B1C725c65e60644e332Fe4'
  public static powrTokenAddress: string; // ='0xa0ade465e3a26c991659b832d7256EB0FBb695C90e71c55A85652D9814f4408b'
  public static wandTokenAddress: string; // = '0xa022abF9Eafa13841Df61Ff2bD5cABCE68f5AbdBE623128828267C0Cc6451CDb'
  public static WandxTokenAddressAION: string; //= '0xa022abF9Eafa13841Df61Ff2bD5cABCE68f5AbdBE623128828267C0Cc6451CDb'
  public static providerURL: string;
  //aioncheck end

  // Neo Start
  public static contractScriptHash: string =
    "4b6dc098507569b853267a881faaefe15e84c852";
  public static PRIVATENET_RPC_URL: string = "http://139.59.67.102:30333";
  public static PRIVATENET_URL: string =
    "http://139.59.67.102:4000/api/main_net";
  public static NEO_TESTNET_RPC_URL: string = "https://neotnrpc.wandx.co:8443";
  public static TESTNET_URL: string = "TestNet";
  //public static NEOSCAN_URL_ASS: string = 'https://neoscan-testnet.io/address/';
  public static Script: number = 32;
  //Aion

  public static TokenAbiAION: any = [
    {
      constant: false,
      inputs: [{ name: "_amount", type: "uint128" }],
      name: "withdraw",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "withdrawTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "enabled",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_addedValue", type: "uint128" }
      ],
      name: "increaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "safetyWallet",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "transferFrom",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_subtractedValue", type: "uint128" }
      ],
      name: "decreaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "moveToSafetyWallet",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_disableTx", type: "bool" }],
      name: "blockTx",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "remaining", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "beneficiary", type: "address" }],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: "_amount", type: "uint128" }],
      name: "Issuance",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: "_amount", type: "uint128" }],
      name: "Destruction",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "owner", type: "address" },
        { indexed: true, name: "spender", type: "address" },
        { indexed: false, name: "value", type: "uint128" }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        { indexed: false, name: "value", type: "uint128" }
      ],
      name: "Transfer",
      type: "event"
    }
  ];
  public static OrderbookContractAbiAION: any = [
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "withdrawTo",
      type: "function",
      signature: "0x07802a89"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "approver",
      type: "function",
      signature: "0x141a8dd8"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: false,
      payable: false,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        { name: "_volumes", type: "uint128[6]" },
        { name: "_numBlocksExpires", type: "uint128" },
        { name: "_orderType", type: "uint128" },
        { name: "_orderHash", type: "bytes32" },
        { name: "_publickey", type: "bytes32[3]" }
      ],
      name: "fillOrder",
      type: "function",
      signature: "0x1969ea90"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        { name: "_totalOrderVolume", type: "uint128" },
        { name: "_feeToken", type: "address" },
        { name: "_orderValue", type: "uint128" }
      ],
      name: "cancelOrder",
      type: "function",
      signature: "0x19cf9991"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "addAuthorizedAddress",
      type: "function",
      signature: "0x42f1181e"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "etherRefAddress",
      type: "function",
      signature: "0x43f6e4b0"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "uint128" }],
      name: "listTokens",
      type: "function",
      signature: "0x592c7db3"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "safetyWallet",
      type: "function",
      signature: "0x607b9f97"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        { name: "_totalOrderVolume", type: "uint128" }
      ],
      name: "orderAvailability",
      type: "function",
      signature: "0x65b4408d"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "dataStore",
      type: "function",
      signature: "0x660d0d67"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "removeAuthorizedAddress",
      type: "function",
      signature: "0x70712939"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "balanceOf",
      type: "function",
      signature: "0x70a08231"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "baseTokenAddress",
      type: "function",
      signature: "0x7cb374bd"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "owner",
      type: "function",
      signature: "0x8da5cb5b"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_tradeActive", type: "bool" },
        { name: "_dataStore", type: "address" },
        { name: "_isLocked", type: "bool" }
      ],
      name: "changeTraderConfig",
      type: "function",
      signature: "0x8e91ff95"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_value", type: "uint128" },
        { name: "_feeToken", type: "address" }
      ],
      name: "calcTradeFee",
      type: "function",
      signature: "0x9c678c55"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_baseToken", type: "address" },
        { name: "_ether", type: "address" },
        { name: "_baseTokenFee", type: "uint128" },
        { name: "_etherFee", type: "uint128" },
        { name: "_normalTokenFee", type: "uint128" }
      ],
      name: "updateFeeCalcConfig",
      type: "function",
      signature: "0x9e77f568"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" }
      ],
      name: "fundDeposits",
      type: "function",
      signature: "0x9f26d0ad"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "isLocked",
      type: "function",
      signature: "0xa4e2d634"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [{ name: "_newOwner", type: "address" }],
      name: "changeOwner",
      type: "function",
      signature: "0xa6f9dae1"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "address" }],
      name: "authorized",
      type: "function",
      signature: "0xb9181611"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [],
      name: "moveToSafetyWallet",
      type: "function",
      signature: "0xb9b1c90c"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "isTradingActive",
      type: "function",
      signature: "0xc53d4d53"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [{ name: "_newApprover", type: "address" }],
      name: "changeApprover",
      type: "function",
      signature: "0xc6c599c1"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "uint128" }],
      name: "exFees",
      type: "function",
      signature: "0xcdf7edf7"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "withdrawTokenTo",
      type: "function",
      signature: "0xe39a1a98"
    },
    {
      outputs: [],
      constant: false,
      payable: true,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "deposit",
      type: "function",
      signature: "0xf340fa01"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "balanceOfToken",
      type: "function",
      signature: "0xf59e38b7"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" }
      ],
      name: "oredrAlreadyExists",
      type: "function",
      signature: "0xf8da6358"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "depositTokens",
      type: "function",
      signature: "0xfc2dbd78"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        { name: "_totalOrderVolume", type: "uint128" }
      ],
      name: "isOrderClosedOrFulfilled",
      type: "function",
      signature: "0xfe05680e"
    },
    {
      outputs: [],
      payable: false,
      inputs: [
        { name: "_newApprover", type: "address" },
        { name: "_newWallet", type: "address" },
        { name: "_dataStore", type: "address" }
      ],
      name: "",
      type: "constructor"
    },
    { outputs: [], payable: true, inputs: [], name: "", type: "fallback" },
    {
      outputs: [],
      inputs: [{ indexed: false, name: "val", type: "uint128" }],
      name: "succ",
      anonymous: false,
      type: "event",
      signature:
        "0x7586f08a0c2ec39b1682ec80ded652a216df326e961769d5d58c280e88c46303"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "signer", type: "address" },
        { indexed: false, name: "isValidSignature", type: "bool" },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "SingatureValidated",
      anonymous: false,
      type: "event",
      signature:
        "0xc6e5737b5291059e73cf84ea7ef3bc9cc7c4647d417ae173b00594258b1c34ec"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        { indexed: false, name: "activityCode", type: "bytes32" },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "TradeActivity",
      anonymous: false,
      type: "event",
      signature:
        "0xf472b5b323d9c017220f7ef21e4349f29af6059cf091e94768b72dcd8f7a284a"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "creator", type: "address" },
        { indexed: false, name: "orderHash", type: "bytes32" },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderOps",
      anonymous: false,
      type: "event",
      signature:
        "0x055b768e9ec537c74b758aeea00a4a32cdde56a3b3b838411e1405a265f487d1"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        { indexed: false, name: "seller", type: "address" },
        { indexed: false, name: "buyer", type: "address" },
        { indexed: false, name: "orderHash", type: "bytes32" },
        { indexed: false, name: "activityCode", type: "bytes32" },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "OrderFills",
      anonymous: false,
      type: "event",
      signature:
        "0x40526f2bf409e29df5e6f0b28485162d3e53aeacfd7e570a49874cf5128b1732"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "orderHash", type: "bytes32" },
        { indexed: false, name: "expiryBlockNumber", type: "uint128" },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderExpired",
      anonymous: false,
      type: "event",
      signature:
        "0xf2f00589e9b5be2e78d851af47cabb77bd7bd2768f1a7c27aefbc70c11ceb75b"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        { indexed: false, name: "_accHolder", type: "address" },
        { indexed: false, name: "token", type: "address" },
        { indexed: false, name: "amount", type: "uint128" },
        { indexed: false, name: "activityCode", type: "bytes32" },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "LockerActivity",
      anonymous: false,
      type: "event",
      signature:
        "0x207f794e7010a81846d1b81f2f6833ec4f1e8571adab26d2afbce5a420a9460a"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationAdded",
      anonymous: false,
      type: "event",
      signature:
        "0xab74326a695565fe84aac6539b84bcfe20204c92ad5979660401e38ae09d1b05"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationRemoved",
      anonymous: false,
      type: "event",
      signature:
        "0x0493a72733d38301bf0606a2ab082ea422f84e473e16b348c895864e93bc2af5"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "ApproverChanged",
      anonymous: false,
      type: "event",
      signature:
        "0xa53935b08c042831464f1b811e652d37e0db7f6b818e8bc174097b18e09cf9ae"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "OwnerChanged",
      anonymous: false,
      type: "event",
      signature:
        "0xb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c"
    }
  ];
  public static VBPABIaion: any = [
    {
      outputs: [],
      constant: false,
      payable: true,
      inputs: [],
      name: "getAion",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [],
      name: "publish",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "address" }],
      name: "ethmap",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "assetlength",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [],
      name: "liquidate",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "withdrawToken",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [{ name: "Eblockno", type: "uint128" }],
      name: "cancelPortfolio",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [{ name: "a", type: "uint128" }],
      name: "TotalAssets",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "depositTokens",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "bool" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "address" }],
      name: "assetStatus",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "uint128" }],
      name: "listAssets",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" }
      ],
      name: "fundDeposits",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" }
      ],
      name: "moveAssets",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: true,
      inputs: [],
      name: "buy",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_askValue", type: "uint128" },
        { name: "_expiresAfter", type: "uint128" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint128[]" },
        { name: "_portfolioName", type: "bytes32" }
      ],
      name: "updatePortfolio",
      type: "function"
    },
    {
      outputs: [],
      constant: false,
      payable: true,
      inputs: [
        { name: "receiver", type: "address" },
        { name: "value", type: "uint128" }
      ],
      name: "transferAion",
      type: "function"
    },
    {
      outputs: [
        { name: "maker", type: "address" },
        { name: "currentOwnerOrSeller", type: "address" },
        { name: "valueInEther", type: "uint128" },
        { name: "expiresAt", type: "uint128" },
        { name: "name", type: "bytes32" },
        { name: "status", type: "uint8" }
      ],
      constant: true,
      payable: false,
      inputs: [],
      name: "currentPortfolio",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [{ name: "", type: "address" }],
      name: "assets",
      type: "function"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "balanceOfToken",
      type: "function"
    },
    {
      outputs: [],
      payable: false,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint128[]" },
        { name: "_askValue", type: "uint128" },
        { name: "_expiryBlock", type: "uint128" },
        { name: "_portfolioName", type: "bytes32" }
      ],
      name: "",
      type: "constructor"
    },
    { outputs: [], payable: true, inputs: [], name: "", type: "fallback" },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        { indexed: false, name: "_amount", type: "uint128" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "PortfolioPublsihed",
      anonymous: false,
      type: "event"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "PortfolioEvents",
      anonymous: false,
      type: "event"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        { indexed: false, name: "_buyer", type: "address" },
        { indexed: false, name: "_amount", type: "uint128" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "PortfolioBought",
      anonymous: false,
      type: "event"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_depositor", type: "address" },
        { indexed: false, name: "_token", type: "address" },
        { indexed: false, name: "_amount", type: "uint128" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "Deposited",
      anonymous: false,
      type: "event"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_depositor", type: "address" },
        { indexed: false, name: "_token", type: "address" },
        { indexed: false, name: "_amount", type: "uint128" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "withdrawn",
      anonymous: false,
      type: "event"
    }
  ];
  public static VBPExchangeAbi: any = [
    {
      outputs: [{ name: "", type: "bytes32" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "version",
      type: "function",
      signature: "0x54fd4d50"
    },
    {
      outputs: [{ name: "", type: "uint128" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_askValue", type: "uint128" },
        { name: "_feeIndex", type: "uint128" }
      ],
      name: "getFee",
      type: "function",
      signature: "0x5e6dbcc5"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "ethertoken",
      type: "function",
      signature: "0x60dfab21"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint128[]" },
        { name: "_askValue", type: "uint128" },
        { name: "_expiryBlock", type: "uint128" },
        { name: "_name", type: "bytes32" }
      ],
      name: "createPortfolio",
      type: "function",
      signature: "0x68c5b193"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "transferProxy",
      type: "function",
      signature: "0x6e667db3"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "owner",
      type: "function",
      signature: "0x8da5cb5b"
    },
    {
      outputs: [],
      constant: false,
      payable: false,
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        { name: "_proxy", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "updateExchange",
      type: "function",
      signature: "0xa1c8d337"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "feeCalculator",
      type: "function",
      signature: "0xb00eb9fe"
    },
    {
      outputs: [{ name: "", type: "bytes32" }],
      constant: true,
      payable: false,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint128[]" },
        { name: "_askValue", type: "uint128" },
        { name: "_expiryBlock", type: "uint128" },
        { name: "_name", type: "bytes32" }
      ],
      name: "getPortfolioHash",
      type: "function",
      signature: "0xb4983564"
    },
    {
      outputs: [{ name: "", type: "address" }],
      constant: true,
      payable: false,
      inputs: [],
      name: "protostage",
      type: "function",
      signature: "0xcb58993b"
    },
    {
      outputs: [],
      payable: false,
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        { name: "_proxy", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "",
      type: "constructor"
    },
    {
      outputs: [],
      inputs: [
        { indexed: false, name: "_maker", type: "address" },
        { indexed: false, name: "_portfolio", type: "address" },
        { indexed: false, name: "_fee", type: "uint128" },
        { indexed: false, name: "_hash", type: "bytes32" },
        { indexed: false, name: "_message", type: "string" }
      ],
      name: "Exchange",
      anonymous: false,
      type: "event",
      signature:
        "0x53e51eafcc6cc48771db669cdabad660678aa9510059c72a6bb42930a9a6fe12"
    },
    {
      outputs: [],
      inputs: [{ indexed: false, name: "token", type: "address[]" }],
      name: "tokenAddress",
      anonymous: false,
      type: "event",
      signature:
        "0xd1055ec94b4a7a0d56691f9dbf655f3a683a28857c2c565ed0c3e910645b34c7"
    }
  ];
  public static AionExchangeFeeRate: number = 0.1;
  public static EtherTokenAbi: any = [
    {
      constant: false,
      inputs: [{ name: "_amount", type: "uint128" }],
      name: "withdraw",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "withdrawTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "enabled",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_addedValue", type: "uint128" }
      ],
      name: "increaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "safetyWallet",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "transferFrom",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_subtractedValue", type: "uint128" }
      ],
      name: "decreaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "moveToSafetyWallet",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_disableTx", type: "bool" }],
      name: "blockTx",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "remaining", type: "uint128" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "beneficiary", type: "address" }],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint128" }
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: "_amount", type: "uint128" }],
      name: "Issuance",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: "_amount", type: "uint128" }],
      name: "Destruction",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "owner", type: "address" },
        { indexed: true, name: "spender", type: "address" },
        { indexed: false, name: "value", type: "uint128" }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        { indexed: false, name: "value", type: "uint128" }
      ],
      name: "Transfer",
      type: "event"
    }
  ];
  public static TranferProxyAbi: any = [
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint128" }
      ],
      name: "transferFunds",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_wallet", type: "address" }
      ],
      name: "registerConfig",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "protostage",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_wallet", type: "address" }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    }
  ];

  //TODO change to 0xa1... and update in neo.service.ts
  public static NEO_ASSET_ID: string;
  public static NEO_GAS_ASSET_ID: string;
  public static WAND_NEO_ASSET_ID: string;
  public static NEO_SERVER_URL: string;
  public static NEO_SERVER_URL_STAKE: string;
  public static RPC_URL: string;
  public static NEOSCAN_URL: string;

  public static NEO_TESTNET_TOKENDETAIL =
    "https://neoscan-testnet.io/api/test_net/v1/get_balance/";
  // Neo End
  public static TokenAbi: any = [
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" }
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" }
      ],
      name: "transferFrom",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_subtractedValue", type: "uint256" }
      ],
      name: "decreaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" }
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_addedValue", type: "uint256" }
      ],
      name: "increaseApproval",
      outputs: [{ name: "success", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "remaining", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "owner", type: "address" },
        {
          indexed: true,
          name: "spender",
          type: "address"
        },
        { indexed: false, name: "value", type: "uint256" }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "from", type: "address" },
        { indexed: true, name: "to", type: "address" },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    }
  ];
  public static OrderbookContractAbi: any = [
    {
      constant: true,
      inputs: [],
      name: "dataStore",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        { name: "_volumes", type: "uint256[5]" },
        {
          name: "_orderMatchID",
          type: "bytes32"
        },
        { name: "_expiryBlockNumber", type: "uint256" }
      ],
      name: "orderMatchHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_sellToken", type: "address" },
        { name: "_buyToken", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_priceRate", type: "uint256" },
        { name: "_numBlocksExpires", type: "uint256" },
        {
          name: "_orderCreator",
          type: "address"
        },
        { name: "_orderType", type: "uint256" },
        { name: "_orderID", type: "bytes32" },
        { name: "_feeToken", type: "address" }
      ],
      name: "orderHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        }
      ],
      name: "orderAvailability",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" }
      ],
      name: "oredrAlreadyExists",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "isTradingActive",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        }
      ],
      name: "isOrderClosedOrFulfilled",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "isLocked",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" }
      ],
      name: "fundDeposits",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "balanceOfToken",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "baseTokenAddress",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "authorized",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "exFees",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "safetyWallet",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "etherRefAddress",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "approver",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_msgHash", type: "bytes32" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        {
          name: "s",
          type: "bytes32"
        }
      ],
      name: "ecrecovery",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "pure",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_signer", type: "address" },
        { name: "_orderHash", type: "bytes32" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" }
      ],
      name: "verifySignature",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "pure",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_value", type: "uint256" },
        { name: "_feeToken", type: "address" }
      ],
      name: "calcTradeFee",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "listTokens",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
      constant: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "addAuthorizedAddress",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "withdrawTokenTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "activityCode",
          type: "bytes32"
        },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "TradeActivity",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "signer", type: "address" },
        {
          indexed: false,
          name: "isValidSignature",
          type: "bool"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "SingatureValidated",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_sellToken", type: "address" },
        { name: "_buyToken", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_priceRate", type: "uint256" },
        { name: "_numBlocksExpires", type: "uint256" },
        {
          name: "_orderCreator",
          type: "address"
        },
        { name: "_orderType", type: "uint256" },
        { name: "_orderID", type: "bytes32" },
        { name: "_feeToken", type: "address" }
      ],
      name: "createOrder",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "OwnerChanged",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_newOwner", type: "address" }],
      name: "changeOwner",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "creator", type: "address" },
        {
          indexed: false,
          name: "orderHash",
          type: "bytes32"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderOps",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_feeToken", type: "address" },
        { name: "_orderValue", type: "uint256" }
      ],
      name: "cancelOrder",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "_newApprover", type: "address" },
        { name: "_newWallet", type: "address" },
        {
          name: "_dataStore",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      constant: false,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        {
          name: "_volumes",
          type: "uint256[6]"
        },
        { name: "_numBlocksExpires", type: "uint256" },
        { name: "_orderType", type: "uint256" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
        { name: "_orderID", type: "bytes32" }
      ],
      name: "fillOrder",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "seller",
          type: "address"
        },
        { indexed: false, name: "buyer", type: "address" },
        {
          indexed: false,
          name: "orderHash",
          type: "bytes32"
        },
        { indexed: false, name: "activityCode", type: "bytes32" },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "OrderFills",
      type: "event"
    },
    {
      constant: false,
      inputs: [],
      name: "moveToSafetyWallet",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "orderHash", type: "bytes32" },
        {
          indexed: false,
          name: "expiryBlockNumber",
          type: "uint256"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderExpired",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_baseToken", type: "address" },
        { name: "_ether", type: "address" },
        {
          name: "_baseTokenFee",
          type: "uint256"
        },
        { name: "_etherFee", type: "uint256" },
        { name: "_normalTokenFee", type: "uint256" }
      ],
      name: "updateFeeCalcConfig",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_tradeActive", type: "bool" },
        { name: "_dataStore", type: "address" },
        { name: "_isLocked", type: "bool" }
      ],
      name: "changeTraderConfig",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "ApproverChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationAdded",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationRemoved",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "_accHolder",
          type: "address"
        },
        { indexed: false, name: "token", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        {
          indexed: false,
          name: "activityCode",
          type: "bytes32"
        },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "LockerActivity",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_newApprover", type: "address" }],
      name: "changeApprover",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "withdrawTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "removeAuthorizedAddress",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        {
          name: "_volumes",
          type: "uint256[5]"
        },
        { name: "_expiryBlockNumber", type: "uint256" },
        { name: "_orderMatchID", type: "bytes32" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" }
      ],
      name: "fillOrderMatch",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "depositTokens",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    }
  ];
  public static createPortfolio: any = [
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_maker", type: "address" },
        {
          indexed: false,
          name: "_portfolio",
          type: "address"
        },
        { indexed: false, name: "_fee", type: "uint256" },
        { indexed: false, name: "_hash", type: "bytes32" },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "Exchange",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint256[]" },
        { name: "_askValue", type: "uint256" },
        { name: "_expiryBlock", type: "uint256" },
        { name: "_name", type: "bytes32" }
      ],
      name: "createPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        {
          name: "_proxy",
          type: "address"
        },
        { name: "_token", type: "address" }
      ],
      name: "updateExchange",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        {
          name: "_proxy",
          type: "address"
        },
        { name: "_token", type: "address" }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      constant: true,
      inputs: [],
      name: "ethertoken",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "feeCalculator",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_askValue", type: "uint256" },
        { name: "_feeIndex", type: "uint256" }
      ],
      name: "getFee",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        {
          name: "_volumes",
          type: "uint256[]"
        },
        { name: "_askValue", type: "uint256" },
        { name: "_expiryBlock", type: "uint256" },
        { name: "_name", type: "bytes32" }
      ],
      name: "getPortfolioHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "protostage",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "transferProxy",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "version",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    }
  ];
  public static VBPABI: any = [
    {
      constant: false,
      inputs: [],
      name: "publish",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "liquidate",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "depositTokens",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "assetStatus",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "withdrawToken",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" }
      ],
      name: "fundDeposits",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "buy",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "listAssets",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "cancelPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_askValue", type: "uint256" },
        { name: "_expiresAfter", type: "uint256" },
        {
          name: "_assets",
          type: "address[]"
        },
        { name: "_volumes", type: "uint256[]" },
        { name: "_portfolioName", type: "bytes32" }
      ],
      name: "updatePortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "currentPortfolio",
      outputs: [
        { name: "maker", type: "address" },
        { name: "currentOwnerOrSeller", type: "address" },
        {
          name: "valueInEther",
          type: "uint256"
        },
        { name: "expiresAt", type: "uint256" },
        { name: "name", type: "bytes32" },
        { name: "status", type: "uint8" }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "assets",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "balanceOfToken",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_assets", type: "address[]" },
        {
          name: "_volumes",
          type: "uint256[]"
        },
        { name: "_askValue", type: "uint256" },
        { name: "_expiryBlock", type: "uint256" },
        {
          name: "_portfolioName",
          type: "bytes32"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "PortfolioPublsihed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "PortfolioEvents",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_ownerOrSeller", type: "address" },
        {
          indexed: false,
          name: "_buyer",
          type: "address"
        },
        { indexed: false, name: "_amount", type: "uint256" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "PortfolioBought",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_depositor", type: "address" },
        {
          indexed: false,
          name: "_token",
          type: "address"
        },
        { indexed: false, name: "_amount", type: "uint256" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "Deposited",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_depositor", type: "address" },
        {
          indexed: false,
          name: "_token",
          type: "address"
        },
        { indexed: false, name: "_amount", type: "uint256" },
        { indexed: false, name: "_message", type: "bytes32" }
      ],
      name: "withdrawn",
      type: "event"
    }
  ];
  public static ProtoStorage: any = [
    {
      constant: false,
      inputs: [
        { name: "_newPortfolio", type: "address" },
        { name: "_maker", type: "address" }
      ],
      name: "addPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_publisher", type: "address" }],
      name: "registerPublisher",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_publisher", type: "address" }],
      name: "removePublisher",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "exchanges",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_publisher", type: "address" }],
      name: "IsExchangeAllowed",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "listExchange",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "listPortfolios",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "portfolios",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    }
  ];

  // themed basket for app(QA)
  public static Decentralised_exhchange_tokensApp: any = [
    "0x7354b4cea1cb8188a290b857132cd1214bd1cbbc",
    "0x2c94bba009e0133f5944fa25944edc44427db790"
  ];
  public static Decentralised_insurance_tokensApp: any = [
    "0x2c94bba009e0133f5944fa25944edc44427db790",
    "0xc8f0c992660666b64596c452fc0e7e6b07a448c2"
  ];
  public static Decentralised_identity_tokensApp: any = [
    "0x7354b4cea1cb8188a290b857132cd1214bd1cbbc",
    "0x2c94bba009e0133f5944fa25944edc44427db790",
    "0xc8f0c992660666b64596c452fc0e7e6b07a448c2"
  ];

  //themed basket for exchange(PROD)
  public static Decentralised_exhchange_tokens: any = [
    "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    "0x27f610bf36eca0939093343ac28b1534a721dbb4"
  ];

  public static Decentralised_insurance_tokens: any = [
    "0x52a7cb918c11a16958be40cba7e31e32a499a465",
    "0x1063ce524265d5a3a624f4914acd573dd89ce988"
  ];

  public static Decentralised_identity_tokens: any = [
    "0xB236E2477B8ed34B203B60e2b88884ee5b31a3c3"
  ];

  public static Low_market_cap_ERC20_tokens: any = [
    "0x52a7cb918c11a16958be40cba7e31e32a499a465",
    "0x27f610bf36eca0939093343ac28b1534a721dbb4",
    "0x2fa32a39fc1c399e0cc7b2935868f5165de7ce97"
  ];

  //wan
  //public static BashketURLWAN: string = 'http://localhost:3000/api/portfolio/findPortfolio';
  // public static BashketURLWAN: string = 'http://18.216.117.215:3000/api/portfolio/findPortfolio';
  // public static ServiceURLWAN: string = 'http://ec2-3-16-169-57.us-east-2.compute.amazonaws.com/api/';
  // public static TxAppnetURLWAN: string = 'http://47.104.61.26/block/trans/';
  // public static AddressAppnetURLWAN: string = 'http://47.104.61.26/block/addr/';
  // public static EthTokenDetailURLWAN: string = 'https://ropsten.etherscan.io/tokenholdings?a=';
  // public static ApiManagementSubscriptionKeyWAN: string = 'c807bf6f64494923862a780a305397a2';
  // public static AllowedNetworkWAN: any = '3';
  // public static WandxExchangeFeeRateWAN: number = 0.00025;
  // public static EthExchangeFeeRateWAN: number = 0.001;
  // public static OtherExchageFeeRateWAN: number = 0.0015;
  // public static EtherTokenIdWAN: number = 7;
  // public static EtherTokenAddressWAN: string = '0x9e8f2cae092ef2e991cf101329cba5148a81dce9';
  // public static WandxTokenIdWAN: number = 2;
  // public static WandxTokenAddressWAN: string = '0x9181bf7531faf4f4b488621f1e63dee09e268fe2';
  // public static WandxTokenDecimalsWAN =  18;
  // public static OrderBookContractAddressWAN: string = '0xc93b5f160cfad7199365188e21cfb921563990b3';
  // public static CretaeContractAddressWAN: string = '0x4437bfb7fa27cd72e7adc2000da35649fd376c01';
  // public static protoStorageAddressWAN: string = '0x11c60465f406b9b67a05a687866c52787f85d51f';
  // public static TrasfersProxyAddressWAN: string = '0xbfba523d7561b8e6676ede5066e4127854c7197e';
  // public static BlockExpirationWindowWAN = 52000;

  public static BashketURLWAN: string; //= 'http://35.239.13.60:3000/api/portfolio/findPortfolio';
  public static ServiceURLWAN: string; //='http://ec2-52-14-50-215.us-east-2.compute.amazonaws.com/api/'; //'http://ec2-3-16-169-57.us-east-2.compute.amazonaws.com/api/';
  public static TxAppnetURLWAN: string; //= 'https://www.wanscan.org/tx/';
  public static AddressAppnetURLWAN: string; //= 'https://www.wanscan.org/address/';
  public static EthTokenDetailURLWAN: string; //= 'https://ropsten.etherscan.io/tokenholdings?a=';
  public static ApiManagementSubscriptionKeyWAN: string; //= 'c807bf6f64494923862a780a305397a2';
  public static AllowedNetworkWAN: any; // = '3';
  public static WandxExchangeFeeRateWAN: number; // = 0.00025;
  public static EthExchangeFeeRateWAN: number; //= 0.001;
  public static OtherExchageFeeRateWAN: number; // = 0.0015;
  public static EtherTokenIdWAN: number; // = 7;
  public static EtherTokenAddressWAN: string; // = '0xdaa968fed3e255c093aa2730c726119cdc275d47';
  public static WandxTokenIdWAN: number; // = 2;
  public static WandxTokenAddressWAN: string; //= '0xb247198127ee20e4cd6fe4722b335025004d2b8b';
  public static WandxTokenDecimalsWAN: number; //=  18;
  public static OrderBookContractAddressWAN: string; // = '0x29fbdaf7786a75d0b82a25e69108b6361ae634e5';//'0xc93b5f160cfad7199365188e21cfb921563990b3';
  public static CretaeContractAddressWAN: string; //= '0x6d89657326c40d05948a200a369ae58b9491dd20';
  public static protoStorageAddressWAN: string; // = '0xf1e040ff72ddea8bc66fd9eaa25176d4b6213d5c';
  public static TrasfersProxyAddressWAN: string; //= '0x32b0620ae6b0ff5ed9f3504ca04581a4b6209cf7';
  public static BlockExpirationWindowWAN: number; // = 52000;
  public static providerwanURL;
  public static chainid: number;
  public static gaslimit: number;
  public static TokenAbiWAN: any = [
    {
      constant: true,
      inputs: [],
      name: "mintingFinished",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_from",
          type: "address"
        },
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "mint",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_subtractedValue",
          type: "uint256"
        }
      ],
      name: "decreaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "tokensMinted",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "finishMinting",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_addedValue",
          type: "uint256"
        }
      ],
      name: "increaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        },
        {
          name: "_spender",
          type: "address"
        }
      ],
      name: "allowance",
      outputs: [
        {
          name: "remaining",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "amount",
          type: "uint256"
        }
      ],
      name: "Mint",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [],
      name: "MintFinished",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    }
  ];

  public static OrderbookContractAbiWAN: any = [
    {
      constant: true,
      inputs: [],
      name: "dataStore",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        { name: "_volumes", type: "uint256[5]" },
        {
          name: "_orderMatchID",
          type: "bytes32"
        },
        { name: "_expiryBlockNumber", type: "uint256" }
      ],
      name: "orderMatchHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_sellToken", type: "address" },
        { name: "_buyToken", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_priceRate", type: "uint256" },
        { name: "_numBlocksExpires", type: "uint256" },
        {
          name: "_orderCreator",
          type: "address"
        },
        { name: "_orderType", type: "uint256" },
        { name: "_orderID", type: "bytes32" },
        { name: "_feeToken", type: "address" }
      ],
      name: "orderHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        }
      ],
      name: "orderAvailability",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" }
      ],
      name: "oredrAlreadyExists",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "isTradingActive",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        }
      ],
      name: "isOrderClosedOrFulfilled",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "isLocked",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" }
      ],
      name: "fundDeposits",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" }
      ],
      name: "balanceOfToken",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "baseTokenAddress",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "authorized",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "exFees",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "safetyWallet",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "etherRefAddress",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "approver",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_msgHash", type: "bytes32" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        {
          name: "s",
          type: "bytes32"
        }
      ],
      name: "ecrecovery",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "pure",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_signer", type: "address" },
        { name: "_orderHash", type: "bytes32" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" }
      ],
      name: "verifySignature",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "pure",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_value", type: "uint256" },
        { name: "_feeToken", type: "address" }
      ],
      name: "calcTradeFee",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [{ name: "", type: "uint256" }],
      name: "listTokens",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
      constant: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "addAuthorizedAddress",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "withdrawTokenTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "activityCode",
          type: "bytes32"
        },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "TradeActivity",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_depositor", type: "address" }],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "signer", type: "address" },
        {
          indexed: false,
          name: "isValidSignature",
          type: "bool"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "SingatureValidated",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_sellToken", type: "address" },
        { name: "_buyToken", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_priceRate", type: "uint256" },
        { name: "_numBlocksExpires", type: "uint256" },
        {
          name: "_orderCreator",
          type: "address"
        },
        { name: "_orderType", type: "uint256" },
        { name: "_orderID", type: "bytes32" },
        { name: "_feeToken", type: "address" }
      ],
      name: "createOrder",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "OwnerChanged",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_newOwner", type: "address" }],
      name: "changeOwner",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "creator", type: "address" },
        {
          indexed: false,
          name: "orderHash",
          type: "bytes32"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderOps",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_orderHash", type: "bytes32" },
        { name: "_orderCreator", type: "address" },
        {
          name: "_totalOrderVolume",
          type: "uint256"
        },
        { name: "_feeToken", type: "address" },
        { name: "_orderValue", type: "uint256" }
      ],
      name: "cancelOrder",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "_newApprover", type: "address" },
        { name: "_newWallet", type: "address" },
        {
          name: "_dataStore",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      constant: false,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        {
          name: "_volumes",
          type: "uint256[6]"
        },
        { name: "_numBlocksExpires", type: "uint256" },
        { name: "_orderType", type: "uint256" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
        { name: "_orderID", type: "bytes32" }
      ],
      name: "fillOrder",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "seller",
          type: "address"
        },
        { indexed: false, name: "buyer", type: "address" },
        {
          indexed: false,
          name: "orderHash",
          type: "bytes32"
        },
        { indexed: false, name: "activityCode", type: "bytes32" },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "OrderFills",
      type: "event"
    },
    {
      constant: false,
      inputs: [],
      name: "moveToSafetyWallet",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "orderHash", type: "bytes32" },
        {
          indexed: false,
          name: "expiryBlockNumber",
          type: "uint256"
        },
        { indexed: false, name: "activityCode", type: "bytes32" }
      ],
      name: "OrderExpired",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_baseToken", type: "address" },
        { name: "_ether", type: "address" },
        {
          name: "_baseTokenFee",
          type: "uint256"
        },
        { name: "_etherFee", type: "uint256" },
        { name: "_normalTokenFee", type: "uint256" }
      ],
      name: "updateFeeCalcConfig",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_tradeActive", type: "bool" },
        { name: "_dataStore", type: "address" },
        { name: "_isLocked", type: "bool" }
      ],
      name: "changeTraderConfig",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "oldApprover", type: "address" },
        { indexed: false, name: "newApprover", type: "address" }
      ],
      name: "ApproverChanged",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationAdded",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "target", type: "address" },
        { indexed: false, name: "caller", type: "address" }
      ],
      name: "AuthorizationRemoved",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "origin", type: "address" },
        {
          indexed: false,
          name: "_accHolder",
          type: "address"
        },
        { indexed: false, name: "token", type: "address" },
        { indexed: false, name: "amount", type: "uint256" },
        {
          indexed: false,
          name: "activityCode",
          type: "bytes32"
        },
        { indexed: false, name: "customMsg", type: "bytes32" }
      ],
      name: "LockerActivity",
      type: "event"
    },
    {
      constant: false,
      inputs: [{ name: "_newApprover", type: "address" }],
      name: "changeApprover",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "withdrawTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [{ name: "_newAddress", type: "address" }],
      name: "removeAuthorizedAddress",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_tokensAndAddresses", type: "address[6]" },
        {
          name: "_volumes",
          type: "uint256[5]"
        },
        { name: "_expiryBlockNumber", type: "uint256" },
        { name: "_orderMatchID", type: "bytes32" },
        {
          name: "v",
          type: "uint8"
        },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" }
      ],
      name: "fillOrderMatch",
      outputs: [{ name: "", type: "bool" }],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_depositor", type: "address" },
        { name: "_token", type: "address" },
        { name: "_amount", type: "uint256" }
      ],
      name: "depositTokens",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    }
  ];

  public static createPortfolioWAN: any = [
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "_maker", type: "address" },
        {
          indexed: false,
          name: "_portfolio",
          type: "address"
        },
        { indexed: false, name: "_fee", type: "uint256" },
        { indexed: false, name: "_hash", type: "bytes32" },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "Exchange",
      type: "event"
    },
    {
      constant: false,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        { name: "_volumes", type: "uint256[]" },
        { name: "_askValue", type: "uint256" },
        { name: "_expiryBlock", type: "uint256" },
        { name: "_name", type: "bytes32" }
      ],
      name: "createPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        {
          name: "_proxy",
          type: "address"
        },
        { name: "_token", type: "address" }
      ],
      name: "updateExchange",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "_storage", type: "address" },
        { name: "_calc", type: "address" },
        {
          name: "_proxy",
          type: "address"
        },
        { name: "_token", type: "address" }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      constant: true,
      inputs: [],
      name: "ethertoken",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "feeCalculator",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_askValue", type: "uint256" },
        { name: "_feeIndex", type: "uint256" }
      ],
      name: "getFee",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        { name: "_maker", type: "address" },
        { name: "_assets", type: "address[]" },
        {
          name: "_volumes",
          type: "uint256[]"
        },
        { name: "_askValue", type: "uint256" },
        { name: "_expiryBlock", type: "uint256" },
        { name: "_name", type: "bytes32" }
      ],
      name: "getPortfolioHash",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "protostage",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "transferProxy",
      outputs: [{ name: "", type: "address" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "version",
      outputs: [{ name: "", type: "bytes32" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    }
  ];

  public static VBPABIWAN: any = [
    {
      constant: false,
      inputs: [],
      name: "publish",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "liquidate",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_token",
          type: "address"
        },
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "depositTokens",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        }
      ],
      name: "assetStatus",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_token",
          type: "address"
        },
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "withdrawToken",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        },
        {
          name: "",
          type: "address"
        }
      ],
      name: "fundDeposits",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "buy",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      name: "listAssets",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "cancelPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_askValue",
          type: "uint256"
        },
        {
          name: "_expiresAfter",
          type: "uint256"
        },
        {
          name: "_assets",
          type: "address[]"
        },
        {
          name: "_volumes",
          type: "uint256[]"
        },
        {
          name: "_portfolioName",
          type: "bytes32"
        }
      ],
      name: "updatePortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "currentPortfolio",
      outputs: [
        {
          name: "maker",
          type: "address"
        },
        {
          name: "currentOwnerOrSeller",
          type: "address"
        },
        {
          name: "valueInEther",
          type: "uint256"
        },
        {
          name: "expiresAt",
          type: "uint256"
        },
        {
          name: "name",
          type: "bytes32"
        },
        {
          name: "status",
          type: "uint8"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        }
      ],
      name: "assets",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_depositor",
          type: "address"
        },
        {
          name: "_token",
          type: "address"
        }
      ],
      name: "balanceOfToken",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          name: "_owner",
          type: "address"
        },
        {
          name: "_assets",
          type: "address[]"
        },
        {
          name: "_volumes",
          type: "uint256[]"
        },
        {
          name: "_askValue",
          type: "uint256"
        },
        {
          name: "_expiryBlock",
          type: "uint256"
        },
        {
          name: "_portfolioName",
          type: "bytes32"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      payable: true,
      stateMutability: "payable",
      type: "fallback"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_ownerOrSeller",
          type: "address"
        },
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "PortfolioPublsihed",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_ownerOrSeller",
          type: "address"
        },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "PortfolioEvents",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_ownerOrSeller",
          type: "address"
        },
        {
          indexed: false,
          name: "_buyer",
          type: "address"
        },
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "PortfolioBought",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_depositor",
          type: "address"
        },
        {
          indexed: false,
          name: "_token",
          type: "address"
        },
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "Deposited",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_depositor",
          type: "address"
        },
        {
          indexed: false,
          name: "_token",
          type: "address"
        },
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        },
        {
          indexed: false,
          name: "_message",
          type: "bytes32"
        }
      ],
      name: "withdrawn",
      type: "event"
    }
  ];

  public static ProtoStorageWAN: any = [
    {
      constant: false,
      inputs: [
        {
          name: "_publisher",
          type: "address"
        }
      ],
      name: "registerPublisher",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_newPortfolio",
          type: "address"
        },
        {
          name: "_maker",
          type: "address"
        }
      ],
      name: "addPortfolio",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      name: "listExchange",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        }
      ],
      name: "exchanges",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address"
        }
      ],
      name: "portfolios",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      name: "listPortfolios",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_publisher",
          type: "address"
        }
      ],
      name: "removePublisher",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_publisher",
          type: "address"
        }
      ],
      name: "IsExchangeAllowed",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    }
  ];

  public static wxethWAN: any = [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "withdrawTo",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "enabled",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_from",
          type: "address"
        },
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "withdraw",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "safetyWallet",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_subtractedValue",
          type: "uint256"
        }
      ],
      name: "decreaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "moveToSafetyWallet",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_disableTx",
          type: "bool"
        }
      ],
      name: "blockTx",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_addedValue",
          type: "uint256"
        }
      ],
      name: "increaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        },
        {
          name: "_spender",
          type: "address"
        }
      ],
      name: "allowance",
      outputs: [
        {
          name: "remaining",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "beneficiary",
          type: "address"
        }
      ],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      payable: true,
      stateMutability: "payable",
      type: "fallback"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "Issuance",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "Destruction",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    }
  ];

  public static WandTokenAbiWAN: any = [
    {
      constant: true,
      inputs: [],
      name: "mintingFinished",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_from",
          type: "address"
        },
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [
        {
          name: "",
          type: "uint8"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_accounts",
          type: "address[]"
        },
        {
          name: "_tokens",
          type: "uint256[]"
        }
      ],
      name: "batchTransfers",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_amount",
          type: "uint256"
        }
      ],
      name: "mint",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_subtractedValue",
          type: "uint256"
        }
      ],
      name: "decreaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "tokensMinted",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [],
      name: "finishMinting",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_supply",
          type: "uint256"
        }
      ],
      name: "raiseInitialSupply",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [
        {
          name: "",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address"
        },
        {
          name: "_value",
          type: "uint256"
        }
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address"
        },
        {
          name: "_addedValue",
          type: "uint256"
        }
      ],
      name: "increaseApproval",
      outputs: [
        {
          name: "success",
          type: "bool"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address"
        },
        {
          name: "_spender",
          type: "address"
        }
      ],
      name: "allowance",
      outputs: [
        {
          name: "remaining",
          type: "uint256"
        }
      ],
      payable: false,
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        {
          name: "_owner",
          type: "address"
        }
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "purchaser",
          type: "address"
        },
        {
          indexed: true,
          name: "beneficiary",
          type: "address"
        },
        {
          indexed: false,
          name: "amount",
          type: "uint256"
        }
      ],
      name: "TokenPreSaleTransfer",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "amount",
          type: "uint256"
        }
      ],
      name: "Mint",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [],
      name: "MintFinished",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Approval",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ],
      name: "Transfer",
      type: "event"
    }
  ];
}
