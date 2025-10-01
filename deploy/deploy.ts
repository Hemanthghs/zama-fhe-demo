import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHECounter = await deploy("PrivateBalanceTracker", {
    from: deployer,
    log: true,
  });

  console.log(`PrivateBalanceTracker contract: `, deployedFHECounter.address);
};
export default func;
func.id = "deploy_fheCounter1"; // id required to prevent reexecution
func.tags = ["PrivateBalanceTracker"];
