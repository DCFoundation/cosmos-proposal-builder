type BeansPerUnit = {
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

type PowerFlagFee = {
  power_flag: "SMART_WALLET";
  fee: {
    denom: "ubld";
    amount: string;
  }[];
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
