import { useState, useEffect } from "react";
import { FiUser, FiDollarSign, FiTrendingUp, FiClock } from "react-icons/fi";
import { HiOutlineCube, HiOutlineChartBar } from "react-icons/hi";
import { truncateAddress, formatNumber } from "../../hooks/useContract";

const RecentActivity = ({ userAddress }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // This would typically fetch from contract events or API
  // For now, we'll use mock data structure
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      try {
        // Mock activity data - replace with actual contract event fetching
        const mockActivities = [
          {
            id: 1,
            type: "new_referral",
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            data: {
              referral: "0x742d35c6db65327b398d5c7e7c6b76b2b0b2e4e",
              program: 1,
              level: 1,
            },
          },
          {
            id: 2,
            type: "payment_received",
            timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
            data: {
              from: "0x8ba1f109551bd432803012645hac136c34f67a7",
              amount: "25.5",
              program: 2,
              level: 3,
            },
          },
          {
            id: 3,
            type: "level_purchased",
            timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
            data: {
              program: 1,
              level: 4,
              cost: "40",
            },
          },
          {
            id: 4,
            type: "matrix_completed",
            timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            data: {
              program: 2,
              level: 2,
              cycles: 1,
            },
          },
        ];

        setActivities(mockActivities);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userAddress) {
      fetchRecentActivity();
    }
  }, [userAddress]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "new_referral":
        return FiUser;
      case "payment_received":
        return FiDollarSign;
      case "level_purchased":
        return FiTrendingUp;
      case "matrix_completed":
        return FiTrendingUp;
      default:
        return FiClock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "new_referral":
        return "from-blue-500 to-cyan-600";
      case "payment_received":
        return "from-green-500 to-emerald-600";
      case "level_purchased":
        return "from-purple-500 to-pink-600";
      case "matrix_completed":
        return "from-orange-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const formatActivityText = (activity) => {
    switch (activity.type) {
      case "new_referral":
        return {
          title: "New Referral",
          description: `${truncateAddress(
            activity.data.referral
          )} joined your ${
            activity.data.program === 1 ? "x4" : "xXx"
          } matrix level ${activity.data.level}`,
        };
      case "payment_received":
        return {
          title: "Payment Received",
          description: `+${formatNumber(activity.data.amount)} LINKTUM from ${
            activity.data.program === 1 ? "x4" : "xXx"
          } level ${activity.data.level}`,
        };
      case "level_purchased":
        return {
          title: "Level Purchased",
          description: `Activated ${
            activity.data.program === 1 ? "x4" : "xXx"
          } level ${activity.data.level} for ${formatNumber(
            activity.data.cost
          )} LINKTUM`,
        };
      case "matrix_completed":
        return {
          title: "Matrix Completed",
          description: `${activity.data.program === 1 ? "x4" : "xXx"} level ${
            activity.data.level
          } completed cycle ${activity.data.cycles}`,
        };
      default:
        return {
          title: "Activity",
          description: "Unknown activity",
        };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded mb-2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <button className="text-white/70 hover:text-white transition-colors text-sm">
          View All
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FiClock className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-sm">No recent activity</p>
          <p className="text-white/40 text-xs mt-2">
            Activity will appear here as you interact with the platform
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            const { title, description } = formatActivityText(activity);

            return (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm mb-1">
                    {title}
                  </h3>
                  <p className="text-white/70 text-xs truncate">
                    {description}
                  </p>
                </div>

                <div className="text-white/60 text-xs flex-shrink-0">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/20">
          <button className="w-full text-white/70 hover:text-white transition-colors text-sm font-medium">
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
