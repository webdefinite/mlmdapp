import { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiUsers, FiRefreshCw } from "react-icons/fi";
import { useMatrixData } from "../../hooks/useContract";

const MatrixPreview = ({ title, program, userAddress, icon: Icon, color }) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const { matrixInfo, matrixReferrals, isLevelActive } = useMatrixData(
    userAddress,
    program,
    selectedLevel
  );

  const getMatrixPositions = () => {
    if (program === 1) {
      // x4
      return {
        firstLine: matrixReferrals[0] || [],
        secondLine: matrixReferrals[1] || [],
        maxPositions: { firstLine: 2, secondLine: 4 },
      };
    } else {
      // xXx
      return {
        firstLine: matrixReferrals[0] || [],
        secondLine: matrixReferrals[1] || [],
        thirdLine: matrixReferrals[2] || [],
        maxPositions: { firstLine: 2, secondLine: 4, thirdLine: 8 },
      };
    }
  };

  const positions = getMatrixPositions();

  const renderPosition = (address, index, line) => {
    const isEmpty =
      !address || address === "0x0000000000000000000000000000000000000000";

    return (
      <div
        key={`${line}-${index}`}
        className={`
          w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-medium
          ${
            isEmpty
              ? "border-white/30 bg-white/5 text-white/40"
              : `border-gradient-to-r ${color} bg-gradient-to-r ${color} text-white`
          }
        `}
        title={
          isEmpty
            ? "Empty position"
            : `${address.slice(0, 6)}...${address.slice(-4)}`
        }
      >
        {isEmpty ? "?" : index + 1}
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <p className="text-white/60 text-sm">Level {selectedLevel}</p>
            </div>
          </div>
          <Link
            href={`/matrix/${program === 1 ? "x4" : "xxx"}`}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <span className="text-sm mr-1">View All</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Level selector */}
        <div className="flex items-center space-x-2">
          <span className="text-white/70 text-sm">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1} className="bg-gray-800">
                Level {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="p-6">
        {!isLevelActive ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 text-sm mb-4">
              Level {selectedLevel} not active
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all">
              Activate Level
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* You */}
            <div className="flex justify-center">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center border-2 border-white/50`}
              >
                <span className="text-white font-bold">YOU</span>
              </div>
            </div>

            {/* First Line */}
            <div className="space-y-2">
              <div className="text-white/70 text-xs text-center">
                First Line ({positions.firstLine.length}/
                {positions.maxPositions.firstLine})
              </div>
              <div className="flex justify-center space-x-3">
                {[...Array(positions.maxPositions.firstLine)].map((_, i) =>
                  renderPosition(positions.firstLine[i], i, "first")
                )}
              </div>
            </div>

            {/* Second Line */}
            <div className="space-y-2">
              <div className="text-white/70 text-xs text-center">
                Second Line ({positions.secondLine.length}/
                {positions.maxPositions.secondLine})
              </div>
              <div className="flex justify-center space-x-2">
                {[...Array(positions.maxPositions.secondLine)].map((_, i) =>
                  renderPosition(positions.secondLine[i], i, "second")
                )}
              </div>
            </div>

            {/* Third Line (xXx only) */}
            {program === 2 && (
              <div className="space-y-2">
                <div className="text-white/70 text-xs text-center">
                  Third Line ({positions.thirdLine.length}/
                  {positions.maxPositions.thirdLine})
                </div>
                <div className="flex justify-center space-x-1">
                  {[...Array(positions.maxPositions.thirdLine)].map((_, i) =>
                    renderPosition(positions.thirdLine[i], i, "third")
                  )}
                </div>
              </div>
            )}

            {/* Matrix Stats */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Cycles Completed:</span>
                <span className="text-white font-semibold">
                  {matrixInfo.reinvestCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Total Positions:</span>
                <span className="text-white font-semibold">
                  {positions.firstLine.length +
                    positions.secondLine.length +
                    (positions.thirdLine?.length || 0)}
                  /{program === 1 ? 6 : 14}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Status:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      matrixInfo.blocked ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                  <span className="text-white text-sm">
                    {matrixInfo.blocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixPreview;
