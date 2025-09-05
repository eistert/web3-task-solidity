// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RomanToInteger {

    /*
    总结一句话
    这段代码用“前后对比”的经典法则实现了罗马数字到整数的转换：
    前小后大 → 减；否则 → 加，循环处理“上一个字符”，最后再把最后一个加上即可。
    */
    // pure 既不读也不改合约状态；只能用参数、局部变量、常量做计算。
    function romanToInt(string memory s) public pure returns (uint256) { // XIV
        bytes memory bs = bytes(s);
        require(bs.length > 0, "empty");

        int256 sum;
        int256 pre = getValue(bs[0]); // 10

        for (uint256 i = 1; i < bs.length; i++) {

            // cur = I = 1 
            // cur = V = 5
            int256 cur = getValue(bs[i]); 

            if (pre < cur) {
                sum -= pre;
            } else {
                sum += pre;
            }

            pre = cur;
        }

        int256 r = sum + pre;

        require(r >= 0, "invalid numeral"); // 理论上不会负，保险起见
        return uint256(r);
    }

    // 没有 switch，用 if/else；用 ASCII 十六进制（更稳）
    function getValue(bytes1 c) internal pure returns (int256) {
        if (c == 0x49) return 1; // 'I'
        if (c == 0x56) return 5; // 'V'
        if (c == 0x58) return 10; // 'X'
        if (c == 0x4C) return 50; // 'L'
        if (c == 0x43) return 100; // 'C'
        if (c == 0x44) return 500; // 'D'
        if (c == 0x4D) return 1000; // 'M'
        return 0;
    }
}
