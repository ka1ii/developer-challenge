// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./coin.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @dev A simple escrow contract that references job agreements using IPFS CIDs as keys
 */
contract Escrow is ReentrancyGuard {
    IERC20 public token;
    event Handshake(string cid);
    event ReleaseFunds(string cid, uint256 amount);
    event AddFunds(string cid, uint256 amount);
    event CreateAgreement(
        string cid,
        address client,
        address freelancer,
        uint256 amount
    );

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @dev Agreement struct, the client creates the agreement and the freelancer can approve it
     */
    struct Agreement {
        address payable client; // The party depositing funds
        address payable freelancer; // The party who will receive funds
        bool handshake; // Whether the freelancer has approved the escrow contract
        uint256 amount; // The total amount held in escrow
    }

    /**
     * @dev Mapping from IPFS CID (string) to the Agreement struct
     *
     * Example usage:
     *  - IPFS CID: "QmXYZ1234..." (the key)
     *  - Agreement struct holds client, freelancer, amount, etc.
     */
    mapping(string => Agreement) public agreements;

    /**
     * @dev Create a new agreement referencing an IPFS CID.
     *
     * Requirements:
     *  - `_cid` should be unique, if an agreement with the same CID already exists, this will return an error
     */
    function createAgreement(
        string calldata _cid,
        address payable _freelancer,
        uint256 _amount
    ) external {
        // ensures that an agreement with the same CID does not already exist
        require(
            agreements[_cid].client == address(0),
            "Agreement with this CID already exists"
        );
        Agreement storage ag = agreements[_cid];

        ag.client = payable(msg.sender);
        ag.freelancer = payable(_freelancer);
        ag.handshake = false;

        // Transfer tokens from the client to the escrow contract
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        ag.amount = _amount;
        emit CreateAgreement(_cid, msg.sender, _freelancer, _amount);
    }

    /**
     * @dev Add funds to the escrow
     * Requirements:
     *  - The caller must be the client
     *  - The agreement must exist
     */
    function addFunds(string calldata _cid, uint256 _amount) external {
        Agreement storage ag = agreements[_cid];
        require(msg.sender == ag.client, "Only client can add funds");
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        ag.amount += _amount;
        emit AddFunds(_cid, _amount);
    }

    /**
     * @dev Release funds to the freelancer. Only the original client can do this for now.
     *
     * Requirements:
     *  - The caller must be the client
     *  - The amount to release must be less than or equal to the total amount in escrow
     */
    function releaseFunds(
        string calldata _cid,
        uint256 _amount
    ) external nonReentrant {
        Agreement storage ag = agreements[_cid];

        // Ensure caller is the client
        require(
            ag.handshake,
            "Freelancer must approve the escrow contract first"
        );
        require(msg.sender == ag.client, "Only client can release funds");
        require(
            _amount <= ag.amount,
            "Amount to release exceeds total escrowed amount"
        );
        // Transfer escrowed amount to freelancer
        require(
            token.transfer(ag.freelancer, _amount),
            "Token transfer failed"
        );

        // reset amount to 0 to prevent re-entrancy issues
        ag.amount -= _amount;
        emit ReleaseFunds(_cid, _amount);
    }

    /**
     * @dev Approve the escrow contract
     *
     * Requirements:
     *  - The caller must be the freelancer
     */
    function approve(string calldata _cid) external {
        Agreement storage ag = agreements[_cid];
        require(msg.sender == ag.freelancer, "Only freelancer can approve");
        ag.handshake = true;
        emit Handshake(_cid);
    }

    /**
     * @dev Get information about a specific agreement, a default Agreement struct is returned if the CID is not found
     */
    function getAgreement(
        string calldata _cid
    ) external view returns (Agreement memory) {
        return agreements[_cid];
    }
}
