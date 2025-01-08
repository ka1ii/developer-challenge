// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./coin.sol";

contract Marketplace {
    Coin public coin;

    struct Post {
        address seller;
        string id;
        string title;
    }

    Post[] public posts;

    constructor(address _coinAddress) {
        coin = Coin(_coinAddress);
    }

    function createPost(string memory _id, string memory _title) public {
        posts.push(Post(msg.sender, _id, _title));
    }

    function getPosts() public view returns (Post[] memory) {
        return posts;
    }
}
