# Building a Private Balance Tracker with Fully Homomorphic Encryption (FHE)

## Introduction

Privacy on the blockchain has always been a challenge. While blockchain technology offers transparency and immutability, these very features can expose sensitive financial information to the public. Enter **Fully Homomorphic Encryption (FHE)** – a groundbreaking cryptographic technique that allows computations on encrypted data without ever decrypting it.

In this tutorial, we'll build a **Private Balance Tracker** smart contract using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), demonstrating how you can create truly private financial applications on Ethereum.

## What is Fully Homomorphic Encryption?

Before diving into the code, let's understand what makes FHE special:

**Traditional Encryption:**
```
Encrypted Data → Decrypt → Compute → Encrypt → Store
```

**Fully Homomorphic Encryption:**
```
Encrypted Data → Compute on Encrypted Data → Store Encrypted Result
```

With FHE, you can:
- ✅ Perform addition, subtraction, multiplication on encrypted numbers
- ✅ Compare encrypted values
- ✅ Keep data private throughout its entire lifecycle
- ✅ Eliminate the need for trusted third parties

## The Problem We're Solving

Imagine you want to track your balance on-chain, but you don't want anyone (including miners, validators, or other users) to know:
- How much you have
- How much you deposit
- How much you withdraw

Traditional smart contracts can't provide this level of privacy because all state variables are visible on the blockchain. With FHE, we can solve this problem elegantly.

---

**Ready to build your own private dApp?** Start with this template and explore the endless possibilities of FHE-enabled smart contracts. The code is yours to use, modify, and extend. Happy building! 🚀🔐

# Private Balance Tracker - FHEVM

A Hardhat-based template for developing a private balance tracking system using Fully Homomorphic Encryption (FHE) enabled Solidity smart contracts with the FHEVM protocol by Zama.

## 🔐 Overview

The Private Balance Tracker is a confidential financial tracking application that demonstrates the power of Fully Homomorphic Encryption on the blockchain. Users can deposit and withdraw encrypted amounts while keeping their balance completely private and confidential.

### Key Features

- **Fully Private Balances**: All balance amounts are encrypted end-to-end
- **Confidential Transactions**: Deposit and withdraw operations on encrypted data
- **Zero Knowledge**: Contract performs computations without revealing sensitive information
- **Decentralized Privacy**: No trusted third party required for privacy guarantees

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** (for testnet)

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```


## Setting Up the Contract

Let's break down our `PrivateBalanceTracker` contract step by step.

## 📁 Project Structure

```
private-balance-tracker/
├── contracts/                      # Smart contract source files
│   └── PrivateBalanceTracker.sol   # Main FHE balance tracker contract
├── deploy/                         # Deployment scripts
├── tasks/                          # Hardhat custom tasks
│   └── PrivateBalanceTracker.ts          # Task definitions for interaction
├── test/                          # Test files
├── hardhat.config.ts              # Hardhat configuration
└── package.json                   # Dependencies and scripts
```

### 1. Imports and Contract Declaration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateBalanceTracker is SepoliaConfig {
```

**Key Components:**

- **`FHE`**: The main library providing encrypted operations
- **`euint32`**: An encrypted 32-bit unsigned integer type
- **`externalEuint32`**: A handle for encrypted inputs from external sources
- **`SepoliaConfig`**: Configuration for deploying on Sepolia testnet

### 2. State Variable - The Encrypted Balance

```solidity
euint32 private _balance;
```

This is where the magic happens! Unlike a normal `uint32`, this `euint32` variable stores an **encrypted** value. Even though it's stored on the blockchain, no one can read its actual value without proper authorization.

**Important Note:** The `private` keyword in Solidity only restricts access within the contract inheritance chain. In traditional contracts, anyone can still read this value from blockchain storage. However, with FHE, the value is **cryptographically** private – it's encrypted data that's meaningless without the decryption key.

### 3. Reading the Balance

```solidity
function getBalance() external view returns (euint32) {
    return _balance;
}
```

This function returns the encrypted balance. The returned `euint32` is still encrypted, so calling this function gives you an encrypted handle, not the actual value.

**How to Decrypt:**
Only authorized addresses (those granted permission via `FHE.allow()`) can decrypt this value using the FHEVM client library on the frontend.

### 4. Depositing Encrypted Amounts

```solidity
function deposit(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // Convert external encrypted input to internal encrypted type
    euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
    
    // Add encrypted amount to encrypted balance (homomorphic addition!)
    _balance = FHE.add(_balance, encryptedEuint32);
    
    // Grant permissions
    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
}
```

Let's break down each step:

#### Step 1: Convert External Input
```solidity
euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
```

When a user wants to deposit, they encrypt the amount on the client side and submit:
- **`inputEuint32`**: A handle to the encrypted value
- **`inputProof`**: A zero-knowledge proof verifying the encryption is valid

The `FHE.fromExternal()` function validates the proof and converts it to an internal encrypted type the contract can work with.

#### Step 2: Homomorphic Addition
```solidity
_balance = FHE.add(_balance, encryptedEuint32);
```

This is the **magic of FHE**! We're adding two encrypted numbers together without ever decrypting them. The result is also encrypted. 

Think of it like this:
```
Encrypted(100) + Encrypted(50) = Encrypted(150)
```

No one knows the actual values, but the mathematical relationship is preserved.

#### Step 3: Grant Permissions
```solidity
FHE.allowThis(_balance);
FHE.allow(_balance, msg.sender);
```

- **`FHE.allowThis()`**: Allows the contract itself to use this encrypted value in future computations
- **`FHE.allow(_balance, msg.sender)`**: Grants the caller permission to decrypt their own balance

### 5. Withdrawing Encrypted Amounts

```solidity
function withdraw(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // Convert external encrypted input
    euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
    
    // Subtract encrypted amount from encrypted balance (homomorphic subtraction!)
    _balance = FHE.sub(_balance, encryptedEuint32);
    
    // Grant permissions
    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
}
```

The withdrawal function mirrors the deposit logic but uses `FHE.sub()` for homomorphic subtraction:

```
Encrypted(150) - Encrypted(50) = Encrypted(100)
```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 🎯 Usage

### Interacting with the Private Balance Tracker

Once deployed, you can interact with the contract using the following tasks:

#### Local Network

```bash
# Check your encrypted balance
npx hardhat --network localhost task:decrypt-balance

# Deposit encrypted amount
npx hardhat --network localhost task:deposit --value 100

# Withdraw encrypted amount
npx hardhat --network localhost task:withdraw --value 50

# Check balance again
npx hardhat --network localhost task:decrypt-balance
```

#### Sepolia Testnet

```bash
# Check your encrypted balance
npx hardhat --network sepolia task:decrypt-balance

# Deposit encrypted amount
npx hardhat --network sepolia task:deposit --value 100

# Withdraw encrypted amount
npx hardhat --network sepolia task:withdraw --value 50

# Check balance again
npx hardhat --network sepolia task:decrypt-balance
```

#### Get Contract Address

```bash
# Get deployed contract address
npx hardhat --network localhost task:address
npx hardhat --network sepolia task:address
```





Again, all operations happen on encrypted data, maintaining complete privacy.


## 🔧 Available Tasks

| Task                      | Description                              | Example                                    |
| ------------------------- | ---------------------------------------- | ------------------------------------------ |
| `task:address`            | Get the deployed contract address        | `npx hardhat --network localhost task:address` |
| `task:decrypt-balance`    | Decrypt and view your current balance    | `npx hardhat --network localhost task:decrypt-balance` |
| `task:deposit`            | Deposit encrypted amount to balance      | `npx hardhat --network localhost task:deposit --value 100` |
| `task:withdraw`           | Withdraw encrypted amount from balance   | `npx hardhat --network localhost task:withdraw --value 50` |

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 🛡️ Contract Functions

### `getBalance()`
Returns the encrypted balance of the caller. Only authorized users can decrypt this value.

### `deposit(externalEuint32 inputEuint32, bytes calldata inputProof)`
Deposits an encrypted amount to the user's balance. The amount is added homomorphically to the existing balance without decryption.

### `withdraw(externalEuint32 inputEuint32, bytes calldata inputProof)`
Withdraws an encrypted amount from the user's balance. The amount is subtracted homomorphically from the existing balance without decryption.

## 🔒 Security Features

- **End-to-End Encryption**: All balance values remain encrypted throughout their lifecycle
- **Homomorphic Operations**: Mathematical operations performed on encrypted data
- **Access Control**: Only authorized addresses can decrypt their own balances

### Use Cases

This Private Balance Tracker template can be adapted for:
- Confidential DeFi applications
- Private voting systems
- Encrypted reputation scoring
- Secret inventory management
- Anonymous loyalty programs
- Confidential health records
- Private gaming statistics
