// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BinarySearch
/// @notice 在有序数组上进行二分查找；若不存在返回 -1。
///         另外提供 lowerBound（第一个 >= target 的位置，可能等于 length）。
contract BinarySearch {
    /// -------------------- int256 版本 --------------------

    /// @dev 标准二分：命中返回下标，否则 -1。
    function binarySearchInt(int256[] memory a, int256 target) public pure returns (int256) {
        if (a.length == 0) return -1;

        uint256 l = 0;
        uint256 r = a.length - 1;

        while (l <= r) {
            uint256 mid = l + (r - l) / 2; // 防溢出的取中法
            int256 v = a[mid];

            if (v == target) return int256(mid);
            if (v < target) {
                l = mid + 1;
            } else {
                if (mid == 0) break; // 防止 r = mid - 1 下溢
                r = mid - 1;
            }
        }
        return -1;
    }

    /// @dev lowerBound：返回第一个 >= target 的位置（可能等于 a.length）
    function lowerBoundInt(int256[] memory a, int256 target) public pure returns (uint256) {
        uint256 l = 0;
        uint256 r = a.length; // 采用半开区间 [l, r)

        while (l < r) {
            uint256 mid = l + (r - l) / 2;
            if (a[mid] < target) {
                l = mid + 1;
            } else {
                r = mid;
            }
        }
        return l;
    }

    /// -------------------- uint256 版本 --------------------

    function binarySearchUint(uint256[] memory a, uint256 target) public pure returns (int256) {
        if (a.length == 0) return -1;

        uint256 l = 0;
        uint256 r = a.length - 1;

        while (l <= r) {
            uint256 mid = l + (r - l) / 2;
            uint256 v = a[mid];

            if (v == target) return int256(mid);
            if (v < target) {
                l = mid + 1;
            } else {
                if (mid == 0) break; // 防下溢
                r = mid - 1;
            }
        }
        return -1;
    }

    function lowerBoundUint(uint256[] memory a, uint256 target) public pure returns (uint256) {
        uint256 l = 0;
        uint256 r = a.length;

        while (l < r) {
            uint256 mid = l + (r - l) / 2;
            if (a[mid] < target) {
                l = mid + 1;
            } else {
                r = mid;
            }
        }
        return l;
    }
}
