// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BeggingContract
 * @notice 允许任何人捐款（向合约转 ETH），记录每个地址累计捐款，
 *         拥有者可以提走合约全部余额。
 *         额外：捐赠事件、TOP3 排行、捐赠时间窗口（可选）。
 */
contract BeggingContract is Ownable {
    /// @dev 每个地址累计捐赠的金额
    mapping(address => uint256) public donations;

    /// @dev 总筹集金额
    uint256 public totalRaised;

    /// @dev 捐赠开放时间窗口（0 表示不限制）
    uint64 public startTime; // 含
    uint64 public endTime; // 含

    /// @dev TOP3 地址（按累计金额降序维护）
    address[3] private _topAddrs;

    /// ===== Events =====
    // 事件用于链上检索与前端监听，indexed 让你可以按地址过滤日志。
    // 有人捐钱时发出，携带捐赠者、金额、合约累计总额。
    event Donation(address indexed donor, uint256 amount);
    // 所有者提现时发出，携带收款地址、金额。
    event Withdraw(address indexed to, uint256 amount);

    event TimeWindowUpdated(uint64 startTime, uint64 endTime);

    /// @dev 构造函数（时间窗口传 0 表示不限制）
    /// Ownable v5 需要把 msg.sender 传入父构造
    // 这里不强制校验时间先后，主要为了作业简单；想严谨可加
    constructor(uint64 _startTime, uint64 _endTime) Ownable(msg.sender) {
        startTime = _startTime;
        endTime = _endTime;
        if (_endTime != 0) {
            require(_endTime > block.timestamp, "end in past");
            if (_startTime != 0) {
                require(_startTime < _endTime, "start>=end");
            }
        }

        emit TimeWindowUpdated(_startTime, _endTime);
    }

    // ========= 必做功能 =========

    /// @notice 捐款入口（携带 ETH）
    // 必须 payable 才能随交易带 ETH。
    // 用 withinWindow 修饰器保证在合法时间段内。

    function donate() external payable withinWindow {
        require(msg.value > 0, "no value");
        _record(msg.sender, msg.value);
    }

    /// @notice 合约拥有者提现全部余额
    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "empty");
        // 题目要求使用 transfer（仅 2300 gas，真实项目更推荐 call）
        payable(owner()).transfer(bal);
        emit Withdraw(owner(), bal);
    }

    /// @notice 查询某地址累计捐款
    function getDonation(address user) external view returns (uint256) {
        return donations[user];
    }

    // ========= 额外挑战 =========

    /// @notice 设置捐赠时间窗口（仅 owner）
    /// @dev 传 0/0 表示不限制；否则 [start, end] 区间内可捐
    function setTimeWindow(uint64 _start, uint64 _end) external onlyOwner {
        startTime = _start;
        endTime = _end;
        emit TimeWindowUpdated(_start, _end);
    }

    /// @notice 获取前 3 名捐赠者及金额（不足 3 名用 0 地址/0 金额补齐）
    function getTopDonors() external view returns (address[3] memory addrs, uint256[3] memory amounts) {
        for (uint256 i = 0; i < 3; i++) {
            addrs[i] = _topAddrs[i];
            amounts[i] = donations[_topAddrs[i]];
        }
    }

    // ========= 便捷入口 =========

    /// @dev 直接向合约转账也算捐赠
    receive() external payable {
        require(msg.value > 0, "no value");
        _windowCheck();
        _record(msg.sender, msg.value);
    }

    // ========= 内部工具 =========

    // 做了三件事：累计、总额、发事件，再更新排行榜。
    function _record(address donor, uint256 amount) internal {
        donations[donor] += amount;
        totalRaised += amount;
        emit Donation(donor, amount);
        _updateTop(donor);
    }

    modifier withinWindow() {
        _windowCheck();
        _;
    }

    function _windowCheck() internal view {
        if (startTime != 0 || endTime != 0) {
            require(block.timestamp >= startTime && block.timestamp <= endTime, "donation closed");
        }
    }

    /// @dev 维护 Top3（累计金额降序）。元素很少，直接常数时间“冒泡式”处理。
    function _updateTop(address donor) internal {
        address[3] memory arr = _topAddrs;

        // donor 是否已在 Top3 中
        bool present;
        for (uint256 i = 0; i < 3; i++) {
            if (arr[i] == donor) {
                present = true;
                break;
            }
        }

        // 不在 Top3：如果比当前最小的还大，替换掉最小的
        if (!present) {
            uint256 minIdx;
            uint256 minVal = donations[arr[0]];
            for (uint256 i = 1; i < 3; i++) {
                uint256 v = donations[arr[i]];
                if (v < minVal) {
                    minVal = v;
                    minIdx = i;
                }
            }
            if (donations[donor] > minVal) {
                arr[minIdx] = donor;
            }
        }

        // 对 arr 重新按累计金额降序排个 3×3 的小序
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = i + 1; j < 3; j++) {
                if (donations[arr[j]] > donations[arr[i]]) {
                    (arr[i], arr[j]) = (arr[j], arr[i]);
                }
            }
        }

        _topAddrs = arr;
    }
}
