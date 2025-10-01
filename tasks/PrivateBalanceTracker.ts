import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:address", "Prints the PrivateBalanceTracker address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const privateBalanceTracker = await deployments.get("PrivateBalanceTracker");

  console.log("PrivateBalanceTracker address is " + privateBalanceTracker.address);
});


task("task:decrypt-balance", "Calls the getBalance() function of Contract")
  .addOptionalParam("address", "Optionally specify the contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const PrivateBalanceTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivateBalanceTracker");
    console.log(`PrivateBalanceTracker: ${PrivateBalanceTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privateBalanceTrackerContract = await ethers.getContractAt("PrivateBalanceTracker", PrivateBalanceTrackerDeployment.address);

    const encryptedBalance = await privateBalanceTrackerContract.getBalance();
    if (encryptedBalance === ethers.ZeroHash) {
      console.log(`encrypted balance: ${encryptedBalance}`);
      console.log("clear balance    : 0");
      return;
    }

    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedBalance,
      PrivateBalanceTrackerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted balance: ${encryptedBalance}`);
    console.log(`Clear balance    : ${clearBalance}`);
  });


task("task:deposit", "Calls the increment() function of PrivateBalanceTracker Contract")
  .addOptionalParam("address", "Optionally specify the PrivateBalanceTracker contract address")
  .addParam("value", "The increment value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const PrivateBalanceTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivateBalanceTracker");
    console.log(`PrivateBalanceTracker: ${PrivateBalanceTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privateBalanceTrackerContract = await ethers.getContractAt("PrivateBalanceTracker", PrivateBalanceTrackerDeployment.address);

    const encryptedValue = await fhevm
      .createEncryptedInput(PrivateBalanceTrackerDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await privateBalanceTrackerContract
      .connect(signers[0])
      .deposit(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedBalance = await privateBalanceTrackerContract.getBalance();
    console.log("Encrypted balance after increment:", newEncryptedBalance);

    console.log(`PrivateBalanceTracker increment(${value}) succeeded!`);
  });

task("task:withdraw", "Calls the decrement() function of PrivateBalanceTracker Contract")
  .addOptionalParam("address", "Optionally specify the PrivateBalanceTracker contract address")
  .addParam("value", "The decrement value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const PrivateBalanceTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("PrivateBalanceTracker");
    console.log(`PrivateBalanceTracker: ${PrivateBalanceTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const privateBalanceTrackerContract = await ethers.getContractAt("PrivateBalanceTracker", PrivateBalanceTrackerDeployment.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(PrivateBalanceTrackerDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await privateBalanceTrackerContract
      .connect(signers[0])
      .withdraw(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedBalance = await privateBalanceTrackerContract.getBalance();
    console.log("Encrypted balance after decrement:", newEncryptedBalance);

    console.log(`PrivateBalanceTracker decrement(${value}) succeeded!`);
  });
