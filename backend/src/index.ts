import FireFly from "@hyperledger/firefly-sdk";
import bodyparser from "body-parser";
import express from "express";
import escrow from "../../solidity/artifacts/contracts/escrow.sol/Escrow.json";
import coin from "../../solidity/artifacts/contracts/coin.sol/Coin.json";
import config from "../config.json";
import { v4 as uuidv4 } from 'uuid';
export const app = express();

// firefly instance that deployed the token and escrow contract
const firefly_admin = new FireFly({
  host: config.HOST1_ADMIN,
  namespace: config.NAMESPACE,
});
// firefly instance that represents the freelancer
const firefly_freelancer = new FireFly({
  host: config.HOST2_FREELANCER,
  namespace: config.NAMESPACE,
});
// firefly instance that represents the client
const firefly_client = new FireFly({
  host: config.HOST3_CLIENT,
  namespace: config.NAMESPACE,
});

const escrowFfiName: string = `escrowFFI-${config.VERSION}`;
const escrowApiName: string = `escrowApi-${config.VERSION}`;
const coinFfiName: string = `coinFFI-${config.VERSION}`;
const coinApiName: string = `coinApi-${config.VERSION}`;

app.use(bodyparser.json());

// Middleware to attach FireFly instance based on username
app.use((req: any, res, next) => {
  const username = req.headers['username'];

  switch (username) {
    case 'admin':
      req.firefly = firefly_admin;
      req.address = config.HOST1_ADMIN_ADDRESS;
      break;
    case 'freelancer':
      req.firefly = firefly_freelancer;
      req.address = config.HOST2_FREELANCER_ADDRESS;
      break;
    case 'client':
      req.firefly = firefly_client;
      req.address = config.HOST3_CLIENT_ADDRESS;
      break;
    default:
      return res.status(400).send({ error: 'Invalid username' });
  }

  next();
});

// app.get("/api/value", async (req, res) => {
//   res.send(
//     await firefly.queryContractAPI(ssApiName, "get", {
//       key: config.SIGNING_KEY,
//     })
//   );
// });

// app.post("/api/value", async (req, res) => {
//   try {
//     const fireflyRes = await firefly.invokeContractAPI(ssApiName, "set", {
//       input: {
//         x: req.body.x,
//       },
//       key: config.SIGNING_KEY,
//     });
//     res.status(202).send({
//       id: fireflyRes.id,
//     });
//     /* eslint-disable  @typescript-eslint/no-explicit-any */
//   } catch (e: any) {
//     res.status(500).send({
//       error: e.message,
//     });
//   }
// });

app.post("/api/v1/wallet/mint", async (req : any, res) => {
  const firefly = req.firefly;
  try {
    const fireflyRes = await firefly.invokeContractAPI(
      coinApiName,
      "mint",
      {
        input: {
          amount: Number(req.body.amount),
        }
      }
    );
    res.status(202).send();
    /* eslint-disable  @typescript-eslint/no-explicit-any */
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.get("/api/v1/wallet/balance", async (req : any, res) => {
  const firefly = req.firefly;
  try {
    const fireflyRes = await firefly.queryContractAPI(coinApiName, "myBalance", {

    });
    res.status(202).send({
      balance: fireflyRes.output,
    });
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/wallet/transfer", async (req : any, res) => {
  const firefly = req.firefly;
  try {
    await firefly.invokeContractAPI(coinApiName, "transfer", {
      input: {
        to: req.body.address,
        amount: req.body.amount,
      },
    });
    res.status(202).send();
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts", async (req : any, res) => {
  const firefly = req.firefly;
  const cid = uuidv4();
  try {
    // authorize the escrow contract to spend the client's funds, with new allowance
    await firefly.invokeContractAPI(coinApiName, "approve", {
      input: {
        spender: config.ESCROW_ADDRESS,
        // infinite allowance for now
        amount: 2147483647,
      }
    });

    const fireflyRes = await firefly.invokeContractAPI(escrowApiName, "createAgreement", {
      input: {
        _freelancer: req.body.freelancer,
        _amount: req.body.amount,
        _cid: cid,
      },
    });
    res.status(202).send({
      cid: cid,
    });
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.get("/api/v1/contracts/:cid", async (req : any, res) => {
  const firefly = req.firefly;
  try {
    const fireflyRes = await firefly.queryContractAPI(escrowApiName, "getAgreement", {
      input: {
        _cid: req.params.cid,
      },
    });
    res.status(202).send(fireflyRes);
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts/:cid/sign", async (req : any, res) => {
  const firefly = req.firefly;
  // console.log(req)
  try {
    const fireflyRes = await firefly.invokeContractAPI(escrowApiName, "approve", {
      input: {
        _cid: req.params.cid,
      },
    });
    res.status(202).send();
  } catch (e: any) {
    // console.log(e);
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts/:cid/releaseFunds", async (req: any, res) => {
  const firefly = req.firefly;
  // console.log(req)
  try {
    await firefly.invokeContractAPI(escrowApiName, "releaseFunds", {
      input: {
        _cid: req.params.cid,
        _amount: req.body.amount,
      },
    });
    res.status(202).send();
  } catch (e: any) {
    // console.log(e);
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts/:cid/addFunds", async (req: any, res) => {
  const firefly = req.firefly;
  try {
    // Retrieve the current allowance
    const currentAllowance = await firefly.queryContractAPI(coinApiName, "allowance", {
      input: {
        owner: req.address,
        spender: config.ESCROW_ADDRESS,
      }
    });
    // Calculate the new allowance
    const newAllowance = Number(currentAllowance) + Number(req.body.amount);
    // authorize the escrow contract to spend the client's funds, with new allowance
    await firefly.invokeContractAPI(coinApiName, "approve", {
      input: {
        spender: config.ESCROW_ADDRESS,
        amount: newAllowance,
      }
    });

    await firefly.invokeContractAPI(escrowApiName, "addFunds", {
      input: {
        _cid: req.params.cid,
        _amount: req.body.amount,
      },
    });
    res.status(202).send();
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});


app.get("/api/v1/wallet/decimals", async (req: any, res) => {
  const firefly = req.firefly;
  try {
    const fireflyRes = await firefly.queryContractAPI(coinApiName, "decimals", {

    });
    res.status(202).send({
      decimals: fireflyRes.output,
    });
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

async function init() {

  await firefly_admin
    .generateContractInterface({
      name: escrowFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed escrow contract",
      input: {
        abi: escrow.abi,
      },
    })
    .then(async (escrowGeneratedFFI) => {
      if (!escrowGeneratedFFI) return;
      return await firefly_admin.createContractInterface(escrowGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (escrowContractInterface) => {
      if (!escrowContractInterface) return;
      return await firefly_admin.createContractAPI(
        {
          interface: {
            id: escrowContractInterface.id,
          },
          location: {
            address: config.ESCROW_ADDRESS,
          },
          name: escrowApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'escrowFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });

  // Token
  await firefly_admin
    .generateContractInterface({
      name: coinFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed coin contract",
      input: {
        abi: coin.abi,
      },
    })
    .then(async (coinGeneratedFFI) => {
      if (!coinGeneratedFFI) return;
      return await firefly_admin.createContractInterface(coinGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (coinContractInterface) => {
      if (!coinContractInterface) return;
      return await firefly_admin.createContractAPI(
        {
          interface: {
            id: coinContractInterface.id,
          },
          location: {
            address: config.COIN_ADDRESS,
          },
          name: coinApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'coinFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });
  
  await firefly_client
    .generateContractInterface({
      name: escrowFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed escrow contract",
      input: {
        abi: escrow.abi,
      },
    })
    .then(async (escrowGeneratedFFI) => {
      if (!escrowGeneratedFFI) return;
      return await firefly_client.createContractInterface(escrowGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (escrowContractInterface) => {
      if (!escrowContractInterface) return;
      return await firefly_client.createContractAPI(
        {
          interface: {
            id: escrowContractInterface.id,
          },
          location: {
            address: config.ESCROW_ADDRESS,
          },
          name: escrowApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'escrowFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });

  // Token
  await firefly_client
    .generateContractInterface({
      name: coinFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed coin contract",
      input: {
        abi: coin.abi,
      },
    })
    .then(async (coinGeneratedFFI) => {
      if (!coinGeneratedFFI) return;
      return await firefly_client.createContractInterface(coinGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (coinContractInterface) => {
      if (!coinContractInterface) return;
      return await firefly_client.createContractAPI(
        {
          interface: {
            id: coinContractInterface.id,
          },
          location: {
            address: config.COIN_ADDRESS,
          },
          name: coinApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'coinFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });
  
  await firefly_freelancer
    .generateContractInterface({
      name: escrowFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed escrow contract",
      input: {
        abi: escrow.abi,
      },
    })
    .then(async (escrowGeneratedFFI) => {
      if (!escrowGeneratedFFI) return;
      return await firefly_freelancer.createContractInterface(escrowGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (escrowContractInterface) => {
      if (!escrowContractInterface) return;
      return await firefly_freelancer.createContractAPI(
        {
          interface: {
            id: escrowContractInterface.id,
          },
          location: {
            address: config.ESCROW_ADDRESS,
          },
          name: escrowApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'escrowFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });

  // Token
  await firefly_freelancer
    .generateContractInterface({
      name: coinFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed coin contract",
      input: {
        abi: coin.abi,
      },
    })
    .then(async (coinGeneratedFFI) => {
      if (!coinGeneratedFFI) return;
      return await firefly_freelancer.createContractInterface(coinGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (coinContractInterface) => {
      if (!coinContractInterface) return;
      return await firefly_freelancer.createContractAPI(
        {
          interface: {
            id: coinContractInterface.id,
          },
          location: {
            address: config.COIN_ADDRESS,
          },
          name: coinApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'coinFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });

  // Listeners
  // Simple storage listener
  // await firefly
  //   .createContractAPIListener(marketplaceApiName, "Changed", {
  //     topic: "changed",
  //   })
  //   .catch((e) => {
  //     const err = JSON.parse(JSON.stringify(e.originalError));

  //     if (err.status === 409) {
  //       console.log(
  //         "Simple storage 'changed' event listener already exists in FireFly. Ignoring."
  //       );
  //     } else {
  //       console.log(
  //         `Error creating listener for simple_storage "changed" event: ${err.message}`
  //       );
  //     }
  //   });
  // Token listener
  // await firefly
  //     .createContractAPIListener(coinApiName, "Transfer", {
  //     topic: "transfer",
  //   })
  //   .catch((e) => {
  //     const err = JSON.parse(JSON.stringify(e.originalError));

  //     if (err.status === 409) {
  //       console.log(
  //         "Token 'transfer' event listener already exists in FireFly. Ignoring."
  //       );
  //     } else {
  //       console.log(
  //         `Error creating listener for token "transfer" event: ${err.message}`
  //       );
  //     }
  //   });

  // firefly.listen(
  //   {
  //     filter: {
  //       events: "blockchain_event_received",
  //     },
  //   },
  //   async (socket, event) => {
  //     console.log(
  //       `${event.blockchainEvent?.info.signature}: ${JSON.stringify(
  //         event.blockchainEvent?.output,
  //         null,
  //         2
  //       )}`
  //     );
  //   }
  // );

  // Start listening
  app.listen(config.PORT, () =>
    console.log(`Marketplace DApp backend listening on port ${config.PORT}!`)
  );
}

init().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = {
  app,
};
