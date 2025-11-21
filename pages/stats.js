import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import {
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { BiNetworkChart } from "react-icons/bi";
import Layout from "../components/Layout/Layout";
import StatsCard from "../components/Cards/StatsCard";
import {
  useMatrixContract,
  useUserData,
  useTokenData,
  formatNumber,
} from "../hooks/useContract";

const StatsPage = () => {
  const { address, isConnected } = useAccount();
  const [timeFilter, setTimeFilter] = useState("all"); // all, 7d, 30d, 90d
  const [selectedProgram, setSelectedProgram] = useState("all"); // all, x4, xxx

  const { totalUsers, totalTurnover, contractActive } = useMatrixContract();
  const { userInfo, isRegistered, x4Earnings, xxxEarnings } =
    useUserData(address);
  const { tokenBalance, tokenSymbol } = useTokenData(address);

  // Mock data for charts - in real app, this would come from contract events or API
  const [chartData, setChartData] = useState({
    dailyEarnings: [],
    levelDistribution: [],
    programComparison: [],
    userGrowth: [],
  });

  useEffect(() => {
    // Mock data generation - replace with real data fetching
    const generateMockData = () => {
      const dailyEarnings = [];
      const levelDistribution = [];
      const programComparison = [];
      const userGrowth = [];

      // Generate daily earnings for last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyEarnings.push({
          date: date.toISOString().split("T")[0],
          x4: Math.random() * 100 + 50,
          xxx: Math.random() * 150 + 75,
          total: 0,
        });
      }
      dailyEarnings.forEach((day) => {
        day.total = day.x4 + day.xxx;
      });

      // Generate level distribution
      for (let i = 1; i <= 12; i++) {
        levelDistribution.push({
          level: i,
          users: Math.floor(Math.random() * 1000) + 100,
          cost: Math.pow(2, i - 1) * 5, // Level costs double each time
        });
      }

      // Program comparison
      programComparison.push(
        {
          program: "x4",
          earnings: parseFloat(x4Earnings) || 1250,
          users: 450,
          cycles: 23,
        },
        {
          program: "xXx",
          earnings: parseFloat(xxxEarnings) || 3400,
          users: 320,
          cycles: 15,
        }
      );

      // User growth over time
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        userGrowth.push({
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          users: Math.floor(Math.random() * 500) + 200 + (11 - i) * 150,
        });
      }

      setChartData({
        dailyEarnings,
        levelDistribution,
        programComparison,
        userGrowth,
      });
    };

    generateMockData();
  }, [x4Earnings, xxxEarnings]);

  const globalStats = [
    {
      title: "Total Users",
      value: formatNumber(totalUsers),
      icon: FiUsers,
      color: "from-blue-500 to-cyan-600",
      change: "+12.5%",
      description: "Registered members",
    },
    {
      title: "Total Volume",
      value: `${formatNumber(totalTurnover)} ${tokenSymbol}`,
      icon: FiTrendingUp,
      color: "from-green-500 to-emerald-600",
      change: "+24.8%",
      description: "All-time turnover",
    },
    {
      title: "Active Matrices",
      value: "2,847",
      icon: BiNetworkChart,
      color: "from-purple-500 to-pink-600",
      change: "+8.3%",
      description: "Currently active",
    },
    {
      title: "Network Status",
      value: contractActive ? "Active" : "Paused",
      icon: HiOutlineTrendingUp,
      color: contractActive
        ? "from-green-500 to-emerald-600"
        : "from-red-500 to-orange-600",
      description: "Platform status",
    },
  ];

  const userStats = [
    {
      title: "Total Earned",
      value: `${formatNumber(
        parseFloat(x4Earnings) + parseFloat(xxxEarnings)
      )} ${tokenSymbol}`,
      icon: FiDollarSign,
      color: "from-green-500 to-emerald-600",
      change: "+18.2%",
      description: "All programs",
    },
    {
      title: "x4 Earnings",
      value: `${formatNumber(x4Earnings)} ${tokenSymbol}`,
      icon: HiOutlineCube,
      color: "from-blue-500 to-cyan-600",
      change: "+15.7%",
      description: "x4 program only",
    },
    {
      title: "xXx Earnings",
      value: `${formatNumber(xxxEarnings)} ${tokenSymbol}`,
      icon: HiOutlineChartBar,
      color: "from-purple-500 to-pink-600",
      change: "+22.1%",
      description: "xXx program only",
    },
    {
      title: "Token Balance",
      value: `${formatNumber(tokenBalance)} ${tokenSymbol}`,
      icon: FiDollarSign,
      color: "from-orange-500 to-red-600",
      description: "Current wallet balance",
    },
  ];

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
              <FiBarChart2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Platform Statistics
              </h1>
              <p className="text-white/70 text-lg max-w-md mx-auto">
                Connect your wallet to view detailed statistics
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FiBarChart2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Statistics & Analytics
              </h1>
              <p className="text-white/70">
                Comprehensive platform and user metrics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-gray-800">
                All Time
              </option>
              <option value="90d" className="bg-gray-800">
                Last 90 Days
              </option>
              <option value="30d" className="bg-gray-800">
                Last 30 Days
              </option>
              <option value="7d" className="bg-gray-800">
                Last 7 Days
              </option>
            </select>

            {/* Program Filter */}
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-gray-800">
                All Programs
              </option>
              <option value="x4" className="bg-gray-800">
                x4 Matrix
              </option>
              <option value="xxx" className="bg-gray-800">
                xXx Matrix
              </option>
            </select>

            {/* Export Button */}
            <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Global Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* User Statistics */}
        {isRegistered && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Your Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userStats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Earnings Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">
                Daily Earnings Trend
              </h3>
              <FiTrendingUp className="w-5 h-5 text-green-400" />
            </div>

            {/* Simple chart representation */}
            <div className="space-y-4">
              {chartData.dailyEarnings.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-white/70 text-sm">
                    {new Date(day.date).toLocaleDateString("en", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="flex-1 bg-white/10 rounded-full h-2 relative">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full"
                      style={{ width: `${(day.x4 / 200) * 100}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full absolute top-0"
                      style={{
                        left: `${(day.x4 / 200) * 100}%`,
                        width: `${(day.xxx / 200) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-20 text-white text-sm text-right">
                    {formatNumber(day.total)} {tokenSymbol}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-6 mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full" />
                <span className="text-white/70 text-sm">x4 Program</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full" />
                <span className="text-white/70 text-sm">xXx Program</span>
              </div>
            </div>
          </div>

          {/* Program Comparison */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">
                Program Comparison
              </h3>
              <HiOutlineChartBar className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-6">
              {chartData.programComparison.map((program, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {program.program === "x4" ? (
                        <HiOutlineCube className="w-6 h-6 text-blue-400" />
                      ) : (
                        <HiOutlineChartBar className="w-6 h-6 text-purple-400" />
                      )}
                      <span className="text-white font-medium">
                        {program.program} Matrix
                      </span>
                    </div>
                    <span className="text-white text-sm">
                      {formatNumber(program.earnings)} {tokenSymbol}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-xs mb-1">Earnings</div>
                      <div className="text-white font-semibold text-sm">
                        {formatNumber(program.earnings)}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-xs mb-1">Users</div>
                      <div className="text-white font-semibold text-sm">
                        {program.users}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/70 text-xs mb-1">Cycles</div>
                      <div className="text-white font-semibold text-sm">
                        {program.cycles}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">
              Level Distribution
            </h3>
            <FiUsers className="w-5 h-5 text-blue-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {chartData.levelDistribution.map((level, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 text-center"
              >
                <div className="text-white/70 text-sm mb-1">
                  Level {level.level}
                </div>
                <div className="text-white font-bold text-lg mb-2">
                  {level.users}
                </div>
                <div className="text-white/60 text-xs">
                  {formatNumber(level.cost)} {tokenSymbol}
                </div>
                <div className="mt-2 bg-white/10 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      index < 4
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : index < 8
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                        : "bg-gradient-to-r from-red-500 to-pink-600"
                    }`}
                    style={{
                      width: `${Math.min((level.users / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">
              Platform Growth
            </h3>
            <HiOutlineUserGroup className="w-5 h-5 text-green-400" />
          </div>

          <div className="space-y-3">
            {chartData.userGrowth.map((month, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-white/70 text-sm">{month.month}</div>
                <div className="flex-1 bg-white/10 rounded-full h-3 relative">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(month.users / 2000) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-white text-sm text-right">
                  {month.users}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
            <HiOutlineCube className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">View x4 Matrix</h4>
            <p className="text-white/70 text-sm mb-4">
              Detailed x4 matrix statistics and visualization
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1">
              <span>View Details</span>
              <FiEye className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
            <HiOutlineChartBar className="w-8 h-8 text-purple-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">View xXx Matrix</h4>
            <p className="text-white/70 text-sm mb-4">
              Detailed xXx matrix statistics and visualization
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1">
              <span>View Details</span>
              <FiEye className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
            <FiUsers className="w-8 h-8 text-green-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">Team Overview</h4>
            <p className="text-white/70 text-sm mb-4">
              View your referral network and team performance
            </p>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1">
              <span>View Team</span>
              <FiEye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StatsPage;
