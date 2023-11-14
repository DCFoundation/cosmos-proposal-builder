import type { Coin } from "./bank";

export type BeansPerUnit = {
  key:
    | "blockComputeLimit"
    | "feeUnit"
    | "inboundTx"
    | "message"
    | "messageByte"
    | "minFeeDebit"
    | "vatCreation"
    | "xsnapComputron"
    | "storageByte";
  beans: string; // string representation of a number
};

type FeeUnitPrice = {
  denom: "uist" | "ubld";
  amount: string;
};

export type PowerFlagFee = {
  power_flag: "SMART_WALLET";
  fee: Coin[];
};

type QueueMax = {
  key: "inbound";
  size: number;
};

export type SwingSetParams = {
  beans_per_unit: BeansPerUnit[];
  fee_unit_price: FeeUnitPrice[];
  bootstrap_vat_config: string;
  power_flag_fees: PowerFlagFee[];
  queue_max: QueueMax[];
};

export type SwingSetApiResponse = {
  params: SwingSetParams;
};
