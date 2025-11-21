import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  FiSettings,
  FiPause,
  FiPlay,
  FiDollarSign,
  FiShield,
  FiUsers,
  FiTrendingUp,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import {
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineChartBar,
} from "react-icons/hi";
import Layout from "../components/Layout/Layout";
import { formatNumber, formatTokenAmount } from "../hooks/useContract";

// Import your ABI
const MATRIX_ABI =
  require("../web3/artifacts/contracts/LinkTumMatrix.sol/LinkTumMatrix.json").abi;
const TOKEN_ABI =
  require("../web3/artifacts/contracts/LINKTUM.sol/LINKTUM.json").abi;

const MATRIX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINKTUM_MATRIX_CONTRACT;
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINKTUM_TOKEN_CONTRACT;
const TOKEN_DECIMALS = parseInt(process.env.NEXT_PUBLIC_TOKEN_DECIMALS || "18");

const AdminPage = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // State for form inputs
  const [levelCostForm, setLevelCostForm] = useState({ level: 1, newCost: "" });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [currentAction, setCurrentAction] = useState("");

  // Contract data
  const { data: owner } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "owner",
  });

  const { data: contractActive } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "contractActive",
  });

  const { data: totalUsers } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "totalUsers",
  });

  const { data: totalTurnover } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "totalTurnover",
  });

  const { data: contractBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: [MATRIX_CONTRACT_ADDRESS],
  });

  const { data: levelCosts } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: MATRIX_ABI,
    functionName: "getLevelCosts",
  });

  // Check if current user is the owner
  const isOwner =
    address && owner && address.toLowerCase() === owner.toLowerCase();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && currentAction) {
      toast.success(`${currentAction} completed successfully!`);
      setCurrentAction("");
    }
  }, [isConfirmed, currentAction]);

  // Admin functions
  const pauseContract = async () => {
    try {
      setCurrentAction("Contract Pause");
      await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: MATRIX_ABI,
        functionName: "pauseContract",
      });
      toast.success("Contract pause transaction submitted!");
    } catch (error) {
      console.error("Pause contract failed:", error);
      toast.error("Failed to pause contract");
      setCurrentAction("");
    }
  };

  const activateContract = async () => {
    try {
      setCurrentAction("Contract Activation");
      await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: MATRIX_ABI,
        functionName: "activateContract",
      });
      toast.success("Contract activation transaction submitted!");
    } catch (error) {
      console.error("Activate contract failed:", error);
      toast.error("Failed to activate contract");
      setCurrentAction("");
    }
  };

  const updateLevelCost = async () => {
    try {
      if (!levelCostForm.level || !levelCostForm.newCost) {
        toast.error("Please fill in all fields");
        return;
      }

      const costWei = ethers.utils.parseUnits(
        levelCostForm.newCost,
        TOKEN_DECIMALS
      );

      setCurrentAction("Level Cost Update");
      await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: MATRIX_ABI,
        functionName: "updateLevelCost",
        args: [levelCostForm.level, costWei],
      });
      toast.success("Level cost update transaction submitted!");
    } catch (error) {
      console.error("Update level cost failed:", error);
      toast.error("Failed to update level cost");
      setCurrentAction("");
    }
  };

  const emergencyWithdraw = async () => {
    try {
      if (!withdrawAmount) {
        toast.error("Please enter withdrawal amount");
        return;
      }

      const amountWei = ethers.utils.parseUnits(withdrawAmount, TOKEN_DECIMALS);

      setCurrentAction("Emergency Withdrawal");
      await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: MATRIX_ABI,
        functionName: "emergencyWithdraw",
        args: [amountWei],
      });
      toast.success("Emergency withdrawal transaction submitted!");
    } catch (error) {
      console.error("Emergency withdrawal failed:", error);
      toast.error("Failed to perform emergency withdrawal");
      setCurrentAction("");
    }
  };

  // User lookup function
  const [userLookupData, setUserLookupData] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const lookupUser = async () => {
    if (!selectedUser) {
      toast.error("Please enter a user address");
      return;
    }

    setLookupLoading(true);
    try {
      // This would need to be implemented with actual contract calls
      // For now, showing the structure
      const userInfo = {
        address: selectedUser,
        id: "123",
        registrationTime: new Date().toISOString(),
        totalEarned: "1000",
        totalSpent: "500",
        directReferrals: "10",
        isRegistered: true,
      };
      setUserLookupData(userInfo);
    } catch (error) {
      console.error("User lookup failed:", error);
      toast.error("Failed to lookup user");
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <FiShield className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">
              Admin Access Required
            </h1>
            <p className="text-white/70">
              Please connect your wallet to access the admin panel
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isOwner) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <FiLock className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Access Denied</h1>
            <p className="text-white/70">
              Only the contract owner can access this page
            </p>
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-400 text-sm">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <p className="text-red-400 text-sm">
                Owner: {owner?.slice(0, 6)}...{owner?.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center space-x-4">
            <FiShield className="w-10 h-10 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/70">
                Contract owner controls and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Contract Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  contractActive ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {contractActive ? (
                  <FiUnlock className="w-6 h-6 text-white" />
                ) : (
                  <FiLock className="w-6 h-6 text-white" />
                )}
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contractActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {contractActive ? "Active" : "Paused"}
              </div>
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">
              Contract Status
            </h3>
            <p className="text-white text-2xl font-bold">
              {contractActive ? "Running" : "Paused"}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">
              Total Users
            </h3>
            <p className="text-white text-2xl font-bold">
              {formatNumber(totalUsers?.toString() || "0")}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">
              Total Turnover
            </h3>
            <p className="text-white text-2xl font-bold">
              {formatNumber(
                totalTurnover ? formatTokenAmount(totalTurnover) : "0"
              )}{" "}
              LINKTUM
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white/70 text-sm font-medium mb-1">
              Contract Balance
            </h3>
            <p className="text-white text-2xl font-bold">
              {formatNumber(
                contractBalance ? formatTokenAmount(contractBalance) : "0"
              )}{" "}
              LINKTUM
            </p>
          </div>
        </div>

        {/* Contract Controls */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contract State Control */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiSettings className="w-5 h-5 mr-2" />
              Contract Control
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <h3 className="text-white font-medium">Contract Status</h3>
                  <p className="text-white/70 text-sm">
                    {contractActive
                      ? "Contract is currently active"
                      : "Contract is currently paused"}
                  </p>
                </div>
                <button
                  onClick={contractActive ? pauseContract : activateContract}
                  disabled={isPending || isConfirming}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    contractActive
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } ${
                    isPending || isConfirming
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isPending || isConfirming ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : contractActive ? (
                    <>
                      <FiPause className="w-4 h-4 mr-2 inline" />
                      Pause Contract
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-4 h-4 mr-2 inline" />
                      Activate Contract
                    </>
                  )}
                </button>
              </div>

              {contractActive && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                    <p className="text-yellow-400 text-sm">
                      Pausing the contract will prevent new registrations and
                      level purchases
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Withdrawal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <FiDownload className="w-5 h-5 mr-2" />
              Emergency Withdrawal
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Withdrawal Amount (LINKTUM)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
                <p className="text-white/50 text-xs mt-1">
                  Available:{" "}
                  {formatNumber(
                    contractBalance ? formatTokenAmount(contractBalance) : "0"
                  )}{" "}
                  LINKTUM
                </p>
              </div>

              <button
                onClick={emergencyWithdraw}
                disabled={isPending || isConfirming || !withdrawAmount}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Emergency Withdraw"
                )}
              </button>

              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-center">
                  <HiOutlineExclamationCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-400 text-sm">
                    Emergency withdrawals should only be used in critical
                    situations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Status */}
        {currentAction && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-center">
              <FiRefreshCw className="w-5 h-5 text-blue-400 mr-2 animate-spin" />
              <p className="text-blue-400">
                {currentAction} in progress... Please wait for confirmation.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
