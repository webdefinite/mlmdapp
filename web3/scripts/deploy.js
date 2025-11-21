const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);

  // TOKEN CONTRACT DEPLOYMENY
  console.log("\nDeploying LINKTUM contract...");
  const LINKTUM = await hre.ethers.getContractFactory("LINKTUM");
  const linktum = await LINKTUM.deploy();

  await linktum.deployed();

  console.log("\nDeployment Successful!");
  console.log("----------------------");
  console.log("\nNEXT_PUBLIC_lINKTUM_ADDRESS:", linktum.address);
  console.log("\nNEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);

  // Deploy the LinkTumMatrix CONTRACT
  console.log("\nDeploying LinkTumMatrix contract...");
  const LinkTumMatrix = await hre.ethers.getContractFactory("LinkTumMatrix");
  const linkTumMatrix = await LinkTumMatrix.deploy(linktum.address);

  await linkTumMatrix.deployed();

  console.log("\nDeployment Successful!");
  console.log("----------------------");
  console.log("\nNEXT_PUBLIC_LinkTumMatrix_ADDRESS:", linkTumMatrix.address);
  console.log("\nNEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
