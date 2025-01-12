import FireFly from "@hyperledger/firefly-sdk";
import bodyparser from "body-parser";
import express from "express";
import escrow from "../../solidity/artifacts/contracts/escrow.sol/Escrow.json";
import coin from "../../solidity/artifacts/contracts/coin.sol/Coin.json";
import config from "../config.json";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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

// Proposal
type Proposal = {
  id: string;
  freelancer: string;
  coverletter: string;
  amount: number;
}

// Job post 
type JobPost = {
  id: string;
  title: string;
  description: string;
  budget: number;
  owner: string;
  proposal: string[];
}

type Contract = {
  title: string;
  contract: string;
  client: {
    address: string;
    username: string;
  };
  freelancer: {
    address: string;
    username: string;
  };
}

// mock job post database using a map data structure 
const jobPostDatabase = new Map<string, JobPost>();

// mock proposal database using a map data structure
const proposalDatabase = new Map<string, Proposal>();

// mock ipfs database for contracts using a map data structure
// the key is a hash of the contract data
const contractDatabase = new Map<string, Contract>();

app.use(bodyparser.json());

// Middleware to attach FireFly instance based on username
app.use((req: any, res, next) => {
  const username = req.headers['username'];

  switch (username) {
    case 'adam_admin':
      req.firefly = firefly_admin;
      break;
    case 'frank_freelancer':
      req.firefly = firefly_freelancer;
      break;
    case 'calvin_client':
      req.firefly = firefly_client;
      break;
    default:
      return res.status(400).send({ error: 'Invalid username' });
  }

  next();
});

app.get("/api/v1/jobs", async (req: any, res) => {
  const jobs = Array.from(jobPostDatabase.values()).map(job => {

    // exclude proposals 
    const { proposal, ...jobWithoutProposals } = job;
    return jobWithoutProposals;
    
  });
  res.status(202).send(jobs);
});

app.post("/api/v1/jobs", async (req: any, res) => {
  const username = req.headers['username'];
  const jobPost: JobPost = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    budget: req.body.budget,
    owner: username,
    proposal: [],
  }
  jobPostDatabase.set(jobPost.id, jobPost);
  res.status(202).send(jobPost);
});

app.get("/api/v1/jobs/:id", async (req: any, res) => {
  if (!req.params.id || !req.headers['username']) {
    return res.status(400).send({ error: 'Missing job post id or username' });
  }
  const jobPost = jobPostDatabase.get(req.params.id);
  if (!jobPost) {
    return res.status(404).send({ error: 'Job post not found' });
  }
  if (jobPost.owner !== req.headers['username']) {
    const { proposal, ...jobWithoutProposals } = jobPost;
    return res.status(202).send(jobWithoutProposals);
  }
  // if the job post is owned by the user, return the full job post
  // retrieve all proposals for the job post
  // loop through every proposal id in the proposal array and retrieve the proposal
  const proposals = [];
  for (const proposalId of jobPost.proposal) {
    const proposal = proposalDatabase.get(proposalId);
    if (proposal) {
      proposals.push(proposal);
    }
  }
  res.status(202).send({
    ...jobPost,
    proposals: proposals,
  });
});

app.post("/api/v1/jobs/:id/proposals", async (req: any, res) => {
  if (!req.params.id || !req.headers['username'] || !req.body.coverletter || !req.body.amount) {
    return res.status(400).send({ error: 'Missing job post id, username, coverletter, or amount' });
  }
  const username = req.headers['username'];
  const jobPost = jobPostDatabase.get(req.params.id);
  if (!jobPost) {
    return res.status(404).send({ error: 'Job post not found' });
  }
  const proposal: Proposal = {
    id: uuidv4(),
    freelancer: username,
    coverletter: req.body.coverletter,
    amount: req.body.amount,
  }
  proposalDatabase.set(proposal.id, proposal);
  jobPost.proposal.push(proposal.id);
  res.status(202).send(proposal);
});

app.get("/api/v1/jobs/:id/proposals/:proposalId", async (req: any, res) => {
  const proposal = proposalDatabase.get(req.params.proposalId);
  if (!proposal) {
    return res.status(404).send({ error: 'Proposal not found' });
  }
  res.status(202).send(proposal);
});

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
  let address;
  const payee = req.body.payee;
  if (payee === 'tom_admin') {
    address = config.HOST1_ADMIN_ADDRESS;
  } else if (payee === 'frank_freelancer') {
    address = config.HOST2_FREELANCER_ADDRESS;
  } else if (payee === 'calvin_client') {
    address = config.HOST3_CLIENT_ADDRESS;
  }
  try {
    await firefly.invokeContractAPI(coinApiName, "transfer", {
      input: {
        to: address,
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
  // check if the request has a contract, amount, and freelancer address
  if (!req.body.title || !req.headers['username'] || !req.body.contract || req.body.amount === undefined && req.body.amount >= 0 || !req.body.freelancer) {
    return res.status(400).send({ error: 'Missing title, username,contract, amount, or freelancer address' });
  }

  // we are using the hash of the contract content as the cid, it is imperative that the contract content is unique.
  // the contract will return error if the cid already exists
  const contractContent = req.body.contract;
  const hash = crypto.createHash('sha256').update(contractContent).digest('hex');

  // this is messy 
  // the username 'calvin_client' represents an off-chain identity (again, its a username) that only exists within this database
  // however, this 'client' identity can also act as a freelancer in a contract.
  let freelancerAddress;
  let clientAddress;
  if (req.headers['username'] === 'adam_admin') {
    clientAddress = config.HOST1_ADMIN_ADDRESS;
  } else if (req.headers['username'] === 'frank_freelancer') {
    clientAddress = config.HOST2_FREELANCER_ADDRESS;
  } else if (req.headers['username'] === 'calvin_client') {
    clientAddress = config.HOST3_CLIENT_ADDRESS;
  } else {
    return res.status(400).send({ error: 'Invalid username' });
  }

  if (req.body.freelancer === 'adam_admin') {
    freelancerAddress = config.HOST1_ADMIN_ADDRESS;
  } else if (req.body.freelancer === 'frank_freelancer') {
    freelancerAddress = config.HOST2_FREELANCER_ADDRESS;
  } else if (req.body.freelancer === 'calvin_client') {
    freelancerAddress = config.HOST3_CLIENT_ADDRESS;
  } else {
    return res.status(400).send({ error: 'Invalid freelancer' });
  }

  try {
    // authorize the escrow contract to spend the client's funds, with new allowance
    await firefly.invokeContractAPI(coinApiName, "approve", {
      input: {
        spender: config.ESCROW_ADDRESS,
        // infinite allowance for now
        amount: 2147483647,
      }
    });

    await firefly.invokeContractAPI(escrowApiName, "createAgreement", {
      input: {
        _freelancer: freelancerAddress,
        _amount: req.body.amount,
        _cid: hash,
      },
    });
    // add the contract to the contract database
    const newContract = {
      title: req.body.title,
      contract: req.body.contract,
      client: {
        address: clientAddress,
        username: req.headers['username'],
      },
      freelancer: {
        address: freelancerAddress,
        username: req.body.freelancer,
      }
    }
    contractDatabase.set(hash, newContract);
    res.status(202).send({
      cid: hash,
      amount: req.body.amount,
      ...newContract,
      handshake: false
    });
  } catch (e: any) {
    // console.log(e)
    res.status(500).send({
      error: e.message,
    });
  }
});

app.get("/api/v1/contracts/:cid", async (req : any, res) => {
  const firefly = req.firefly;
  const hash = req.params.cid;
  const contractContent = contractDatabase.get(hash);
  if (!contractContent) {
    return res.status(404).send({ error: 'Contract not found' });
  }
  try {
    const fireflyRes = await firefly.queryContractAPI(escrowApiName, "getAgreement", {
      input: {
        _cid: req.params.cid,
      },
    });
    // combine the contract content with the agreement data
    const agreementData = {
      cid: hash,
      ...contractContent,
      amount : fireflyRes.output.amount,
      handshake: fireflyRes.output.handshake,
    };
    res.status(202).send(agreementData);
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts/:cid/sign", async (req : any, res) => {
  const firefly = req.firefly;
  try {
    await firefly.invokeContractAPI(escrowApiName, "approve", {
      input: {
        _cid: req.params.cid,
      },
    });
    res.status(202).send();
  } catch (e: any) {
    res.status(500).send({
      error: e.message,
    });
  }
});

app.post("/api/v1/contracts/:cid/releaseFunds", async (req: any, res) => {
  const firefly = req.firefly;
  if (req.body.amount === undefined || req.body.amount < 0) {
    return res.status(400).send({ error: 'Missing amount' });
  }
  // if the user isn't the contract client, they cannot release funds
  if (req.headers['username'] !== contractDatabase.get(req.params.cid)?.client.username) {
    return res.status(400).send({ error: 'You are not the contract client' });
  }
  try {
    await firefly.invokeContractAPI(escrowApiName, "releaseFunds", {
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

app.post("/api/v1/contracts/:cid/addFunds", async (req: any, res) => {
  const firefly = req.firefly;
  if (req.body.amount === undefined || req.body.amount < 0) {
    return res.status(400).send({ error: 'Missing amount' });
  }
  // if the user isn't the contract client, they cannot add funds
  if (req.headers['username'] !== contractDatabase.get(req.params.cid)?.client.username) {
    return res.status(400).send({ error: 'You are not the contract client' });
  }
  try {
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
