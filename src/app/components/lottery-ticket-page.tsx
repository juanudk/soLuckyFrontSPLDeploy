'use client'
import { useState, ChangeEvent, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { ChevronUp, ChevronDown } from "lucide-react"
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
import { useSearchParams } from 'next/navigation'
import {
  commitmentLevel,
  lotteryProgramInterface,
  mkt,
  dev,
  PERCENTAGE_BASE,
  MATCHES_6,
  MATCHES_5,
  MATCHES_4,
  MATCHES_3,
  devId,
  mktId,
  op,
  token
} from "../utils/constants";
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
interface userTickets {
  "boughtTickets": number[],
  "boughtTicketsCount": number[],
}
const voidWallet = (new Keypair());

export default function Component() {
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')
  const [isHidden, setIsHidden] = useState(false)
  const [winNumber, setWinNumber] = useState(0)
  const [lotteryNumber, setLotteryNumber] = useState(new BN(2))
  const [matches6Prize, setMatches6Prize] = useState(new BN(0))
  const [matches5Prize, setMatches5Prize] = useState(new BN(0))
  const [matches4Prize, setMatches4Prize] = useState(new BN(0))
  const [matches3Prize, setMatches3Prize] = useState(new BN(0))
  const [lotteryBal, setLotteryBal] = useState(0)
  const [solPrice, setSolPrice] = useState(0)
  const [userReward, setUserReward] = useState(0)
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [userTickets, setUserTickets] = useState<userTickets>()
  const [newTicketNumbers, setNewTicketNumbers] = useState(['', '', '', '', '', ''])


  //const claimPrize = () => {
  //setIsClaimed(true)
  //// In a real application, you would call an API or smart contract here
  //}
  const loadInfo = useCallback(async () => {
    if (urlId && parseInt(urlId) > 0 && urlId != lotteryNumber) {
      setLotteryNumber(new BN(urlId))
    }
    if (solPrice == 0) {
      const response = await axios.get("/api/getTokenPrice?quote=usd&token=solana")
      setSolPrice(response.data[0].current_price)
    }
    const provider = new AnchorProvider(connection, voidWallet as any, {
      preflightCommitment: commitmentLevel,
    });
    if (!provider) return
    const program: any = new Program(
      lotteryProgramInterface,
      provider
    );
    const seeds = [lotteryNumber.toArrayLike(Buffer, "le", 8)];
    const lotteryPDA = web3.PublicKey.findProgramAddressSync(
      seeds,
      program.programId
    )[0];
    console.log(connection)
    if (lotteryBal == 0) {
      const bal = await connection.getBalance(lotteryPDA)
      setMatches6Prize(bal * MATCHES_6 / PERCENTAGE_BASE / LAMPORTS_PER_SOL)
      setMatches5Prize(bal * MATCHES_5 / PERCENTAGE_BASE / LAMPORTS_PER_SOL)
      setMatches4Prize(bal * MATCHES_4 / PERCENTAGE_BASE / LAMPORTS_PER_SOL)
      setMatches3Prize(bal * MATCHES_3 / PERCENTAGE_BASE / LAMPORTS_PER_SOL)
      setLotteryBal(bal / LAMPORTS_PER_SOL)
    }
    if (wallet) {
      try {
        const seedsUser = [lotteryNumber.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer()];
        const userPDA = PublicKey.findProgramAddressSync(
          seedsUser,
          program.programId
        )[0];
        const userInfo = await program.account.userTicket.fetch(userPDA)
        const lotteryInfo = await program.account.lotteryInfo.fetch(lotteryPDA)
        const winNumberLocal = lotteryInfo.winNumber.toNumber()
        setWinNumber(winNumberLocal)
        if (winNumberLocal > 0) {
          console.log("wn", lotteryInfo.winNumber)
          console.log("m6", lotteryInfo.fullMatch)
          console.log("p6", lotteryInfo.fullMatchCount)
          console.log("m5", lotteryInfo.partial5Match)
          console.log("p5", lotteryInfo.partial5Count)
          console.log("m4", lotteryInfo.partial4Match)
          console.log("p4", lotteryInfo.partial4Count)
          console.log("m3", lotteryInfo.partial3Match)
          console.log("p3", lotteryInfo.partial3Count)

          let amount = 0;
          const final_bal = lotteryInfo.finalBal;
          for (let i = 0; i < userInfo.boughtTickets.length; i++) {
            if (userInfo.boughtTickets[i] == lotteryInfo.fullMatch) {
              amount += (final_bal * MATCHES_6 / PERCENTAGE_BASE)
                / lotteryInfo.fullMatchCount
                * userInfo.boughtTicketsCount[i]
            } else {
              let found = false;
              for (let m5 = 0; m5 < lotteryInfo.partial5Match.length; m5++) {
                if (userInfo.boughtTickets[i]
                  == lotteryInfo.partial5Match[m5]) {
                  amount += (final_bal * MATCHES_5 / PERCENTAGE_BASE)
                    / lotteryInfo.partial5Count
                    * userInfo.boughtTicketsCount[i]
                  found = true;
                }
              }
              if (found == false) {
                for (let m4 = 0; m4 < lotteryInfo.partial4Match.length; m4++) {
                  if (userInfo.boughtTickets[i]
                    == lotteryInfo.partial4Match[m4]) {
                    amount += (final_bal * MATCHES_4
                      / PERCENTAGE_BASE)
                      / lotteryInfo.partial4Count
                      * userInfo.boughtTicketsCount;
                    found = true;
                  }
                }
              }
              if (found == false) {
                for (let m3 = 0; m3 < lotteryInfo.partial3Match.length; m3++) {
                  if (userInfo.boughtTickets[i]
                    == lotteryInfo.partial3Match[m3]) {
                    amount += (final_bal * MATCHES_3
                      / PERCENTAGE_BASE)
                      / lotteryInfo.partial3Count
                      * userInfo.boughtTicketsCount[i]
                  }
                }
              }
            }
          }
          setUserReward(amount / LAMPORTS_PER_SOL)
        }
        setUserTickets(userInfo)
      } catch (e) {
        console.log(e)
      }
    }
  }, [wallet, solPrice, lotteryBal])

  useEffect(() => {
    console.log("here use effect")
    loadInfo()
  }, [wallet, solPrice, lotteryBal])

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...newTicketNumbers]
    newNumbers[index] = value
    setNewTicketNumbers(newNumbers)
  }


  const buyTicket = async () => {
    // Validate all fields are filled and numbers are between 1 and 99
    if (newTicketNumbers.some(num => num === '' || parseInt(num) < 0 || parseInt(num) > 9)) {
      alert('Please fill all fields with numbers between 1 and 99')
      return
    }
    if (wallet) {
      //setUserTickets([...userTickets, newTicket])
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      /* create the program interface combining the idl, program Id, and provider */
      console.log("wallet")
      const program: any = new Program(
        lotteryProgramInterface,
        provider
      );
      const seedsGlobal = [token.toBuffer(), op.toBuffer()];
      let valueGlobal = PublicKey.findProgramAddressSync(
        seedsGlobal,
        program.programId
      )[0];
      const global = await program.account.global.fetch(valueGlobal)
      const lotteryNumber = global.currentLottery
      const seedsUser = [lotteryNumber.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer(), token.toBuffer(), op.toBuffer()];
      const userPDA = PublicKey.findProgramAddressSync(
        seedsUser,
        program.programId
      )[0];
      const bal = await connection.getBalance(userPDA);
      const chosedNumber = new BN("1" + newTicketNumbers.join(""))
      if (bal == 0) {
        console.log(`Account ${userPDA} should be initialized`)
        await program.methods.initializeUser(lotteryNumber, token, op).accounts({ user: userPDA }).rpc()
      } else {
        console.log(`Account ${userPDA} already initialized`)
      }
      const seeds = [new BN(lotteryNumber).toArrayLike(Buffer, "le", 8)];
      const lotteryPDA = web3.PublicKey.findProgramAddressSync(
        seeds,
        program.programId
      )[0];
      const seedsDev = [devId.toArrayLike(Buffer, "le", 8)];
      const devPDA = web3.PublicKey.findProgramAddressSync(
        seedsDev,
        program.programId
      )[0];

      const seedsMkt = [mktId.toArrayLike(Buffer, "le", 8)];
      const mktPDA = web3.PublicKey.findProgramAddressSync(
        seedsMkt,
        program.programId
      )[0];
      let newKeypair2ATA = await getAssociatedTokenAddress(
        token,
        wallet.publicKey
      );

      let devATA = await getAssociatedTokenAddress(
        token,
        dev
      );

      let mktATA = await getAssociatedTokenAddress(
        token,
        mkt
      );

      let lotteryATA = await getAssociatedTokenAddress(
        token,
        new PublicKey(lotteryProgramInterface.address)
      );

      await program.methods.buyTicket(lotteryNumber, chosedNumber).accounts({
        lotteryInfo: lotteryPDA, dev: devPDA, mkt: mktPDA, user: userPDA, 
        lotteryTokenAccount: lotteryATA,
        devTokenAccount: devATA,
        mktTokenAccount: mktATA,
        signerTokenAccount: newKeypair2ATA,
        burnTokenAccount: devATA
      }).rpc()

      // setNewTicketNumbers(['', '', '', '', '', '']) // Reset input fields
    }
  }

  const claimPrize = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      // Create the program interface combining the IDL, program ID, and provider
      const program: any = new Program(
        lotteryProgramInterface,
        provider
      );
      const seeds = [new BN(lotteryNumber).toArrayLike(Buffer, "le", 8)];
      const lotteryPDA = web3.PublicKey.findProgramAddressSync(
        seeds,
        program.programId
      )[0];
      const seedsUser = [lotteryNumber.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer()];
      const userPDA = PublicKey.findProgramAddressSync(
        seedsUser,
        program.programId
      )[0];
      const seedsDev = [devId.toArrayLike(Buffer, "le", 8)];
      const devPDA = web3.PublicKey.findProgramAddressSync(
        seedsDev,
        program.programId
      )[0];

      const seedsMkt = [mktId.toArrayLike(Buffer, "le", 8)];
      const mktPDA = web3.PublicKey.findProgramAddressSync(
        seedsMkt,
        program.programId
      )[0];
      try {
        await program.methods.claimPrize().accounts({
          lotteryInfo: lotteryPDA,
          user: userPDA,
          dev: devPDA,
          mkt: mktPDA
        }).rpc();

        console.log('Successfully claimed prize');
      } catch (error) {
        console.error('Error claiming prize:', error);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };

  const claimMkt = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      /* Create the program interface combining the IDL, program ID, and provider */
      const program: any = new Program(lotteryProgramInterface, provider);

      // Generate the PDA for the Mkt account using the specified seed
      const seedsMkt = [mktId.toArrayLike(Buffer, "le", 8)];
      const mktPDA = web3.PublicKey.findProgramAddressSync(seedsMkt, program.programId)[0];

      // Check if the account exists and fetch its balance if needed
      const bal = await connection.getBalance(mktPDA);
      if (bal === 0) {
        console.log(`Account ${mktPDA} is not initialized`);
        return;
      }

      // Call the `claimMkt` method on the program
      try {
        await program.methods.claimMkt()
          .accounts({
            info: mktPDA,
            signer: wallet.publicKey,
          })
          .rpc();

        console.log("Successfully claimed market prize");
      } catch (error) {
        console.error("Error claiming market prize:", error);
        // alert(`Error: ${error.message}`);
      }
    } else {
      alert("Wallet is not connected. Please connect your wallet.");
    }
  };

  const claimDev = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      /* Create the program interface combining the IDL, program ID, and provider */
      const program: any = new Program(lotteryProgramInterface, provider);

      // Generate the PDA for the Dev account using the specified seed
      const seedsDev = [devId.toArrayLike(Buffer, "le", 8)];
      const devPDA = web3.PublicKey.findProgramAddressSync(seedsDev, program.programId)[0];

      // Check if the account exists and fetch its balance if needed
      const bal = await connection.getBalance(devPDA);
      if (bal === 0) {
        console.log(`Account ${devPDA} is not initialized`);
        return;
      }

      // Call the `claimDev` method on the program
      try {
        await program.methods.claimDev()
          .accounts({
            info: devPDA,
            signer: wallet.publicKey,
          })
          .rpc();

        console.log("Successfully claimed developer prize");
      } catch (error) {
        console.error("Error claiming developer prize:", error);
        // alert(`Error: ${error.message}`);
      }
    } else {
      alert("Wallet is not connected. Please connect your wallet.");
    }
  };

  const formatValue = (value: number): string => {
    return parseFloat((value).toString()).toFixed(2)
  }

  const formatSolUSD = (solValue: number): string => {
    return formatValue(solValue * solPrice)
  }


  return (
    <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 px-4 py-2">
        <WalletMultiButtonDynamic />
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">Get your tickets now!</h1>

      <div className="text-2xl font-bold text-yellow-300 mb-8">
        6<span className="text-lg">h</span> 49<span className="text-lg">m</span> until the draw
      </div>

      <div className="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Next Draw</span>
            <span className="text-sm">#{lotteryNumber.toString()} | Draw: Oct 29, 2024, 9:00 PM</span>
          </div>
        </div>
        <div className={`p-6 space-y-4 ${isHidden ? 'hidden' : ''}`}>
          <div className="flex justify-between items-center">
            <span className="text-xl">Prize Pot</span>
            <span className="text-3xl text-purple-400">~${formatSolUSD(lotteryBal)}</span>
          </div>
          <div className="text-sm text-gray-400">{formatValue(lotteryBal)} SOL</div>
          {userReward > 0 &&
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Prize Win Number {winNumber}</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl text-green-400">{userReward} SOL</span>
                <button
                  onClick={claimPrize}
                  className={`px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white`}
                >
                  Claim Prize
                </button>
              </div>
            </div>}
          <div>
            {userTickets &&
              <h3 className="font-semibold mb-2">Your tickets</h3>}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {userTickets && userTickets.boughtTickets.map((ticket, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded-md text-xs">
                  <div className="font-semibold mb-1">Ticket #{index} bought {userTickets?.boughtTicketsCount?.[index]}</div>
                  <div className="flex justify-between">
                    {Array.from(ticket.toString().slice(1)).map((element, indexNumber) => (
                      <span key={indexNumber} className="bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center">
                        {element}
                      </span>
                    ))}

                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-center">Buy a new ticket</h4>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {newTicketNumbers.map((num, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    max="99"
                    value={num}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange(index, e.target.value)}
                    className="bg-gray-700 text-white rounded-md p-2 w-full"
                    placeholder={(index + 1).toString()}
                  />
                ))}
              </div>
              <button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md"
                onClick={buyTicket}
              >
                Buy Ticket
              </button>
            </div>
            <div className="mb-4">
            </div>
            {wallet && wallet.publicKey.toString() == dev.toString() &&
              <div className="mb-4">

                <button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md"
                  onClick={claimDev}
                >
                  Claim Dev Funds
                </button>
              </div>}
            {wallet && wallet.publicKey.toString() == mkt.toString() &&
              <div className="mb-4">

                <button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md"
                  onClick={claimMkt}
                >
                  Claim Mkt Funds
                </button>
              </div>}

          </div>
          <div className="text-sm">
            Match the winning number in the same order to share prizes. Current prizes up for grabs:
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Match first 3', value: `${formatValue(matches3Prize)} SOL`, subvalue: `$${formatSolUSD(matches3Prize)}` },
              { label: 'Match first 4', value: `${formatValue(matches4Prize)} SOL`, subvalue: `$${formatSolUSD(matches4Prize)}` },
              { label: 'Match first 5', value: `${formatValue(matches5Prize)} SOL`, subvalue: `$${formatSolUSD(matches5Prize)}` },
              { label: 'Match all 6', value: `${formatValue(matches6Prize)} SOL`, subvalue: `$${formatSolUSD(matches6Prize)}` },
            ].map((item, index) => (
              <div key={index} className="text-sm">
                <div className="text-purple-400">{item.label}</div>
                <div>{item.value}</div>
                <div className="text-gray-500">~{item.subvalue}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-center">
          <button
            className="text-purple-400 hover:text-purple-300 flex items-center"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? (
              <>
                Show
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Hide
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
