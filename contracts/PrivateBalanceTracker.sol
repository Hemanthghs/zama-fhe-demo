// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateBalanceTracker is SepoliaConfig {
    euint32 private _balance;

    function getBalance() external view returns (euint32) {
        return _balance;
    }

    function deposit(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _balance = FHE.add(_balance, encryptedEuint32);

        FHE.allowThis(_balance);
        FHE.allow(_balance, msg.sender);
    }

    function withdraw(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _balance = FHE.sub(_balance, encryptedEuint32);

        FHE.allowThis(_balance);
        FHE.allow(_balance, msg.sender);
    }
}
