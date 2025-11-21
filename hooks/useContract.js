import {
  useReadContract,
  useWriteContract,
  useAccount,
  useWatchContractEvent,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Import your ABI here
import MATRIX_ABI from "../web3/artifacts/contracts/LinkTumMatrix.sol/LinkTumMatrix.json";
import LINKTUM_ABI from "../web3/artifacts/contracts/LINKTUM.sol/LINKTUM.json";

const LINKTUM_MATRIX_ABI = MATRIX_ABI.abi;
const LINKTUM_TOKEN_ABI = LINKTUM_ABI.abi;

const MATRIX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINKTUM_MATRIX_CONTRACT;
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LINKTUM_TOKEN_CONTRACT;
const TOKEN_DECIMALS = parseInt(process.env.NEXT_PUBLIC_TOKEN_DECIMALS || "18");

// Contract hook for LinkTum Matrix
export const useMatrixContract = () => {
  const { address } = useAccount();

  // Read functions
  const { data: totalUsers } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "totalUsers",
  });

  const { data: totalTurnover } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "totalTurnover",
  });

  const { data: contractActive } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "contractActive",
  });

  const { data: levelCosts } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getLevelCosts",
  });

  return {
    totalUsers: totalUsers?.toString() || "0",
    totalTurnover: totalTurnover
      ? ethers.utils.formatUnits(totalTurnover, TOKEN_DECIMALS)
      : "0",
    contractActive: contractActive || false,
    levelCosts: levelCosts || [],
    contractAddress: MATRIX_CONTRACT_ADDRESS,
  };
};

// Hook for user data
export const useUserData = (userAddress) => {
  const { data: userInfo } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getUserInfo",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: isRegistered } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "registered",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: x4Earnings } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getProgramEarnings",
    args: [userAddress, 1], // X4_PROGRAM = 1
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: xxxEarnings } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getProgramEarnings",
    args: [userAddress, 2], // XXX_PROGRAM = 2
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    userInfo: userInfo || {},
    isRegistered: isRegistered || false,
    x4Earnings: x4Earnings
      ? ethers.utils.formatUnits(x4Earnings, TOKEN_DECIMALS)
      : "0",
    xxxEarnings: xxxEarnings
      ? ethers.utils.formatUnits(xxxEarnings, TOKEN_DECIMALS)
      : "0",
  };
};

// Hook for matrix data
export const useMatrixData = (userAddress, program, level) => {
  const { data: matrixInfo } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getMatrixInfo",
    args: [userAddress, program, level],
    query: {
      enabled: !!userAddress && !!program && !!level,
    },
  });

  const { data: matrixReferrals } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getMatrixReferrals",
    args: [userAddress, program, level],
    query: {
      enabled: !!userAddress && !!program && !!level,
    },
  });

  const { data: isLevelActive } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "isLevelActive",
    args: [userAddress, program, level],
    query: {
      enabled: !!userAddress && !!program && !!level,
    },
  });

  return {
    matrixInfo: matrixInfo || {},
    matrixReferrals: matrixReferrals || [[], [], []],
    isLevelActive: isLevelActive || false,
  };
};

// Hook for token data
export const useTokenData = (userAddress) => {
  const { data: tokenBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: LINKTUM_TOKEN_ABI,
    functionName: "balanceOf",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: tokenAllowance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: LINKTUM_TOKEN_ABI,
    functionName: "allowance",
    args: [userAddress, MATRIX_CONTRACT_ADDRESS],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: LINKTUM_TOKEN_ABI,
    functionName: "symbol",
  });

  return {
    tokenBalance: tokenBalance
      ? ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)
      : "0",
    tokenAllowance: tokenAllowance
      ? ethers.utils.formatUnits(tokenAllowance, TOKEN_DECIMALS)
      : "0",
    tokenSymbol: tokenSymbol || "LINKTUM",
  };
};

// Enhanced hook for contract writes with better error handling
export const useMatrixActions = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const [currentAction, setCurrentAction] = useState(null);

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && currentAction) {
      toast.success(`${currentAction} completed successfully!`);
      setCurrentAction(null);
    }
  }, [isConfirmed, currentAction]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
      let errorMessage = "Transaction failed";

      if (error.message.includes("User rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction";
      } else if (error.message.includes("Already registered")) {
        errorMessage = "User already registered";
      } else if (error.message.includes("Referrer not found")) {
        errorMessage = "Invalid referrer address";
      } else if (error.message.includes("Token transfer failed")) {
        errorMessage = "Token transfer failed - check allowance";
      } else if (error.message.includes("Level already active")) {
        errorMessage = "Level already purchased";
      } else if (error.message.includes("Previous level not active")) {
        errorMessage = "Previous level must be purchased first";
      }

      toast.error(errorMessage);
      setCurrentAction(null);
    }
  }, [error]);

  const register = async (referrerAddress) => {
    try {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (
        !referrerAddress ||
        referrerAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error("Invalid referrer address");
      }

      setCurrentAction("Registration");

      const hash = await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: LINKTUM_MATRIX_ABI,
        functionName: "register",
        args: [referrerAddress],
      });

      toast.success("Registration transaction submitted!");
      return hash;
    } catch (error) {
      console.error("Registration failed:", error);
      setCurrentAction(null);
      throw error;
    }
  };

  const buyLevel = async (program, level) => {
    try {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setCurrentAction(`Level ${level} Purchase`);

      const hash = await writeContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: LINKTUM_MATRIX_ABI,
        functionName: "buyLevel",
        args: [program, level],
      });

      toast.success("Level purchase transaction submitted!");
      return hash;
    } catch (error) {
      console.error("Level purchase failed:", error);
      setCurrentAction(null);
      throw error;
    }
  };

  const approveToken = async (amount) => {
    try {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setCurrentAction("Token Approval");

      const amountWei = ethers.utils.parseUnits(
        amount.toString(),
        TOKEN_DECIMALS
      );

      const hash = await writeContract({
        address: TOKEN_CONTRACT_ADDRESS,
        abi: LINKTUM_TOKEN_ABI,
        functionName: "approve",
        args: [MATRIX_CONTRACT_ADDRESS, amountWei],
      });

      toast.success("Token approval transaction submitted!");
      return hash;
    } catch (error) {
      console.error("Token approval failed:", error);
      setCurrentAction(null);
      throw error;
    }
  };

  return {
    register,
    buyLevel,
    approveToken,
    isPending: isPending || isConfirming,
    isConfirmed,
    error,
    currentAction,
    // For backward compatibility
    registerLoading: isPending || isConfirming,
    buyLevelLoading: isPending || isConfirming,
    approveLoading: isPending || isConfirming,
  };
};

// Enhanced hook for fetching team data from contract
export const useTeamData = (userAddress) => {
  const [teamData, setTeamData] = useState({
    directReferrals: [],
    teamStats: {
      directReferrals: 0,
      totalNetwork: 0,
      totalTeamEarnings: 0,
      activeMembers: 0,
      thisMonthReferrals: 0,
      avgEarningsPerMember: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user's direct referrals
  const { data: referralAddresses } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getUserReferrals",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  // Get team stats
  const { data: teamStats } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "getTeamStats",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const directReferrals = [];

        if (referralAddresses && referralAddresses.length > 0) {
          // Process referral data in batches to avoid rate limiting
          const batchSize = 5;
          for (let i = 0; i < referralAddresses.length; i += batchSize) {
            const batch = referralAddresses.slice(i, i + batchSize);

            const batchPromises = batch.map(async (referralAddress) => {
              try {
                // Get user info for each referral
                const userInfo = await getUserInfo(referralAddress);
                const x4Earnings = await getProgramEarnings(referralAddress, 1);
                const xxxEarnings = await getProgramEarnings(
                  referralAddress,
                  2
                );

                // Get active levels for each program
                const x4ActiveLevels = await getActiveLevelsCount(
                  referralAddress,
                  1
                );
                const xxxActiveLevels = await getActiveLevelsCount(
                  referralAddress,
                  2
                );

                const totalEarned =
                  parseFloat(formatTokenAmount(x4Earnings)) +
                  parseFloat(formatTokenAmount(xxxEarnings));

                return {
                  id: userInfo.id?.toString() || "0",
                  address: referralAddress,
                  joinDate: userInfo.registrationTime
                    ? new Date(userInfo.registrationTime * 1000)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  totalEarned: totalEarned,
                  x4Levels: x4ActiveLevels,
                  xxxLevels: xxxActiveLevels,
                  status: "active",
                  lastActivity: new Date().toISOString().split("T")[0],
                };
              } catch (error) {
                console.error("Error fetching referral data:", error);
                return null;
              }
            });

            const batchResults = await Promise.all(batchPromises);
            directReferrals.push(...batchResults.filter(Boolean));
          }
        }

        // Calculate team stats
        const totalTeamEarnings = directReferrals.reduce(
          (sum, ref) => sum + ref.totalEarned,
          0
        );
        const avgEarningsPerMember =
          directReferrals.length > 0
            ? totalTeamEarnings / directReferrals.length
            : 0;

        // Get registration events from last 30 days for growth calculation
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
        const recentReferrals = directReferrals.filter(
          (ref) => new Date(ref.joinDate).getTime() / 1000 > thirtyDaysAgo
        );

        setTeamData({
          directReferrals,
          teamStats: {
            directReferrals: directReferrals.length,
            totalNetwork: directReferrals.length,
            totalTeamEarnings,
            activeMembers: directReferrals.filter(
              (ref) => ref.status === "active"
            ).length,
            thisMonthReferrals: recentReferrals.length,
            avgEarningsPerMember,
          },
        });
      } catch (error) {
        console.error("Error fetching team data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [userAddress, referralAddresses]);

  return { teamData, loading, error };
};

// Helper functions for contract calls (these would need to be implemented with actual contract calls)
const getUserInfo = async (address) => {
  // This should be replaced with actual contract call
  return {
    id: Math.floor(Math.random() * 1000),
    registrationTime:
      Math.floor(Date.now() / 1000) -
      Math.floor(Math.random() * 30 * 24 * 60 * 60),
  };
};

const getProgramEarnings = async (address, program) => {
  // This should be replaced with actual contract call
  return "0";
};

const getActiveLevelsCount = async (address, program) => {
  // This should be replaced with actual contract call
  return Math.floor(Math.random() * 3) + 1;
};

// Hook for watching contract events with better error handling
export const useContractEvents = (userAddress) => {
  const [recentEvents, setRecentEvents] = useState([]);
  const [eventError, setEventError] = useState(null);

  // Watch for registration events where user is the referrer
  useWatchContractEvent({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    eventName: "Registration",
    args: {
      referrer: userAddress,
    },
    onLogs(logs) {
      try {
        console.log("New referral registration events:", logs);
        const newReferrals = logs.map((log) => ({
          type: "new_referral",
          timestamp: Date.now(),
          data: {
            referral: log.args.user,
            referrer: log.args.referrer,
            userId: log.args.userId?.toString(),
          },
        }));

        setRecentEvents((prev) => [...newReferrals, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Error processing registration events:", error);
        setEventError(error.message);
      }
    },
    onError(error) {
      console.error("Registration event error:", error);
      setEventError(error.message);
    },
  });

  // Watch for payment events to user
  useWatchContractEvent({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    eventName: "PaymentSent",
    args: {
      to: userAddress,
    },
    onLogs(logs) {
      try {
        console.log("Payment received events:", logs);
        const payments = logs.map((log) => ({
          type: "payment_received",
          timestamp: Date.now(),
          data: {
            from: log.args.from,
            amount: formatTokenAmount(log.args.amount),
            program: log.args.program,
            level: log.args.level,
          },
        }));

        setRecentEvents((prev) => [...payments, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Error processing payment events:", error);
        setEventError(error.message);
      }
    },
    onError(error) {
      console.error("Payment event error:", error);
      setEventError(error.message);
    },
  });

  // Watch for level activation events
  useWatchContractEvent({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    eventName: "LevelActivated",
    args: {
      user: userAddress,
    },
    onLogs(logs) {
      try {
        console.log("Level activation events:", logs);
        const activations = logs.map((log) => ({
          type: "level_purchased",
          timestamp: Date.now(),
          data: {
            program: log.args.program,
            level: log.args.level,
            cost: formatTokenAmount(log.args.cost),
          },
        }));

        setRecentEvents((prev) => [...activations, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Error processing level activation events:", error);
        setEventError(error.message);
      }
    },
    onError(error) {
      console.error("Level activation event error:", error);
      setEventError(error.message);
    },
  });

  // Watch for matrix completion events
  useWatchContractEvent({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    eventName: "MatrixClosed",
    args: {
      user: userAddress,
    },
    onLogs(logs) {
      try {
        console.log("Matrix completion events:", logs);
        const completions = logs.map((log) => ({
          type: "matrix_completed",
          timestamp: Date.now(),
          data: {
            program: log.args.program,
            level: log.args.level,
            cycles: log.args.reinvestCount,
          },
        }));

        setRecentEvents((prev) => [...completions, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Error processing matrix completion events:", error);
        setEventError(error.message);
      }
    },
    onError(error) {
      console.error("Matrix completion event error:", error);
      setEventError(error.message);
    },
  });

  // Watch for matrix overflow events (new event)
  useWatchContractEvent({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    eventName: "MatrixOverflow",
    args: {
      user: userAddress,
    },
    onLogs(logs) {
      try {
        console.log("Matrix overflow events:", logs);
        const overflows = logs.map((log) => ({
          type: "matrix_overflow",
          timestamp: Date.now(),
          data: {
            user: log.args.user,
            referrer: log.args.referrer,
            program: log.args.program,
            level: log.args.level,
          },
        }));

        setRecentEvents((prev) => [...overflows, ...prev].slice(0, 10));
      } catch (error) {
        console.error("Error processing matrix overflow events:", error);
        setEventError(error.message);
      }
    },
    onError(error) {
      console.error("Matrix overflow event error:", error);
      setEventError(error.message);
    },
  });

  return {
    recentEvents,
    eventError,
  };
};

// Hook for registration validation
export const useRegistrationValidation = () => {
  const validateReferrer = async (referrerAddress) => {
    if (
      !referrerAddress ||
      referrerAddress === "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error("Invalid referrer address");
    }

    // Check if referrer is registered
    try {
      const isRegistered = await useReadContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: LINKTUM_MATRIX_ABI,
        functionName: "registered",
        args: [referrerAddress],
      });

      if (!isRegistered) {
        throw new Error("Referrer is not registered");
      }

      return true;
    } catch (error) {
      throw new Error("Error validating referrer: " + error.message);
    }
  };

  const validateRegistration = async (userAddress, referrerAddress) => {
    // Check if user is already registered
    try {
      const isRegistered = await useReadContract({
        address: MATRIX_CONTRACT_ADDRESS,
        abi: LINKTUM_MATRIX_ABI,
        functionName: "registered",
        args: [userAddress],
      });

      if (isRegistered) {
        throw new Error("User already registered");
      }

      // Validate referrer
      await validateReferrer(referrerAddress);

      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    validateReferrer,
    validateRegistration,
  };
};

// Utility functions
export const formatTokenAmount = (amount, decimals = TOKEN_DECIMALS) => {
  if (!amount) return "0";
  try {
    return ethers.utils.formatUnits(amount, decimals);
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "0";
  }
};

export const parseTokenAmount = (amount, decimals = TOKEN_DECIMALS) => {
  if (!amount) return "0";
  try {
    return ethers.utils.parseUnits(amount.toString(), decimals);
  } catch (error) {
    console.error("Error parsing token amount:", error);
    return "0";
  }
};

export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
};

// Hook for checking contract health
export const useContractHealth = () => {
  const [health, setHealth] = useState({
    contractActive: false,
    tokenBalance: "0",
    totalUsers: "0",
    lastUpdate: null,
  });

  const { data: contractActive } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "contractActive",
  });

  const { data: totalUsers } = useReadContract({
    address: MATRIX_CONTRACT_ADDRESS,
    abi: LINKTUM_MATRIX_ABI,
    functionName: "totalUsers",
  });

  const { data: contractBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: LINKTUM_TOKEN_ABI,
    functionName: "balanceOf",
    args: [MATRIX_CONTRACT_ADDRESS],
  });

  useEffect(() => {
    setHealth({
      contractActive: contractActive || false,
      tokenBalance: contractBalance ? formatTokenAmount(contractBalance) : "0",
      totalUsers: totalUsers?.toString() || "0",
      lastUpdate: new Date().toISOString(),
    });
  }, [contractActive, totalUsers, contractBalance]);

  return health;
};
