// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IntegerToRoman {
    
    /// @notice 将 1..3999 的十进制整数转换为罗马数字
    function intToRoman(uint256 num) public pure returns (string memory) {
        require(num >= 1 && num <= 3999, "out of range (1..3999)");

        // 贪心表（从大到小），与 LeetCode 同顺序：
        // 1000(M), 900(CM), 500(D), 400(CD), 100(C), 90(XC), 50(L), 40(XL), 10(X), 9(IX), 5(V), 4(IV), 1(I)
        uint16[13] memory values = [
            uint16(1000), 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1
        ];
        string[13] memory symbols = [
            "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"
        ];

        // 逐项贪心拼接
        bytes memory out = bytes("");
        for (uint256 i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                // 追加当前符号，并扣减数值
                out = bytes.concat(out, bytes(symbols[i]));
                num -= values[i];
            }
            if (num == 0) break;
        }
        return string(out);
    }
}
