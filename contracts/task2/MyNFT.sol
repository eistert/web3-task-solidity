// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A simple ERC-721 NFT with per-token URI (IPFS) — OZ v5
contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId; // 默认从 0 开始（想从 1 开始可改为 ++_nextTokenId）

    constructor(
        string memory name_,
        string memory symbol_
    )
        ERC721(name_, symbol_)
        Ownable(msg.sender) // v5: 显式设置初始 owner
    {}

    /// @notice 仅 owner 可铸造；传入接收地址和元数据(如 ipfs://...)链接
    function mintNFT(address to, string memory metadataURI) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++; // 若想从1开始：tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
    }
}
