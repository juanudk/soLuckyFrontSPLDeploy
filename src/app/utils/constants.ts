import idl from "../idl/lottery.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export const commitmentLevel = "processed";
export const endpoint =
  process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);

export const lotteryProgramId = new PublicKey(idl.address);
export const dev = new PublicKey("64K98PjEfzLQ4RyZhygrnHA2kX1td2JNtSFtY4ho4EDn");
export const mkt = new PublicKey("8J1WqJPmQf21hMacA2Q9cMvX7SL8732Ekww5pH53V2rM");
export const op = new PublicKey("6qKd4QDpdo1EwuAQVpNAYT3M4ixRphNwoVzxzyYNFhao");
export const burn = new PublicKey("FesdSJ8PfJhdCSfy4xeXvEeiDYvc4uwCQdU73CgeRw41");
export const token = new PublicKey("HnHYLNZVhn4m1oGv7H4iJm883mn5b69foyRx1ZF5iq1j");
export const tokenSymbol = "UKN";
export const MATCHES_6 = new BN(4000);
export const MATCHES_5 = new BN(2000);
export const MATCHES_4 = new BN(1000);
export const MATCHES_3 = new BN(500);
export const PERCENTAGE_BASE = new BN(10000);
export const lotteryProgramInterface = JSON.parse(JSON.stringify(idl));
export const devId = new BN(-1);
export const mktId = new BN(-2);
export const burnId = new BN(-3);
export const opId = new BN(-4);
