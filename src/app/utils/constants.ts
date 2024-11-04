import idl from "../idl/lottery.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {BN} from "@coral-xyz/anchor";

/* Constants for RPC Connection the Solana Blockchain */
export const commitmentLevel = "processed";
export const endpoint =
  process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);

/* Constants for the Deployed "Hello World" Program */
export const lotteryProgramId = new PublicKey(idl.address);
export const dev = new PublicKey("5cbBDZmhx7MiyvvJWtxtzjDrqAjauQB9W8DJWAX3uUQ1");
export const mkt = new PublicKey("4K78eeTnFbukbx3UrTpzQSA6pbL72xjJzf8dVJN1KXn9");
export const MATCHES_6  = new BN(4000);
export const MATCHES_5  = new BN(2000);
export const MATCHES_4  = new BN(1000);
export const MATCHES_3  = new BN(500);
export const PERCENTAGE_BASE  = new BN(10000);
export const lotteryProgramInterface = idl;
