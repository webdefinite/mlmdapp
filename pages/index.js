import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiGift,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import {
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineStar,
} from "react-icons/hi";
import { BiNetworkChart } from "react-icons/bi";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import RegistrationModal from "../components/Modals/RegistrationModal";
import StatsCard from "../components/Cards/StatsCard";
import QuickActions from "../components/Dashboard/QuickActions";
import RecentActivity from "../components/Dashboard/RecentActivity";
import MatrixPreview from "../components/Dashboard/MatrixPreview";
import {
  useMatrixContract,
  useUserData,
  useTokenData,
  formatNumber,
  truncateAddress,
  useTeamData,
} from "../hooks/useContract";

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [showRegistration, setShowRegistration] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  const { totalUsers, totalTurnover, contractActive } = useMatrixContract();
  const { userInfo, isRegistered, x4Earnings, xxxEarnings } =
    useUserData(address);
  const { tokenBalance, tokenSymbol } = useTokenData(address);
  const { teamData, loading: teamLoading } = useTeamData(address);

  // Generate referral link
  useEffect(() => {
    if (address) {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      setReferralLink(`${baseUrl}/?ref=${address}`);
    }
  }, [address]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const totalEarnings = parseFloat(x4Earnings) + parseFloat(xxxEarnings);

  const userStats = [
    {
      title: "Total Earned",
      value: `${formatNumber(totalEarnings)} ${tokenSymbol}`,
      icon: FiDollarSign,
      color: "from-green-500 to-emerald-600",
      change: "+12.5%",
    },
    {
      title: "x4 Earnings",
      value: `${formatNumber(x4Earnings)} ${tokenSymbol}`,
      icon: HiOutlineCube,
      color: "from-blue-500 to-cyan-600",
      change: "+8.2%",
    },
    {
      title: "xXx Earnings",
      value: `${formatNumber(xxxEarnings)} ${tokenSymbol}`,
      icon: HiOutlineChartBar,
      color: "from-purple-500 to-pink-600",
      change: "+15.7%",
    },
    {
      title: "Direct Referrals",
      value: teamData.teamStats.directReferrals || "0",
      icon: HiOutlineUserGroup,
      color: "from-orange-500 to-red-600",
      change: "+3",
    },
  ];

  const globalStats = [
    {
      title: "Total Users",
      value: formatNumber(totalUsers),
      icon: FiUsers,
      color: "from-indigo-500 to-blue-600",
    },
    {
      title: "Total Volume",
      value: `${formatNumber(totalTurnover)} ${tokenSymbol}`,
      icon: FiTrendingUp,
      color: "from-green-500 to-teal-600",
    },
    {
      title: "Token Balance",
      value: `${formatNumber(tokenBalance)} ${tokenSymbol}`,
      icon: FiGift,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Network Status",
      value: contractActive ? "Active" : "Paused",
      icon: BiNetworkChart,
      color: contractActive
        ? "from-green-500 to-emerald-600"
        : "from-red-500 to-orange-600",
    },
  ];

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineCube className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Multi-Level Marketing Matrix
              </h1>
              <p className="text-white/70 text-lg max-w-md mx-auto mb-8">
                Connect your wallet to start earning with our revolutionary
                matrix platform
              </p>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <p className="text-white/60 text-sm mb-4">
                  Please connect your wallet to continue
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isRegistered) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineStar className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Join the Matrix
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Register now to start earning with x4 and xXx matrix programs
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <HiOutlineCube className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">x4 Matrix</h3>
                  <p className="text-white/70 text-sm">
                    6-position matrix with direct spillovers and reinvestment
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <HiOutlineChartBar className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">xXx Matrix</h3>
                  <p className="text-white/70 text-sm">
                    14-position matrix with percentage distributions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRegistration(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>

        <RegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
        />
      </Layout>
    );
  }

  console.log(userInfo[0]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Multi-Level Marketing User #{Number(userInfo[0])}
              </h1>
              <p className="text-white/70">
                Address: {truncateAddress(address)}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="bg-transparent text-white text-sm flex-1 min-w-0 outline-none"
                />
                <button
                  onClick={copyReferralLink}
                  className="ml-2 text-white/70 hover:text-white transition-colors"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-white transition-colors"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Matrix Previews */}
        <div className="grid lg:grid-cols-2 gap-8">
          <MatrixPreview
            title="x4 Matrix"
            program={1}
            userAddress={address}
            icon={HiOutlineCube}
            color="from-blue-500 to-cyan-600"
          />
          <MatrixPreview
            title="xXx Matrix"
            program={2}
            userAddress={address}
            icon={HiOutlineChartBar}
            color="from-purple-500 to-pink-600"
          />
        </div>

        {/* Global Stats */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity userAddress={address} />
      </div>
    </Layout>
  );
};

export default Dashboard;
