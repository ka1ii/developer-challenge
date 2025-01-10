# Backend: Kaleido Developer Challenge

A very simple TypeScript Node.js app that uses the FireFly SDK to interact with the [example solidty smart contracts](../solidity/contracts/).

## Configuration

To deploy the backend, make sure there are three firefly supernodes running and solidity contracts are deployed on the created chain.
Once deployed, populate these values in your config.json

"COIN_ADDRESS": ,
"ESCROW_ADDRESS": ,
"HOST1_ADMIN": ,
"HOST1_ADMIN_ADDRESS": ,
"HOST2_FREELANCER": ,
"HOST2_FREELANCER_ADDRESS":,
"HOST3_CLIENT": ,
"HOST3_CLIENT_ADDRESS": ,
"NAMESPACE": "default",
"VERSION": "0.0.0",
"PORT": 8000

## Run

```bash
npm install
npm start
```

## Who is making all these blockchain transactions?

This might help: `ff accounts list <StackName>`
With further [docs here](https://hyperledger.github.io/firefly/latest/reference/identities/)
