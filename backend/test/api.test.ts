import { expect } from "chai";
import request from "supertest";
import {app} from "../src/index";
import config from "../config.json";
import { describe, it } from "mocha";

// purpose of this test is to check the api endpoints are functioning, not necessarily the logic of the escrow contract
// thus there won't be integration tests that combines multiple api calls.
// solidity tests are stored in the solidity/test folder

describe("API Endpoints", function () {

  const freelancerAddress = config.HOST2_FREELANCER_ADDRESS;
  const randomAddress = config.HOST1_ADMIN_ADDRESS;

  //
  // --- 1) Testing /api/v1/wallet/mint (POST) ---
  //
  describe("POST /api/v1/wallet/mint", function () {
    // checking if the mint was successful will be done in balance tests
    it("should mint tokens successfully for a valid user (admin) and amount", async function () {
      const res = await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "admin")
        .send({ amount: 100 });
      expect(res.status).to.equal(202);
    });

    it("should fail if username header is invalid or missing", async function () {
      const res = await request(app)
        .post("/api/v1/wallet/mint")
        .send({ amount: 100 });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error", "Invalid username");
    });

    it("should fail if amount is not provided or invalid", async function () {
      const res = await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "admin")
        .send({}); // no amount
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error");
    });
  });

  //
  // --- 2) Testing GET /api/v1/wallet/balance ---
  //
  describe("GET /api/v1/wallet/balance", function () {
    it("should get the wallet balance for the client user", async function () {
      const res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("username", "client")
        .send({});
      
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("balance");
    });

    it("should have updated balance after minting", async function () {
      let res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("username", "admin")
        .send({});
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("balance");

      const balance = res.body.balance;
      
      res = await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "admin")
        .send({ amount: 100 });
      expect(res.status).to.equal(202);

      res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("username", "admin")
        .send({});
      expect(res.status).to.equal(202);
      // because calls are async, we cannot gurantee that the mint is completed before the balance is updated, or if the 
      // mint tests are run before our check balance.
      expect(Number(res.body.balance)).to.greaterThanOrEqual(Number(balance));
    });

    it("should return 400 if invalid username is used", async function () {
      const res = await request(app)
        .get("/api/v1/wallet/balance");
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error", "Invalid username");
    });
  });

  //
  // --- 3) Testing POST /api/v1/wallet/transfer ---
  //
  describe("POST /api/v1/wallet/transfer", function () {
    it("should transfer tokens from one address to anohter", async function () {
      const res = await request(app)
        .post("/api/v1/wallet/transfer")
        .set("username", "admin")
        .send({
          address: freelancerAddress,
          amount: 10
        });
      expect(res.status).to.equal(202);
    });

    it("should fail if the user has insufficient balance or other FireFly error", async function () {
      // Attempt to transfer an excessively large amount
      const res = await request(app)
        .post("/api/v1/wallet/transfer")
        .set("username", "admin")
        .send({
          address: freelancerAddress,
          amount: 9999999999
        });
      expect(res.status).to.equal(500);

      expect(res.body).to.have.property("error");
    });
  });

  //
  // --- 4) Testing POST /api/v1/contracts (create a new agreement) ---
  //
  describe("POST /api/v1/contracts", function () {
    it("should create a new escrow contract agreement successfully", async function () {
      const body = {
        freelancer: freelancerAddress,
        amount: 0
      };
      const res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "client")
        .send(body);

      expect(res.status).to.equal(202);

      expect(res.body).to.have.property("cid");
    });


    it("should fail if 'amount' is missing", async function () {
      const res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "client")
        .send({}); 
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("error");
    });
  });

  //
  // --- 5) Testing GET /api/v1/contracts/:cid (retrieve agreement) ---
  //
  describe("GET /api/v1/contracts/:cid", function () {
    it("should retrieve the agreement details successfully", async function () {
      // create a new agreement
      const body = {
        freelancer: freelancerAddress,
        amount: 0
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .get(`/api/v1/contracts/${createdCid}`)
        .set("username", "client");
      expect(res.status).to.equal(202);

      expect(res.body).to.have.property("output");
      expect(res.body.output).to.have.property("client");
      expect(res.body.output).to.have.property("freelancer");
      expect(res.body.output).to.have.property("amount");
    });

    it("should return default agreement if cid does not exist", async function () {
      const res = await request(app)
        .get(`/api/v1/contracts/fakecid-123`)
        .set("username", "client");
      expect(res.status).to.equal(202); 
      expect(res.body).to.have.property("output");
      expect(res.body.output).to.have.property("client");
      expect(res.body.output).to.have.property("freelancer");
      expect(res.body.output).to.have.property("amount");
      // the client address is 0
      expect(res.body.output.client).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  //
  // --- 6) Testing POST /api/v1/contracts/:cid/sign ---
  //
  describe("POST /api/v1/contracts/:cid/sign", function () {
    it("should allow the freelancer written in the contract to 'handshake'", async function () {

      // create a new contract
      const body = {
        freelancer: freelancerAddress,
        amount: 0
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .post(`/api/v1/contracts/${createdCid}/sign`)
        .set("username", "freelancer")
        .send({});
      expect(res.status).to.equal(202);

      res = await request(app)
        .get(`/api/v1/contracts/${createdCid}`)
        .set("username", "client");
      expect(res.status).to.equal(202);
      expect(res.body.output.freelancer).to.equal(freelancerAddress);
      // the handshake variable should be true
      expect(res.body.output.handshake).to.equal(true);
    });

    it("should fail if the user (any user except the indicated freelancer) is not allowed to sign this contract", async function () {
      // create a new contract  
      const body = {
        freelancer: freelancerAddress,
        amount: 0
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .post(`/api/v1/contracts/${createdCid}/sign`)
        .set("username", "admin")
        .send({});
      expect(res.status).to.equal(500); 
      expect(res.body).to.have.property("error");
    });
  });

  //
  // --- 7) Testing GET /api/v1/wallet/decimals ---
  //
  describe("GET /api/v1/wallet/decimals", function () {
    it("should return the token decimals", async function () {
      const res = await request(app)
        .get("/api/v1/wallet/decimals")
        .set("username", "client");
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("decimals");
    });

    it("should fail if invalid user header", async function () {
      const res = await request(app).get("/api/v1/wallet/decimals");
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error", "Invalid username");
    });
  });
});
