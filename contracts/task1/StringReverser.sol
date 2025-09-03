// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StringReverser {
    /// @notice 反转 ASCII 字符串（按字节反转；"abcde" -> "edcba"）
    /// @dev 适用于英文/数字等单字节字符；多字节 UTF-8 会乱码
    function reverseAscii(string memory s) public pure returns (string memory) {
        bytes memory b = bytes(s);
        uint256 n = b.length;
        if (n == 0) return "";

        bytes memory out = new bytes(n);
        for (uint256 i = 0; i < n; i++) {
            out[i] = b[n - 1 - i];
        }

        return string(out);
    }

    // 左右指针
    function reverseString(string memory s) public pure returns (string memory) {
        bytes memory b = bytes(s);
        uint256 n = b.length;
        if (n == 0) return s;

        uint256 left = 0;
        uint256 right = n - 1;

        while (left < right) {
            bytes1 tmp = b[left];
            b[left] = b[right];
            b[right] = tmp;
            unchecked {
                left++;
                right--;
            } // 有 while 条件保护，可用 unchecked 微省 gas
        }
        return string(b);
    }
}
