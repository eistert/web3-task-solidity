// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SimpleERC20 - 教学用最小实现（参考 IERC20）
/// @notice 仅合约 owner 可增发
contract SimpleERC20 {
    // ---- 元数据 ----
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    // ---- ERC20 状态  总发行量----
    uint256 public totalSupply;

    // Solidity 会自动生成同名的 getter 函数
    mapping(address => uint256) public balanceOf; // 用户地址的余额。
    mapping(address => mapping(address => uint256)) public allowance;

    // ---- Ownable ---- 简单的所有者地址，用来限制 mint 权限。
    address public owner;

    // onlyOwner 用于保护 增发 和 换 owner 等敏感操作。
    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: not owner");
        _;
    }

    // ---- 事件（与 ERC20 标准一致）---- 对外可观察的“日志”
    // 标准要求：转账必须 emit Transfer(from, to, amount)；
    // 授权必须 emit Approval(owner, spender, amount)。
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // 构造时初始化元数据与 owner。
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals; // 一般为 18
        owner = msg.sender;
    }

    // ---- 基础转账 ----
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    // ---- 授权 ----
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // ---- 代扣转账 ----
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ERC20: insufficient allowance");

        _transfer(from, to, amount);

        // 允许“无限授权”不扣减
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }

        return true;
    }

    // ---- 仅 owner 可增发 ----
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // ---- 可选：转移所有权 ----
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        owner = newOwner;
    }

    // ---- 内部逻辑 ----
    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ERC20: to zero");

        uint256 fromBal = balanceOf[from];
        require(fromBal >= amount, "ERC20: insufficient balance");

        unchecked {
            balanceOf[from] = fromBal - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to zero");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
