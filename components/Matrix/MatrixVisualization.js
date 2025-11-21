import { useState, createElement } from "react";
import { FiUser, FiUsers, FiRefreshCw } from "react-icons/fi";
import { HiOutlineCube, HiOutlineChartBar } from "react-icons/hi";
import { useMatrixData, truncateAddress } from "../../hooks/useContract";

const MatrixVisualization = ({
  program,
  level,
  userAddress,
  title,
  isActive,
}) => {
  const { matrixInfo, matrixReferrals } = useMatrixData(
    userAddress,
    program,
    level
  );
  const [hoveredPosition, setHoveredPosition] = useState(null);

  const programIcon = program === 1 ? HiOutlineCube : HiOutlineChartBar;
  const programColor =
    program === 1 ? "from-blue-500 to-cyan-600" : "from-purple-500 to-pink-600";

  const getMatrixLayout = () => {
    if (program === 1) {
      // x4
      return {
        lines: [
          {
            name: "First Line",
            positions: 2,
            referrals: matrixReferrals[0] || [],
          },
          {
            name: "Second Line",
            positions: 4,
            referrals: matrixReferrals[1] || [],
          },
        ],
        totalPositions: 6,
      };
    } else {
      // xXx
      return {
        lines: [
          {
            name: "First Line",
            positions: 2,
            referrals: matrixReferrals[0] || [],
          },
          {
            name: "Second Line",
            positions: 4,
            referrals: matrixReferrals[1] || [],
          },
          {
            name: "Third Line",
            positions: 8,
            referrals: matrixReferrals[2] || [],
          },
        ],
        totalPositions: 14,
      };
    }
  };

  const layout = getMatrixLayout();
  const filledPositions = layout.lines.reduce(
    (sum, line) => sum + line.referrals.length,
    0
  );

  const renderPosition = (address, index, lineIndex, lineName) => {
    const isEmpty =
      !address || address === "0x0000000000000000000000000000000000000000";
    const positionKey = `${lineIndex}-${index}`;

    return (
      <div
        key={positionKey}
        className={`
          relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-medium
          transition-all duration-300 cursor-pointer
          ${
            isEmpty
              ? "border-white/30 bg-white/5 text-white/40 hover:bg-white/10"
              : `border-transparent bg-gradient-to-r ${programColor} text-white hover:scale-110 shadow-lg`
          }
        `}
        onMouseEnter={() =>
          setHoveredPosition({ address, index, line: lineName, isEmpty })
        }
        onMouseLeave={() => setHoveredPosition(null)}
        title={isEmpty ? "Empty position" : `${truncateAddress(address)}`}
      >
        {isEmpty ? (
          <FiUser className="w-4 h-4" />
        ) : (
          <span className="font-bold">{index + 1}</span>
        )}

        {/* Hover tooltip */}
        {hoveredPosition &&
          hoveredPosition.address === address &&
          hoveredPosition.index === index && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
              <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                {isEmpty ? "Available position" : truncateAddress(address)}
                <div className="text-white/60">
                  {lineName} - Position {index + 1}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const renderConnectionLines = () => {
    if (program === 1) {
      // x4 connections
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* You to first line */}
          <line
            x1="50%"
            y1="15%"
            x2="35%"
            y2="35%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="50%"
            y1="15%"
            x2="65%"
            y2="35%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* First line to second line */}
          <line
            x1="35%"
            y1="45%"
            x2="25%"
            y2="65%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="35%"
            y1="45%"
            x2="40%"
            y2="65%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="65%"
            y1="45%"
            x2="60%"
            y2="65%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="65%"
            y1="45%"
            x2="75%"
            y2="65%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      );
    } else {
      // xXx connections
      return (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* You to first line */}
          <line
            x1="50%"
            y1="12%"
            x2="40%"
            y2="28%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="50%"
            y1="12%"
            x2="60%"
            y2="28%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* First line to second line */}
          <line
            x1="40%"
            y1="38%"
            x2="30%"
            y2="50%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="40%"
            y1="38%"
            x2="40%"
            y2="50%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="60%"
            y1="38%"
            x2="60%"
            y2="50%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="60%"
            y1="38%"
            x2="70%"
            y2="50%"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Second line to third line */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line
                x1={`${30 + i * 13.33}%`}
                y1="60%"
                x2={`${18.75 + i * 8.75}%`}
                y2="75%"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1={`${30 + i * 13.33}%`}
                y1="60%"
                x2={`${27.5 + i * 8.75}%`}
                y2="75%"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </g>
          ))}
        </svg>
      );
    }
  };

  if (!isActive) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8">
        <div className="text-center">
          <div
            className={`w-16 h-16 bg-gradient-to-r ${programColor} rounded-full flex items-center justify-center mx-auto mb-4 opacity-50`}
          >
            {createElement(programIcon, {
              className: "w-8 h-8 text-white",
            })}
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
          <p className="text-white/60 mb-6">This level is not yet activated</p>
          <button
            className={`bg-gradient-to-r ${programColor} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all`}
          >
            Activate Level {level}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${programColor} rounded-lg flex items-center justify-center`}
            >
              {createElement(programIcon, {
                className: "w-5 h-5 text-white",
              })}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <p className="text-white/60 text-sm">
                {filledPositions}/{layout.totalPositions} positions filled
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-white/70 text-xs">Cycles</div>
              <div className="text-white font-semibold flex items-center space-x-1">
                <FiRefreshCw className="w-4 h-4" />
                <span>{matrixInfo.reinvestCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${programColor} h-2 rounded-full transition-all duration-500`}
            style={{
              width: `${(filledPositions / layout.totalPositions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="p-8 relative min-h-96">
        {renderConnectionLines()}

        <div className="relative z-10 space-y-8">
          {/* You */}
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${programColor} rounded-xl flex items-center justify-center border-4 border-white/50 shadow-xl`}
            >
              <span className="text-white font-bold text-sm">YOU</span>
            </div>
          </div>

          {/* Matrix Lines */}
          {layout.lines.map((line, lineIndex) => (
            <div key={lineIndex} className="space-y-3">
              <div className="text-center">
                <div className="text-white/70 text-sm font-medium">
                  {line.name} ({line.referrals.length}/{line.positions})
                </div>
              </div>

              <div
                className={`flex justify-center items-center ${
                  line.positions <= 4 ? "space-x-4" : "space-x-2"
                }`}
              >
                {[...Array(line.positions)].map((_, index) =>
                  renderPosition(
                    line.referrals[index],
                    index,
                    lineIndex,
                    line.name
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Matrix completion animation */}
        {filledPositions === layout.totalPositions && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border-2 border-green-500/50 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FiRefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                Matrix Complete!
              </h3>
              <p className="text-green-200 text-sm">Ready for reinvestment</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-6 border-t border-white/20 bg-white/5">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-white/70 text-xs mb-1">Total Positions</div>
            <div className="text-white font-semibold">
              {filledPositions}/{layout.totalPositions}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70 text-xs mb-1">Completion</div>
            <div className="text-white font-semibold">
              {Math.round((filledPositions / layout.totalPositions) * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70 text-xs mb-1">Next Cycle</div>
            <div className="text-white font-semibold">
              {layout.totalPositions - filledPositions} more
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixVisualization;
