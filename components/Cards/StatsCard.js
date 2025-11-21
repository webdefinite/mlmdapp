import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  change,
  description,
}) => {
  const isPositive = change && change.startsWith("+");

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="w-4 h-4" />
            ) : (
              <FiTrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-white/70 text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-white/60 text-xs mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
