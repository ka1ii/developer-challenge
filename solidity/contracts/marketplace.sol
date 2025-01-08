// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./coin.sol";

contract Marketplace {
    Coin public coin;

    struct Post {
        address freelancer;
        address client;
    }

    mapping(string => Post) public postings;

    event PostCreated(string ipfs_id, address client, address freelancer);

    constructor(address _coinAddress) {
        coin = Coin(_coinAddress);
    }

    function createPost(string memory ipfs_id, address client) public {
        postings[ipfs_id] = Post(msg.sender, client);
        emit PostCreated(ipfs_id, msg.sender, client);
    }

    function getPosts(string memory ipfs_id) public view returns (Post memory) {
        return postings[ipfs_id];
    }
}
