import FireFly from "@hyperledger/firefly-sdk";
import bodyparser from "body-parser";
import express from "express";
import escrow from "../../solidity/artifacts/contracts/escrow.sol/Escrow.json";
import coin from "../../solidity/artifacts/contracts/coin.sol/Coin.json";
import config from "../config.json";

const app = express();
// firefly instance that deployed the token and escrow contract
const firefly_other = new FireFly({
  host: config.HOST1_OTHER,
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
app.use((req, res, next) => {
  const username = req.headers['username'];

  switch (username) {
    case 'other':
      req.firefly = firefly_other;
      break;
    case 'freelancer':
      req.firefly = firefly_freelancer;
      break;
    case 'client':
      req.firefly = firefly_client;
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

// app.post("/api/v1/mintCoin", async (req, res) => {
//   console.log(req.body);
//   try {
//     const fireflyRes = await firefly.invokeContractAPI(
//       coinApiName,
//       "mint",
//       {
//         input: {
//           amount: Number(req.body.amount),
//         }
//       }
//     );
//     console.log(fireflyRes);
//     res.status(202).send({
//       amount: fireflyRes.input.input.amount,
//     });
//     /* eslint-disable  @typescript-eslint/no-explicit-any */
//   } catch (e: any) {
//     console.log(e);
//     res.status(500).send({
//       error: e.message,
//     });
//   }
// });

// app.post("/api/v1/getBalance", async (req, res) => {
//   console.log(req.body);
//   try {
//     const fireflyRes = await firefly.queryContractAPI(coinApiName, "balanceOf", {
//       input: {
//         account: req.body.account,
//       },
//     });
//     console.log(fireflyRes);
//     res.status(202).send(fireflyRes);
//   } catch (e: any) {
//     console.log(e);
//     res.status(500).send({
//       error: e.message,
//     });
//   }
// });

// app.post("/api/v1/jobs", async (req, res) => {
//   console.log(req.body);
//   try {
//     const fireflyRes = await firefly.invokeContractAPI(marketplaceApiName, "createPost", {
//       input: {
//         ipfs_id: req.body.ipfs_id,
//         freelancer: req.body.freelancer,
//       },
//     });
//     console.log(fireflyRes);
//     res.status(202).send();
//   } catch (e: any) {
//     console.log(e);
//     res.status(500).send({
//       error: e.message,
//     });
//   }
// });

// app.get("/api/v1/jobs/:ipfs_id", async (req, res) => {
//   console.log(req.params);
//   try {
//     const fireflyRes = await firefly.queryContractAPI(marketplaceApiName, "getPost", {
//       input: {
//         ipfs_id: req.params.ipfs_id,
//       },
//     });
//     console.log(fireflyRes);
//     res.status(202).send(fireflyRes);
//   } catch (e: any) {
//     console.log(e);
//     res.status(500).send({
//       error: e.message,
//     });
//   }
// });

async function init() {
  // Simple storage
  await firefly_other
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
      return await firefly_other.createContractInterface(escrowGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (escrowContractInterface) => {
      if (!escrowContractInterface) return;
      return await firefly_other.createContractAPI(
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
  await firefly_other
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
      return await firefly_other.createContractInterface(coinGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (coinContractInterface) => {
      if (!coinContractInterface) return;
      return await firefly_other.createContractAPI(
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
