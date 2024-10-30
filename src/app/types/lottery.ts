/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lottery.json`.
 */
export type Lottery = {
  "address": "B4Y1J9ezgBFbFZyrXbVKFeWLH7Dwuz1v6sRDB1xvsgmU",
  "metadata": {
    "name": "lottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "lotteryInfo",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        },
        {
          "name": "mkt",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        },
        {
          "name": "ticketNumber",
          "type": "u32"
        }
      ]
    },
    {
      "name": "calculateUserPrize",
      "discriminator": [
        133,
        130,
        51,
        152,
        70,
        173,
        6,
        241
      ],
      "accounts": [
        {
          "name": "lotteryInfo",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        },
        {
          "name": "mkt",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "claimDev",
      "discriminator": [
        67,
        144,
        21,
        238,
        28,
        66,
        170,
        208
      ],
      "accounts": [
        {
          "name": "info",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimMkt",
      "discriminator": [
        53,
        184,
        183,
        98,
        55,
        166,
        122,
        253
      ],
      "accounts": [
        {
          "name": "info",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "lotteryInfo",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        },
        {
          "name": "mkt",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "lotteryInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "key"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        },
        {
          "name": "randomOutside",
          "type": "bool"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "maxTickets",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeDev",
      "discriminator": [
        15,
        193,
        237,
        136,
        56,
        226,
        254,
        16
      ],
      "accounts": [
        {
          "name": "dev",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "key"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeMkt",
      "discriminator": [
        47,
        23,
        98,
        2,
        87,
        48,
        25,
        205
      ],
      "accounts": [
        {
          "name": "mkt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "key"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "key"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pickWinner",
      "discriminator": [
        227,
        62,
        25,
        73,
        132,
        106,
        68,
        96
      ],
      "accounts": [
        {
          "name": "lotteryInfo",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        },
        {
          "name": "mkt",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "u64"
        },
        {
          "name": "entropy",
          "type": "u64"
        },
        {
          "name": "batchSize",
          "type": "u16"
        }
      ]
    },
    {
      "name": "rollover",
      "discriminator": [
        147,
        98,
        248,
        23,
        82,
        182,
        25,
        134
      ],
      "accounts": [
        {
          "name": "oldLottery",
          "writable": true
        },
        {
          "name": "newLottery",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dev",
      "discriminator": [
        237,
        11,
        182,
        3,
        72,
        112,
        219,
        227
      ]
    },
    {
      "name": "lotteryInfo",
      "discriminator": [
        155,
        121,
        172,
        163,
        172,
        81,
        158,
        119
      ]
    },
    {
      "name": "mkt",
      "discriminator": [
        51,
        128,
        239,
        8,
        92,
        204,
        191,
        74
      ]
    },
    {
      "name": "userTicket",
      "discriminator": [
        180,
        163,
        8,
        176,
        85,
        62,
        213,
        128
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "wrongNumber",
      "msg": "Number specified is in a wrong range"
    },
    {
      "code": 6001,
      "name": "missingBalOnLottery",
      "msg": "Lottery out of balance to run"
    },
    {
      "code": 6002,
      "name": "notOp",
      "msg": "Not an OP wallet"
    },
    {
      "code": 6003,
      "name": "zeroAccount",
      "msg": "Account key cannot be zero"
    },
    {
      "code": 6004,
      "name": "ticketMismatch",
      "msg": "Ticket mismatch lotterry and user different ticket numbers"
    },
    {
      "code": 6005,
      "name": "lotteryClosed",
      "msg": "Lottery closed"
    },
    {
      "code": 6006,
      "name": "lotteryNotClosed",
      "msg": "Lottery not closed"
    },
    {
      "code": 6007,
      "name": "notFullProcessed",
      "msg": "Not full processed winners"
    },
    {
      "code": 6008,
      "name": "notClaimableDev",
      "msg": "Claim wallet is not the dev"
    },
    {
      "code": 6009,
      "name": "notClaimableMkt",
      "msg": "Claim wallet is not the mkt"
    }
  ],
  "types": [
    {
      "name": "dev",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "key",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lotteryInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "default",
            "type": "pubkey"
          },
          {
            "name": "tickets",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "ticketsCount",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "fullMatch",
            "type": "u32"
          },
          {
            "name": "fullMatchCount",
            "type": "u16"
          },
          {
            "name": "partial5Match",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "partial5Count",
            "type": "u16"
          },
          {
            "name": "partial4Match",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "partial4Count",
            "type": "u16"
          },
          {
            "name": "partial3Match",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "partial3Count",
            "type": "u16"
          },
          {
            "name": "fullProcessed",
            "type": "bool"
          },
          {
            "name": "randomOutside",
            "type": "bool"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "maxTickets",
            "type": "u16"
          },
          {
            "name": "matchKind",
            "type": "u8"
          },
          {
            "name": "lotteryId",
            "type": "u64"
          },
          {
            "name": "winNumber",
            "type": "u64"
          },
          {
            "name": "processIndex",
            "type": "u64"
          },
          {
            "name": "finalBal",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "mkt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "key",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "boughtTickets",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "boughtTicketsCount",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "lotteryId",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
