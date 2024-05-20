// // import { Any } from "cosmjs-types/google/protobuf/any";
// // import { BinaryWriter, BinaryReader } from "cosmjs-types/binary";

// // export const MsgExecLegacyContent = {
// //   encode(message: MsgExecLegacyContentSDKType, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {

// //     if (message.content !== undefined) {
// //       Any.encode(message.content, writer.uint32(10).fork()).ldelim();
// //     }
// //     if (message.authority !== "") {
// //       writer.uint32(18).string(message.authority);
// //     }
// //     return writer;
// //   },
// //   decode(input: BinaryReader | Uint8Array, length?: number): MsgExecLegacyContentSDKType {
// //     const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
// //     let end = length === undefined ? reader.len : reader.pos + length;
// //     const message = { ...baseMsgExecLegacyContentSDKType } as MsgExecLegacyContentSDKType;
// //     while (reader.pos < end) {
// //       const tag = reader.uint32();
// //       switch (tag >>> 3) {
// //         case 1:
// //           reader.uint32();
// //           message.content = Any.decode(reader, reader.uint32());
// //           break;
// //         case 2:
// //           message.authority = reader.string();
// //           break;
// //         default:
// //           reader.skipType(tag & 7);
// //           break;
// //       }
// //     }
// //     return message;
// //   },
// //   fromJSON(object: any): MsgExecLegacyContentSDKType {
// //     const message = { ...baseMsgExecLegacyContentSDKType } as MsgExecLegacyContentSDKType;
// //     if (object.content !== undefined && object.content !== null) {
// //       message.content = Any.fromJSON(object.content);
// //     } else {
// //       message.content = undefined;
// //     }
// //     if (object.authority !== undefined && object.authority !== null) {
// //       message.authority = String(object.authority);
// //     } else {
// //       message.authority = "";
// //     }
// //     return message;
// //   },
// //   toJSON(message: MsgExecLegacyContentSDKType): unknown {
// //     const obj: any = {};
// //     message.content !== undefined &&
// //       (obj.content = message.content ? Any.toJSON(message.content) : undefined);
// //     message.authority !== undefined && (obj.authority = message.authority);
// //     return obj;
// //   },
// //   fromPartial(object: any): MsgExecLegacyContentSDKType {
// //     const message = { ...baseMsgExecLegacyContentSDKType } as MsgExecLegacyContentSDKType;
// //     if (object.content !== undefined && object.content !== null) {
// //       message.content = Any.fromPartial(object.content);
// //     } else {
// //       message.content = undefined;
// //     }
// //     if (object.authority !== undefined && object.authority !== null) {
// //       message.authority = String(object.authority);
// //     } else {
// //       message.authority = "";
// //     }
// //     return message;
// //   },

// //   create(value?: Partial<MsgExecLegacyContentSDKType>): MsgExecLegacyContentSDKType {
// //     const message = { ...baseMsgExecLegacyContentSDKType } as MsgExecLegacyContentSDKType;
// //     if (value !== undefined) Object.assign(message, value);
// //     return message;
// //   }
// // };

// // export interface MsgExecLegacyContentSDKType {
// //   content?: Any;
// //   authority: string;
// // }

// // const baseMsgExecLegacyContentSDKType: object = { authority: "" };

// // import { Coin } from "@cosmjs/stargate";
// import { BinaryWriter, BinaryReader } from "cosmjs-types/binary";
// import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
// // import { encodeCosmosBinaryValue } from "cosmjs-typ?es/encoding";

// export interface CustomProposal {
//   description: string;
//   spend: {
//     recipient: string;
//     amount: Coin[];
//   }
// }
// // export const CustomProposal = {
// //   // encode(message: CustomProposal, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
// //   //     writer.uint32(10).string(message.title);
// //   //     writer.uint32(18).string(message.description);
// //   //     writer.uint32(26).string(message.recipient);
// //   //     writer.uint32(34).fork();
// //   //     for (const coin of message.amount) {
// //   //         writer.uint32(34).fork().ldelim(coin.encode(writer.uint32(0).fork()).ldelim());
// //   //       }
// //   //     return writer;
// //   //   },

// // //   encode(
// // //     message: CustomProposal,
// // //     writer: BinaryWriter = new BinaryWriter()
// // //   ): BinaryWriter {
// // //     writer.uint32(10).string(message.title);
// // //     writer.uint32(18).string(message.description);
// // //     writer.uint32(26).string(message.recipient);
// // //     writer.uint32(34).fork();
// // //     for (const coin of message.amount) {
// // //       const coinWriter = writer.uint32(34).fork();
// // //       Coin.encode(coin, coinWriter);
// // //       coinWriter.ldelim();
// // //     }
// // //     return writer;
// // //   },
// // encode(message: CustomProposal, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
// //     writer.uint32(18).string(message.description);
// //     writer.uint32(26).string(message.recipient);
// //     writer.uint32(34).fork();
// //     for (const coin of message.amount) {
// //       Coin.encode(coin, writer.uint32(34).fork()).ldelim();
// //     }
// //     return writer;
// //   },
// //   decode(input: BinaryReader | Uint8Array, length?: number): CustomProposal {
// //     const reader =
// //       input instanceof BinaryReader ? input : new BinaryReader(input);
// //     let end = length === undefined ? reader.len : reader.pos + length;
// //     const message = {
// //     //   title: "",
// //       description: "",
// //       recipient: "",
// //       amount: [],
// //     } as CustomProposal;
// //     while (reader.pos < end) {
// //       const tag = reader.uint32();
// //       switch (tag >>> 3) {
// //         case 1:
// //         //   message.title = reader.string();
// //         //   break;
// //         // case 2:

// //           message.description = reader.string();
// //           console.error('tag 1', tag);
// //             console.error('description', message.description);
// //           break;
// //         case 2:

// //           message.recipient = reader.string();
// //           console.error('tag 2 is ', tag);
// //             console.error('recipient',message.recipient);
// //           break;
// //         case 3:
// //           message.amount.push(Coin.decode(reader, reader.uint32()));
// //             console.error('tag 3 is ', tag);
// //                 console.error('amount',message.amount);
// //           break;
// //         default:
// //           reader.skipType(tag & 7);
// //           break;
// //       }
// //     }
// //     console.error('message complete is ', message);
// //     return message;
// //   },

// //   fromPartial(object: any): CustomProposal {
// //     const message = {
// //       title: "",
// //       description: "",
// //       recipient: "",
// //       amount: [],
// //     } as CustomProposal;
// //     if (object.description !== undefined && object.description !== null) {
// //       message.description = String(object.description);
// //     }
// //     if (object.recipient !== undefined && object.recipient !== null) {
// //       message.recipient = String(object.recipient);
// //     }
// //     if (object.amount !== undefined && object.amount !== null) {
// //       for (const coin of object.amount) {
// //         message.amount.push(Coin.fromPartial(coin));
// //       }
// //     }
// //     return message;
// //   },
// // };

// export interface CustomProposal {
//   description: string;
//   spend: {
//     recipient: string;
//     amount: Coin[];
//   };
// }
// export const CustomProposalCodec = {
//     encode(message: CustomProposal, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
//       writer.uint32(10).string(message.description);
//       writer.uint32(18).fork();
//       writer.uint32(18).string(message.spend.recipient);
//       writer.uint32(26).fork();
//       for (const coin of message.spend.amount) {
//         Coin.encode(coin, writer.uint32(26).fork()).ldelim();
//       }
//       return writer;
//     },

//     decode(input: BinaryReader | Uint8Array, length?: number): CustomProposal {
//       const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
//       let end = length === undefined ? reader.len : reader.pos + length;
//       const message = { description: "", spend: { recipient: "", amount: [] } } as CustomProposal;
//       while (reader.pos < end) {
//         const tag = reader.uint32();
//         switch (tag >>> 3) {
//           case 1:
//             message.description = reader.string();
//             break;
//           case 2:
//             const spendReader = reader.fork();
//             message.spend.recipient = spendReader.string();
//             const amountReader = spendReader.fork();
//             while (amountReader.len > 0) {
//               message.spend.amount.push(Coin.decode(amountReader, amountReader.uint32()));
//             }
//             break;
//           default:
//             reader.skipType(tag & 7);
//             break;
//         }
//       }
//       return message;
//     },

//     fromPartial(object: any): CustomProposal {
//       const message = { description: "", spend: { recipient: "", amount: [] } } as CustomProposal;
//       if (object.description !== undefined && object.description !== null) {
//         message.description = String(object.description);
//       }
//       if (object.spend !== undefined && object.spend !== null) {
//         if (object.spend.recipient !== undefined && object.spend.recipient !== null) {
//           message.spend.recipient = String(object.spend.recipient);
//         }
//         if (object.spend.amount !== undefined && object.spend.amount !== null) {
//           for (const coin of object.spend.amount) {
//             message.spend.amount.push(Coin.fromPartial(coin));
//           }
//         }
//       }
//       return message;
//     },
//   };
// // export const CustomProposalCodec = {
// //   encode(message: CustomProposal, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
// //     writer.uint32(10).string(message.description);
// //     writer.uint32(18).fork();
// //     writer.uint32(18).string(message.spend.recipient);
// //     writer.uint32(26).fork();
// //     for (const coin of message.spend.amount) {
// //       Coin.encode(coin, writer.uint32(26).fork()).ldelim();
// //     }
// //     return writer;
// //   },

// //   decode(input: BinaryReader | Uint8Array, length?: number): CustomProposal {
// //     const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
// //     let end = length === undefined ? reader.len : reader.pos + length;
// //     const message = { description: "", spend: { recipient: "", amount: [] } } as CustomProposal;
// //     while (reader.pos < end) {
// //       const tag = reader.uint32();
// //       switch (tag >>> 3) {
// //         case 1:
// //           message.description = reader.string();
// //           break;
// //         case 2:
// //           const spendReader = reader.uint32(18).fork();
// //           message.spend.recipient = spendReader.string();
// //           const amountReader = spendReader.uint32(26).fork();
// //           while (amountReader.len > 0) {
// //             message.spend.amount.push(Coin.decode(amountReader, amountReader.uint32()));
// //           }
// //           break;
// //         default:
// //           reader.skipType(tag & 7);
// //           break;
// //       }
// //     }
// //     return message;
// //   },

// //   fromPartial(object: any): CustomProposal {
// //     const message = { description: "", spend: { recipient: "", amount: [] } } as CustomProposal;
// //     if (object.description !== undefined && object.description !== null) {
// //       message.description = String(object.description);
// //     }
// //     if (object.spend !== undefined && object.spend !== null) {
// //       if (object.spend.recipient !== undefined && object.spend.recipient !== null) {
// //         message.spend.recipient = String(object.spend.recipient);
// //       }
// //       if (object.spend.amount !== undefined && object.spend.amount !== null) {
// //         for (const coin of object.spend.amount) {
// //           message.spend.amount.push(Coin.fromPartial(coin));
// //         }
// //       }
// //     }
// //     return message;
// //   },
// // };

import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { BinaryWriter, BinaryReader } from "cosmjs-types/binary";

export interface CustomProposal {
  description: string;
  spend: {
    recipient: string;
    amount: Coin[];
  };
}

export const CustomProposalCodec = {
  encode(
    message: CustomProposal,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    writer.uint32(10).string(message.description);
    writer.uint32(18).fork();
    writer.uint32(18).string(message.spend.recipient);
    writer.uint32(26).fork();
    for (const coin of message.spend.amount) {
      Coin.encode(coin, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CustomProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      description: "",
      spend: { recipient: "", amount: [] },
    } as CustomProposal;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = reader.string();
          break;
        case 2:
          const spendLength = reader.uint32();
          const spendEnd = reader.pos + spendLength;
          message.spend.recipient = reader.string();
          const amountLength = reader.uint32();
          const amountEnd = reader.pos + amountLength;
          while (reader.pos < amountEnd) {
            message.spend.amount.push(Coin.decode(reader, reader.uint32()));
          }
          reader.pos = spendEnd;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    console.error("message complete is ", message);

    return message;
  },

  fromPartial(object: any): CustomProposal {
    const message = {
      description: "",
      spend: { recipient: "", amount: [] },
    } as CustomProposal;
    if (object.description !== undefined && object.description !== null) {
      message.description = String(object.description);
    }
    if (object.spend !== undefined && object.spend !== null) {
      if (
        object.spend.recipient !== undefined &&
        object.spend.recipient !== null
      ) {
        message.spend.recipient = String(object.spend.recipient);
      }
      if (object.spend.amount !== undefined && object.spend.amount !== null) {
        for (const coin of object.spend.amount) {
          message.spend.amount.push(Coin.fromPartial(coin));
        }
      }
    }
    console.error("message complete is ", message);

    return message;
  },
};
