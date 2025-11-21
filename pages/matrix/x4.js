import { useState } from "react";
import { useAccount } from "wagmi";
import { HiOutlineCube } from "react-icons/hi";
import { FiUsers, FiTrendingUp, FiRefreshCw, FiPlus } from "react-icons/fi";
import Layout from "../../components/Layout/Layout";
import StatsCard from "../../components/Cards/StatsCard";
import LevelPurchaseModal from "../../components/Modals/LevelPurchaseModal";
import MatrixVisualization from "../../components/Matrix/MatrixVisualization";
import {
  useMatrixData,
  useUserData,
  useMatrixContract,
  formatNumber,
} from "../../hooks/useContract";

const X4MatrixPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { userInfo, isRegistered, x4Earnings } = useUserData(address);
  const { levelCosts } = useMatrixContract();
  const { matrixInfo, matrixReferrals, isLevelActive } = useMatrixData(
    address,
    1,
    selectedLevel
  );

  const x4Stats = [
    {
      title: "Total Earned",
      value: `${formatNumber(x4Earnings)} LINKTUM`,
      icon: FiTrendingUp,
      color: "from-green-500 to-emerald-600",
      change: "+12.5%",
    },
    {
      title: "Active Levels",
      value: getActiveLevelsCount(),
      icon: HiOutlineCube,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Total Referrals",
      value: getTotalReferralsCount(),
      icon: FiUsers,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Cycles Completed",
      // value: matrixInfo.reinvestCount || 0,
      value: matrixInfo[3] || 0,
      icon: FiRefreshCw,
      color: "from-orange-500 to-red-600",
    },
  ];

  console.log(matrixInfo);
  function getActiveLevelsCount() {
    // This would check all levels - simplified for demo
    let count = 0;
    for (let i = 1; i <= 12; i++) {
      // You'd check each level's active status here
      if (i === 1 && isRegistered) count++; // Simplified check
    }
    return count.toString();
  }

  function getTotalReferralsCount() {
    const firstLine = matrixReferrals[0] || [];
    const secondLine = matrixReferrals[1] || [];
    return (firstLine.length + secondLine.length).toString();
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineCube className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">x4 Matrix</h1>
              <p className="text-white/70 text-lg max-w-md mx-auto">
                Connect your wallet to view your x4 matrix
              </p>
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
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl mx-auto flex items-center justify-center">
              <HiOutlineCube className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">x4 Matrix</h1>
              <p className="text-white/70 text-lg max-w-md mx-auto mb-8">
                Register to access the x4 matrix program
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-700 transition-all">
                Register Now
              </button>
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
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <HiOutlineCube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">x4 Matrix</h1>
              <p className="text-white/70">
                2x2 Matrix with 6 positions per cycle
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Level Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-gray-800">
                    Level {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Button */}
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
            >
              <FiPlus className="w-4 h-4" />
              <span>Upgrade Level</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {x4Stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Matrix Visualization */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Level Matrix */}
          <div className="lg:col-span-2">
            <MatrixVisualization
              program={1}
              level={selectedLevel}
              userAddress={address}
              title={`x4 Level ${selectedLevel}`}
              isActive={isLevelActive}
            />
          </div>

          {/* Level Information */}
          <div className="space-y-6">
            {/* Level Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                Level {selectedLevel} Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isLevelActive
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {isLevelActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cost:</span>
                  <span className="text-white font-semibold">
                    {levelCosts[selectedLevel - 1]
                      ? formatNumber(
                          parseFloat(levelCosts[selectedLevel - 1]) / 10 ** 18
                        )
                      : "0"}{" "}
                    LINKTUM
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Matrix Size:</span>
                  <span className="text-white">2x2 (6 positions)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Filled Positions:</span>
                  <span className="text-white">
                    {getTotalReferralsCount()}/6
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cycles:</span>
                  <span className="text-white">
                    {matrixInfo.reinvestCount || 0}
                  </span>
                </div>
              </div>

              {!isLevelActive && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
                >
                  Activate Level {selectedLevel}
                </button>
              )}
            </div>

            {/* How x4 Works */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                How x4 Works
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-white/80">
                    <span className="text-white font-medium">
                      First Line (2 positions):
                    </span>
                    Payments go to your upline partner
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-white/80">
                    <span className="text-white font-medium">
                      Second Line (4 positions):
                    </span>
                    Payments come directly to you
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-white/80">
                    <span className="text-white font-medium">
                      Matrix Complete:
                    </span>
                    Auto-reinvest and start new cycle
                  </p>
                </div>
              </div>
            </div>

            {/* All Levels Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">
                All Levels
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...Array(12)].map((_, i) => {
                  const level = i + 1;
                  const cost = levelCosts[i]
                    ? parseFloat(levelCosts[i]) / 10 ** 18
                    : 0;
                  // For demo, we'll show level 1 as active if registered
                  const active = level === 1 && isRegistered;

                  return (
                    <div
                      key={level}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedLevel === level
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedLevel(level)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            active
                              ? "bg-green-500 text-white"
                              : "bg-white/20 text-white/60"
                          }`}
                        >
                          {level}
                        </div>
                        <span className="text-white text-sm">
                          Level {level}
                        </span>
                      </div>
                      <span className="text-white/70 text-xs">
                        {formatNumber(cost)} LINKTUM
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LevelPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        program={1}
      />
    </Layout>
  );
};

export default X4MatrixPage;
