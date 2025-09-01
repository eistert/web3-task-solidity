// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
✅ 创建一个名为Voting的合约，包含以下功能：
一个mapping来存储候选人的得票数
一个vote函数，允许用户投票给某个候选人
一个getVotes函数，返回某个候选人的得票数
一个resetVotes函数，重置所有候选人的得票数
 */

/// @title Voting - 简单投票合约（含重置&候选人列表）
/// @notice 用 string 作为候选人ID，演示 data location 与重载写法
contract Voting {
    // 候选人 -> 票数
    mapping(string => uint256) private _votes;

    // 是否已收录，用于给 _candidates 去重
    mapping(string => bool) private _seen;
    
    // 可遍历的候选人列表（用于 reset / 前端展示）
    string[] private _candidates;

    address public owner;

    // 这是事件声明（不是函数），用于把发生的关键动作写进链上日志（供前端/索引服务监听）。
    event Voted(address indexed voter, string candidate, uint256 newCount);
    // indexed 让你可以按投票人/操作者地址做筛选查询。
    event VotesReset(address indexed by);

    modifier onlyOwner() {
        // 只有“当前直接调用者”是 owner 才能继续
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @param initialCandidates 部署时可选的初始候选人（memory）
    constructor(string[] memory initialCandidates) {
        owner = msg.sender;
        for (uint256 i = 0; i < initialCandidates.length; i++) {
            // 这里是 memory 实参，走 memory 版本的重载
            _addCandidateIfNew(initialCandidates[i]);
        }
    }

    /// @notice 给候选人投一票；如首次出现会自动加入候选人列表
    function vote(string calldata candidate) external {
        // 这里是 calldata 实参，走 calldata 版本的重载（零拷贝到这里）
        _addCandidateIfNew(candidate);
        uint256 newCount = ++_votes[candidate];
        emit Voted(msg.sender, candidate, newCount); // 写一条投票日志（事件）
    }

    /// @notice 查询某候选人的得票
    function getVotes(string calldata candidate) external view returns (uint256) {
        return _votes[candidate];
    }

    /*
    @notice 重置所有候选人的票数为 0（仅 owner）
    onlyOwner 修饰器先检查 msg.sender == owner（不是 owner 会 revert）。
    最后 emit VotesReset(...) 记一条“有人清空了计票”的事件日志，便于审计/前端刷新。
     */ 
    function resetVotes() external onlyOwner {
        for (uint256 i = 0; i < _candidates.length; i++) {
            _votes[_candidates[i]] = 0;
        }
        emit VotesReset(msg.sender);
    }

    /// @notice  列出当前所有候选人 （可选）
    function listCandidates() external view returns (string[] memory) {
        return _candidates;
    }

    // ---------- 内部工具（重载：calldata / memory 各一份） ----------
    function _addCandidateIfNew(string memory candidate) internal {
        if (!_seen[candidate]) {
            _seen[candidate] = true;
            _candidates.push(candidate); // 从 memory 拷贝到 storage
        }
    }
}
