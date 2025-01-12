import { expect } from "chai";
import request from "supertest";
import {app} from "../src/index";
import config from "../config.json";
import { describe, it } from "mocha";
import { v4 as uuidv4 } from 'uuid';
// purpose of this test is to check the api endpoints are functioning, not necessarily the logic of the escrow contract
// thus there won't be integration tests that combines multiple api calls.
// solidity tests are stored in the solidity/test folder

describe("API Endpoints", function () {

  // for some reason the first three POST transactions to the blockchain (upon deploying a new contract) will stuck in pending forever, so we will call them here
  describe("POST /api/v1/wallet/mint", function () {
    it("should mint token unsuccessfully the first three times upon deploying a new contract", async function () {
       await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "adam_admin")
        .send({ amount: 100 });
      await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "adam_admin")
        .send({ amount: 100 });
      await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "adam_admin")
        .send({ amount: 100 });
    });
  });

  //
  // --- 1) Testing /api/v1/wallet/mint (POST) ---
  //
  describe("POST /api/v1/wallet/mint", function () {
    // checking if the mint was successful will be done in balance tests
    it("should mint tokens successfully for a valid user (admin) and amount", async function () {
      const res = await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "adam_admin")
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
        .set("username", "adam_admin")
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
        .set("username", "calvin_client")
        .send({});
      
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("balance");
    });

    it("should have updated balance after minting", async function () {
      let res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("username", "adam_admin")
        .send({});
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("balance");

      const balance = res.body.balance;
      
      res = await request(app)
        .post("/api/v1/wallet/mint")
        .set("username", "adam_admin")
        .send({ amount: 100 });
      expect(res.status).to.equal(202);

      res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("username", "adam_admin")
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
        .set("username", "adam_admin")
        .send({
          payee: "frank_freelancer",
          amount: 10
        });
      expect(res.status).to.equal(202);
    });

    it("should fail if the user has insufficient balance or other FireFly error", async function () {
      // Attempt to transfer an excessively large amount
      const res = await request(app)
        .post("/api/v1/wallet/transfer")
        .set("username", "adam_admin")
        .send({
          payee: "frank_freelancer",
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
        freelancer: "frank_freelancer",
        amount: 0,
        // add a random string to the contract to ensure it is unique, we cannot have two contract with the same hash
        contract: "Sample contract content" + uuidv4(),
        title: "Sample contract title"
      };
      const res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "calvin_client")
        .send(body);

      expect(res.status).to.equal(202);

      expect(res.body).to.have.property("cid");
    });


    it("should fail if 'amount' is missing", async function () {
      const res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "calvin_client")
        .send({}); 
      expect(res.status).to.equal(400);
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
        freelancer: "frank_freelancer",
        amount: 0, 
        contract: "Sample contract content" + uuidv4(),
        title: "Sample contract title"
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "calvin_client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .get(`/api/v1/contracts/${createdCid}`)
        .set("username", "calvin_client");
      expect(res.status).to.equal(202);

      expect(res.body).to.have.property("contract");
    });

    it("should return 404 if cid does not exist", async function () {
      const res = await request(app)
        .get(`/api/v1/contracts/fakecid-123`)
        .set("username", "calvin_client");
      expect(res.status).to.equal(404); 
      expect(res.body).to.have.property("error");
      expect(res.body.error).to.equal("Contract not found");
    });
  });

  //
  // --- 6) Testing POST /api/v1/contracts/:cid/sign ---
  //
  describe("POST /api/v1/contracts/:cid/sign", function () {
    it("should allow the freelancer written in the contract to 'handshake'", async function () {

      // create a new contract
      const body = {
        freelancer: "frank_freelancer",
        amount: 0,
        contract: "Sample contract content" + uuidv4(),
        title: "Sample contract title"
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "calvin_client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .post(`/api/v1/contracts/${createdCid}/approve`)
        .set("username", "frank_freelancer")
        .send({});
      expect(res.status).to.equal(202);

      res = await request(app)
        .get(`/api/v1/contracts/${createdCid}`)
        .set("username", "calvin_client");
      expect(res.status).to.equal(202);
      expect(res.body.freelancer.username).to.equal("frank_freelancer");
      // the handshake variable should be true
      expect(res.body.handshake).to.equal(true);
    });

    it("should fail if the user (any user except the indicated freelancer) is not allowed to sign this contract", async function () {
      // create a new contract  
      const body = {
        freelancer: "frank_freelancer",
        amount: 0,
        contract: "Sample contract content" + uuidv4(),
        title: "Sample contract title"
      };
      let res = await request(app)
        .post("/api/v1/contracts")
        .set("username", "calvin_client")
        .send(body);
      let createdCid = res.body.cid;

      res = await request(app)
        .post(`/api/v1/contracts/${createdCid}/approve`)
        .set("username", "adam_admin")
        .send({});
      expect(res.status).to.equal(400); 
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
        .set("username", "calvin_client");
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("decimals");
    });

    it("should fail if invalid user header", async function () {
      const res = await request(app).get("/api/v1/wallet/decimals");
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error", "Invalid username");
    });
  });

  //
  // --- 8) Testing GET /api/v1/jobs ---
  //
  describe("GET /api/v1/jobs", function () {
    it("should return all job posts for the job post owner including proposals", async function () {
      // create a new job post
      const jobData = {
        title: "Job for Adam Admin",
        description: "Adam Admin's job description",
        budget: 500,
      };
      let res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "adam_admin")
        .send(jobData);

      res = await request(app)
        .get("/api/v1/jobs")
        .set("username", "adam_admin");
      expect(res.status).to.equal(202);
      res.body.forEach((job: any) => {
        if (job.owner === "admin") {
          expect(job).to.have.property("proposal");
        }
      });
    });

    it("should return job posts without proposals for non-owners", async function () {
      // create a new job post
      const jobData = {
        title: "Job for Admin",
        description: "Admin's job description",
        budget: 500,
      };
      let res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "calvin_client")
        .send(jobData);

      res = await request(app)
        .get("/api/v1/jobs")
        .set("username", "frank_freelancer");
      expect(res.status).to.equal(202);
      res.body.forEach((job: any) => {
        if (job.owner !== "freelancer") {
          expect(job).to.not.have.property("proposal");
        }
      });
    });
  });

  //
  // --- 9) Testing POST /api/v1/jobs ---
  //
  describe("POST /api/v1/jobs", function () {
    it("should create a new job post", async function () {
      const jobData = {
        title: "New Job",
        description: "Job description",
        budget: 1000,
      };
      const res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "calvin_client")
        .send(jobData);
      expect(res.status).to.equal(202);
      expect(res.body).to.include(jobData);
      expect(res.body).to.have.property("id");
      expect(res.body.owner).to.equal("calvin_client");
    });
  });

  //
  // --- 10) Testing GET /api/v1/jobs/:id ---
  //
  describe("GET /api/v1/jobs/:id", function () {
    it("should return the job post with proposals for the job post owner", async function () {
      const jobData = {
        title: "Owner's Job",
        description: "Owner's job description",
        budget: 500,
      };
      let res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "adam_admin")
        .send(jobData);
      const jobId = res.body.id;

      res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("username", "adam_admin");
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("proposal");
    });

    it("should return the job post without proposals for non-owners", async function () {
      const jobData = {
        title: "Non-owner's Job",
        description: "Non-owner's job description",
        budget: 300,
      };
      let res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "calvin_client")
        .send(jobData);
      const jobId = res.body.id;

      res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("username", "frank_freelancer");
      expect(res.status).to.equal(202);
      expect(res.body).to.not.have.property("proposal");
    });

    it("should return 404 if job post does not exist", async function () {
      const res = await request(app)
        .get("/api/v1/jobs/nonexistent-id")
        .set("username", "calvin_client");
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Job post not found");
    });
  });

  //
  // --- 11) Testing POST /api/v1/jobs/:id/proposals ---
  //
  describe("POST /api/v1/jobs/:id/proposals", function () {
    it("should add a proposal to a job post", async function () {
      const jobData = {
        title: "Job for Proposal",
        description: "Job description for proposal",
        budget: 200,
      };
      let res = await request(app)
        .post("/api/v1/jobs")
        .set("username", "calvin_client")
        .send({jobData});
      const jobId = res.body.id;

      const proposalData = {
        coverletter: "This is my proposal",
        amount: 150,
      };
      res = await request(app)
        .post(`/api/v1/jobs/${jobId}/proposals`)
        .set("username", "frank_freelancer")
        .send(proposalData);
      expect(res.status).to.equal(202);
      expect(res.body).to.have.property("amount");
      expect(res.body).to.have.property("coverletter");
    });

    it("should return 404 if job post does not exist", async function () {
      const proposalData = {
        coverletter: "Proposal for non-existent job",
        amount: 100,
      };
      const res = await request(app)
        .post("/api/v1/jobs/nonexistent-id/proposals")
        .set("username", "frank_freelancer")
        .send(proposalData);
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Job post not found");
    });
  });
});

