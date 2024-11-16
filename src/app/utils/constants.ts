import idl from "../idl/lottery.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {BN} from "@coral-xyz/anchor";

export const commitmentLevel = "processed";
export const endpoint =
  process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);

export const lotteryProgramId = new PublicKey(idl.address);
export const dev = new PublicKey("CFAUQvT5MA5xJemHwRcbzCQC3UPRyDeQVr1cqo4JbEAp");
export const mkt = new PublicKey("CvmWdoJiH5qRQywPhNdESMC6LHMEYqYgMvgJMuwFQyQw");
export const op = new PublicKey("9TFNhwunYo48L5vaW2HLNoCgrwkipy7YZqekAoZABwuK");
export const MATCHES_6  = new BN(4000);
export const MATCHES_5  = new BN(2000);
export const MATCHES_4  = new BN(1000);
export const MATCHES_3  = new BN(500);
export const PERCENTAGE_BASE  = new BN(10000);
export const lotteryProgramInterface = JSON.parse(JSON.stringify(idl));
export const devId = new BN(5); 
export const mktId = new BN(6);
