// hardhat.config.ts
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

function normAccounts() {
  const pk = (PRIVATE_KEY || "").trim();
  if (!pk) return [];
  const with0x = pk.startsWith("0x") ? pk : `0x${pk}`;
  // 验证必须是 0x + 64 个十六进制字符
  if (!/^0x[0-9a-fA-F]{64}$/.test(with0x)) {
    console.warn("⚠️  PRIVATE_KEY 格式不合法，已忽略（需要 32 字节 16进制）。");
    return [];
  }
  return [with0x];
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts: normAccounts(),
      chainId: 11155111,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },

  // 可选：顺便开启 Sourcify 自动验证
  sourcify: { enabled: true },

};

export default config;
