export class buyToken{
    symbol: string;
    decimals: number;
    address: string;
    kyber_address: string;
    kyber_value: string;
    bancor_id: string;
    bancor_value: string;
    uniswap_exchange_address: string;
    uniswap_exchange_artifact: any;
    uniswap_value: string;
    relayer0x_details: any;
    relayer0x_value: string;
    better_exchange: string;
    trade_data: any;
}

export class sellToken{
    symbol: string;
    decimals: number;
    address: string;
    balance: number;
    value: number;
    kyber_address: string;
    bancor_id: string;
    uniswap_exchange_address: string;
    uniswap_exchange_artifact: any;
}