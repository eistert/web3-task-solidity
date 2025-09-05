// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MergeSortedArray {
    /// @notice 合并两个已升序排序的 int256 数组，返回升序新数组
    function mergeSortedInt(int256[] memory a, int256[] memory b) public pure returns (int256[] memory) {
        uint256 n = a.length;
        uint256 m = b.length;
        int256[] memory res = new int256[](n + m);

        uint256 i; // a 的指针
        uint256 j; // b 的指针
        uint256 k; // res 的写入指针

        // 双指针归并
        while (i < n && j < m) {
            if (a[i] <= b[j]) {
                res[k++] = a[i++];
            } else {
                res[k++] = b[j++];
            }
        }

        // 追加剩余
        while (i < n) res[k++] = a[i++];
        while (j < m) res[k++] = b[j++];

        return res;
    }

    /// @notice 合并两个已升序排序的 uint256 数组，返回升序新数组
    function mergeSortedUint(uint256[] memory a, uint256[] memory b) public pure returns (uint256[] memory) {
        uint256 n = a.length;
        uint256 m = b.length;
        uint256[] memory res = new uint256[](n + m);

        uint256 i; // a 的指针
        uint256 j; // b 的指针
        uint256 k; // res 的写入指针

        while (i < n && j < m) {
            if (a[i] <= b[j]) {
                res[k++] = a[i++];
            } else {
                res[k++] = b[j++];
            }
        }
        while (i < n) res[k++] = a[i++];
        while (j < m) res[k++] = b[j++];

        return res;
    }
}
