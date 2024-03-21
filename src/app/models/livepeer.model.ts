export class AccountInfo {
	public account: string;
    public ethBalance: number;
    public tokenBalance: number;
}

export class RoundInfo {
    public currentRound: number;
    public blockCount: number;
    public roundStatus: string;
}

export class BondInfo {
    public allowance: number;
    public delegatorStatus: string;
    public bondedAmount: number;
    public lastClaimedRound: number;
    public delegatedAddress: string;
    public unclaimedToken: number;
    public unclaimedFees: number;
}

export class TranscoderInfo {
    public transcoder: string;
    public feeShare: string;
    public rewardCut: string;
    public totalStake: string;
}