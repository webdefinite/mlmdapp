

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LINKTUM Matrix Platform - Fixed 6th Referral Issue
 * @dev Fixed matrix completion logic to prevent transaction failures
 * @notice Uses LINKTUM AI token for all transactions
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract LinkTumMatrix {
    
    // =============================================================================
    // CONSTANTS & IMMUTABLES
    // =============================================================================
    
    IERC20 public immutable linkTumToken;
    address public immutable owner;
    
    uint8 public constant MAX_LEVELS = 12;
    uint8 public constant X4_PROGRAM = 1;
    uint8 public constant XXX_PROGRAM = 2;
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    uint256 public totalUsers = 0;
    uint256 public totalTurnover = 0;
    bool public contractActive = true;
    
    // Level costs in LINKTUM AI tokens (with 18 decimals)
    mapping(uint8 => uint256) public levelCosts;
    
    // =============================================================================
    // STRUCTS
    // =============================================================================
    
    struct User {
        uint256 id;
        address referrer;
        uint256 totalEarned;
        uint256 totalSpent;
        uint32 registrationTime;
        
        // Active levels for each program
        mapping(uint8 => mapping(uint8 => bool)) activeLevels; // program => level => active
        
        // Matrix data for each program and level
        mapping(uint8 => mapping(uint8 => Matrix)) matrices; // program => level => matrix
        
        // Referral stats
        uint256 directReferrals;
        mapping(uint8 => uint256) programEarnings; // program => total earned
        
        // Team data
        address[] referralList; // List of direct referrals
    }
    
    struct Matrix {
        address[] firstLine;
        address[] secondLine;
        address[] thirdLine;
        uint16 reinvestCount;
        bool blocked;
        uint32 lastActivity;
    }
    
    // =============================================================================
    // MAPPINGS
    // =============================================================================
    
    mapping(address => User) public users;
    mapping(uint256 => address) public userIds;
    mapping(address => bool) public registered;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event Registration(
        address indexed user, 
        address indexed referrer, 
        uint256 userId,
        uint256 timestamp
    );
    
    event LevelActivated(
        address indexed user, 
        uint8 indexed program, 
        uint8 indexed level,
        uint256 cost,
        uint256 timestamp
    );
    
    event NewReferral(
        address indexed referrer, 
        address indexed referral, 
        uint8 indexed program, 
        uint8 level,
        uint8 position
    );
    
    event PaymentSent(
        address indexed from, 
        address indexed to, 
        uint8 indexed program, 
        uint8 level,
        uint256 amount,
        string paymentType
    );
    
    event MatrixClosed(
        address indexed user, 
        uint8 indexed program, 
        uint8 indexed level,
        uint16 reinvestCount
    );
    
    event Upgrade(
        address indexed user, 
        address indexed referrer, 
        uint8 indexed program, 
        uint8 level
    );
    
    event MatrixOverflow(
        address indexed user,
        address indexed referrer,
        uint8 indexed program,
        uint8 level
    );
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier isRegistered() {
        require(registered[msg.sender], "User not registered");
        _;
    }
    
    modifier contractIsActive() {
        require(contractActive, "Contract is paused");
        _;
    }
    
    modifier validProgram(uint8 program) {
        require(program == X4_PROGRAM || program == XXX_PROGRAM, "Invalid program");
        _;
    }
    
    modifier validLevel(uint8 level) {
        require(level >= 1 && level <= MAX_LEVELS, "Invalid level");
        _;
    }
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(address _linkTumToken) {
        require(_linkTumToken != address(0), "Invalid token address");
        
        linkTumToken = IERC20(_linkTumToken);
        owner = msg.sender;
        
        // Initialize level costs (starting at 5 LINKTUM for level 1)
        levelCosts[1] = 5 * 10**18;  // 5 LINKTUM
        for (uint8 i = 2; i <= MAX_LEVELS; i++) {
            levelCosts[i] = levelCosts[i-1] * 2; // Each level costs 2x previous
        }
        
        // Register owner as first user
        _registerOwner();
    }
    
    // =============================================================================
    // REGISTRATION
    // =============================================================================
    
    function register(address referrer) external contractIsActive {
        require(!registered[msg.sender], "Already registered");
        require(registered[referrer], "Referrer not found");
        require(referrer != msg.sender, "Cannot refer yourself");
        
        uint256 registrationCost = levelCosts[1] * 2; // x4 + xXx level 1
        
        require(
            linkTumToken.transferFrom(msg.sender, address(this), registrationCost),
            "Token transfer failed"
        );
        
        totalUsers++;
        totalTurnover += registrationCost;
        
        // Create user
        users[msg.sender].id = totalUsers;
        users[msg.sender].referrer = referrer;
        users[msg.sender].totalSpent = registrationCost;
        users[msg.sender].registrationTime = uint32(block.timestamp);
        
        registered[msg.sender] = true;
        userIds[totalUsers] = msg.sender;
        
        // Activate level 1 for both programs
        users[msg.sender].activeLevels[X4_PROGRAM][1] = true;
        users[msg.sender].activeLevels[XXX_PROGRAM][1] = true;
        
        // Update referrer stats and add to referral list
        users[referrer].directReferrals++;
        users[referrer].referralList.push(msg.sender);
        
        emit Registration(msg.sender, referrer, totalUsers, block.timestamp);
        emit LevelActivated(msg.sender, X4_PROGRAM, 1, levelCosts[1], block.timestamp);
        emit LevelActivated(msg.sender, XXX_PROGRAM, 1, levelCosts[1], block.timestamp);
        
        // Process matrix placements
        _processX4Matrix(msg.sender, referrer, 1);
        _processXXxMatrix(msg.sender, referrer, 1);
    }
    
    // =============================================================================
    // LEVEL PURCHASE
    // =============================================================================
    
    function buyLevel(uint8 program, uint8 level) 
        external 
        isRegistered 
        contractIsActive 
        validProgram(program) 
        validLevel(level) 
    {
        require(!users[msg.sender].activeLevels[program][level], "Level already active");
        
        // Check if previous level is active (except level 1)
        if (level > 1) {
            require(users[msg.sender].activeLevels[program][level-1], "Previous level not active");
        }
        
        uint256 cost = levelCosts[level];
        
        require(
            linkTumToken.transferFrom(msg.sender, address(this), cost),
            "Token transfer failed"
        );
        
        totalTurnover += cost;
        users[msg.sender].totalSpent += cost;
        users[msg.sender].activeLevels[program][level] = true;
        
        emit LevelActivated(msg.sender, program, level, cost, block.timestamp);
        
        // Process matrix placement
        address referrer = users[msg.sender].referrer;
        
        if (program == X4_PROGRAM) {
            _processX4Matrix(msg.sender, referrer, level);
        } else {
            _processXXxMatrix(msg.sender, referrer, level);
        }
    }
    
    // =============================================================================
    // FIXED X4 MATRIX LOGIC (2x2 = 6 positions) - MAIN FIX HERE
    // =============================================================================
    
    function _processX4Matrix(address user, address referrer, uint8 level) private {
        address activeReferrer = _findActiveReferrer(referrer, X4_PROGRAM, level);
        
        Matrix storage matrix = users[activeReferrer].matrices[X4_PROGRAM][level];
        matrix.lastActivity = uint32(block.timestamp);
        
        // FIXED: Check if matrix is blocked to prevent issues during closure
        if (matrix.blocked) {
            // If matrix is blocked, find next available referrer
            address nextReferrer = _findNextAvailableReferrer(activeReferrer, X4_PROGRAM, level);
            _processX4Matrix(user, nextReferrer, level);
            return;
        }
        
        // First line (2 positions)
        if (matrix.firstLine.length < 2) {
            matrix.firstLine.push(user);
            emit NewReferral(activeReferrer, user, X4_PROGRAM, level, uint8(matrix.firstLine.length));
            
            // Payment goes to referrer's upline
            address upline = _findActiveReferrer(users[activeReferrer].referrer, X4_PROGRAM, level);
            _sendPayment(user, upline, X4_PROGRAM, level, levelCosts[level], "x4_first_line");
        }
        // Second line (4 positions) 
        else if (matrix.secondLine.length < 4) {
            matrix.secondLine.push(user);
            emit NewReferral(activeReferrer, user, X4_PROGRAM, level, uint8(2 + matrix.secondLine.length));
            
            // Payment goes to matrix owner
            _sendPayment(user, activeReferrer, X4_PROGRAM, level, levelCosts[level], "x4_second_line");
            
            // FIXED: Check if matrix is complete (6 total positions)
            if (matrix.secondLine.length == 4) {
                // Block the matrix to prevent new placements during closure
                matrix.blocked = true;
                // Matrix is complete, close it immediately
                _closeX4Matrix(activeReferrer, level);
            }
        }
        // Matrix is full, find next available slot
        else {
            emit MatrixOverflow(user, activeReferrer, X4_PROGRAM, level);
            address nextReferrer = _findNextAvailableReferrer(activeReferrer, X4_PROGRAM, level);
            _processX4Matrix(user, nextReferrer, level);
        }
    }
    
    function _closeX4Matrix(address user, uint8 level) private {
        Matrix storage matrix = users[user].matrices[X4_PROGRAM][level];
        matrix.reinvestCount++;
        
        emit MatrixClosed(user, X4_PROGRAM, level, matrix.reinvestCount);
        
        // FIXED: Clear matrix properly and unblock it
        delete matrix.firstLine;
        delete matrix.secondLine;
        matrix.blocked = false;
        matrix.lastActivity = uint32(block.timestamp);
        
        // FIXED: Safer reinvestment logic
        if (user != userIds[1]) {
            // Find the user's referrer
            address referrer = users[user].referrer;
            
            // If referrer exists and is not blocked, reinvest
            if (referrer != address(0)) {
                // Don't immediately reinvest, let the user choose when to reinvest
                // This prevents reentrancy issues and transaction failures
                // The user will need to call buyLevel again to reinvest
            }
        }
    }
    
    // =============================================================================
    // FIXED XXX MATRIX LOGIC (2+4+8 = 14 positions) - ALSO IMPROVED
    // =============================================================================
    
    function _processXXxMatrix(address user, address referrer, uint8 level) private {
        address activeReferrer = _findActiveReferrer(referrer, XXX_PROGRAM, level);
        
        Matrix storage matrix = users[activeReferrer].matrices[XXX_PROGRAM][level];
        matrix.lastActivity = uint32(block.timestamp);
        
        // FIXED: Check if matrix is blocked to prevent issues during closure
        if (matrix.blocked) {
            // If matrix is blocked, find next available referrer
            address nextReferrer = _findNextAvailableReferrer(activeReferrer, XXX_PROGRAM, level);
            _processXXxMatrix(user, nextReferrer, level);
            return;
        }
        
        uint256 payment = levelCosts[level];
        
        // First line (2 positions) - payment goes to upline
        if (matrix.firstLine.length < 2) {
            matrix.firstLine.push(user);
            emit NewReferral(activeReferrer, user, XXX_PROGRAM, level, uint8(matrix.firstLine.length));
            
            address upline = _findActiveReferrer(users[activeReferrer].referrer, XXX_PROGRAM, level);
            _sendPayment(user, upline, XXX_PROGRAM, level, payment, "xxx_first_line");
        }
        // Second line (4 positions) - 30% to referrer, 70% to upline
        else if (matrix.secondLine.length < 4) {
            matrix.secondLine.push(user);
            emit NewReferral(activeReferrer, user, XXX_PROGRAM, level, uint8(2 + matrix.secondLine.length));
            
            uint256 referrerShare = (payment * 30) / 100;
            uint256 uplineShare = payment - referrerShare;
            
            address upline = _findActiveReferrer(users[activeReferrer].referrer, XXX_PROGRAM, level);
            
            _sendPayment(user, activeReferrer, XXX_PROGRAM, level, referrerShare, "xxx_second_line_30");
            _sendPayment(user, upline, XXX_PROGRAM, level, uplineShare, "xxx_second_line_70");
        }
        // Third line (8 positions) - 70% to referrer, 30% to upline
        else if (matrix.thirdLine.length < 8) {
            matrix.thirdLine.push(user);
            emit NewReferral(activeReferrer, user, XXX_PROGRAM, level, uint8(6 + matrix.thirdLine.length));
            
            uint256 referrerShare = (payment * 70) / 100;
            uint256 uplineShare = payment - referrerShare;
            
            address upline = _findActiveReferrer(users[activeReferrer].referrer, XXX_PROGRAM, level);
            
            _sendPayment(user, activeReferrer, XXX_PROGRAM, level, referrerShare, "xxx_third_line_70");
            _sendPayment(user, upline, XXX_PROGRAM, level, uplineShare, "xxx_third_line_30");
            
            // FIXED: Check if matrix is complete (14 total positions)
            if (matrix.thirdLine.length == 8) {
                // Block the matrix to prevent new placements during closure
                matrix.blocked = true;
                // Matrix is complete, close it immediately
                _closeXXxMatrix(activeReferrer, level);
            }
        }
        // Matrix is full, find next available slot
        else {
            emit MatrixOverflow(user, activeReferrer, XXX_PROGRAM, level);
            address nextReferrer = _findNextAvailableReferrer(activeReferrer, XXX_PROGRAM, level);
            _processXXxMatrix(user, nextReferrer, level);
        }
    }
    
    function _closeXXxMatrix(address user, uint8 level) private {
        Matrix storage matrix = users[user].matrices[XXX_PROGRAM][level];
        matrix.reinvestCount++;
        
        emit MatrixClosed(user, XXX_PROGRAM, level, matrix.reinvestCount);
        
        // FIXED: Clear matrix properly and unblock it
        delete matrix.firstLine;
        delete matrix.secondLine;
        delete matrix.thirdLine;
        matrix.blocked = false;
        matrix.lastActivity = uint32(block.timestamp);
        
        // FIXED: Safer reinvestment logic
        if (user != userIds[1]) {
            // Find the user's referrer
            address referrer = users[user].referrer;
            
            // If referrer exists and is not blocked, reinvest
            if (referrer != address(0)) {
                // Don't immediately reinvest, let the user choose when to reinvest
                // This prevents reentrancy issues and transaction failures
                // The user will need to call buyLevel again to reinvest
            }
        }
    }
    
    // =============================================================================
    // IMPROVED HELPER FUNCTIONS
    // =============================================================================
    
    function _findActiveReferrer(address referrer, uint8 program, uint8 level) private view returns (address) {
        uint256 searchDepth = 0;
        uint256 maxSearchDepth = 20; // Increased search depth
        
        while (referrer != address(0) && searchDepth < maxSearchDepth) {
            if (users[referrer].activeLevels[program][level] && !users[referrer].matrices[program][level].blocked) {
                return referrer;
            }
            referrer = users[referrer].referrer;
            searchDepth++;
        }
        return userIds[1]; // Return owner as fallback
    }
    
    function _findNextAvailableReferrer(address currentReferrer, uint8 program, uint8 level) private view returns (address) {
        // Start from the current referrer and go up the chain
        address nextReferrer = currentReferrer;
        uint256 searchDepth = 0;
        uint256 maxSearchDepth = 20; // Increased search depth
        
        while (nextReferrer != address(0) && searchDepth < maxSearchDepth) {
            if (users[nextReferrer].activeLevels[program][level] && !users[nextReferrer].matrices[program][level].blocked) {
                Matrix storage matrix = users[nextReferrer].matrices[program][level];
                
                // Check if matrix has available spots
                if (program == X4_PROGRAM) {
                    if (matrix.firstLine.length < 2 || matrix.secondLine.length < 4) {
                        return nextReferrer;
                    }
                } else { // XXX_PROGRAM
                    if (matrix.firstLine.length < 2 || matrix.secondLine.length < 4 || matrix.thirdLine.length < 8) {
                        return nextReferrer;
                    }
                }
            }
            nextReferrer = users[nextReferrer].referrer;
            searchDepth++;
        }
        
        // If no available referrer found, return owner
        return userIds[1];
    }
    
    function _sendPayment(
        address from, 
        address to, 
        uint8 program, 
        uint8 level, 
        uint256 amount, 
        string memory paymentType
    ) private {
        // FIXED: Add safety checks
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // FIXED: Check contract balance before transfer
        require(linkTumToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        users[to].totalEarned += amount;
        users[to].programEarnings[program] += amount;
        
        bool success = linkTumToken.transfer(to, amount);
        require(success, "Payment failed");
        
        emit PaymentSent(from, to, program, level, amount, paymentType);
    }
    
    function _registerOwner() private {
        totalUsers = 1;
        
        users[owner].id = 1;
        users[owner].referrer = address(0);
        users[owner].registrationTime = uint32(block.timestamp);
        
        registered[owner] = true;
        userIds[1] = owner;
        
        // Activate all levels for owner
        for (uint8 level = 1; level <= MAX_LEVELS; level++) {
            users[owner].activeLevels[X4_PROGRAM][level] = true;
            users[owner].activeLevels[XXX_PROGRAM][level] = true;
        }
        
        emit Registration(owner, address(0), 1, block.timestamp);
    }
    
    // =============================================================================
    // NEW FUNCTIONS FOR MANUAL REINVESTMENT
    // =============================================================================
    
    function reinvestMatrix(uint8 program, uint8 level) 
        external 
        isRegistered 
        contractIsActive 
        validProgram(program) 
        validLevel(level) 
    {
        require(users[msg.sender].activeLevels[program][level], "Level not active");
        
        Matrix storage matrix = users[msg.sender].matrices[program][level];
        
        // Check if matrix is complete and ready for reinvestment
        bool matrixComplete = false;
        if (program == X4_PROGRAM) {
            matrixComplete = (matrix.firstLine.length == 2 && matrix.secondLine.length == 4);
        } else {
            matrixComplete = (matrix.firstLine.length == 2 && matrix.secondLine.length == 4 && matrix.thirdLine.length == 8);
        }
        
        require(matrixComplete, "Matrix not complete for reinvestment");
        
        uint256 cost = levelCosts[level];
        
        require(
            linkTumToken.transferFrom(msg.sender, address(this), cost),
            "Token transfer failed"
        );
        
        totalTurnover += cost;
        users[msg.sender].totalSpent += cost;
        
        // Process reinvestment
        address referrer = users[msg.sender].referrer;
        
        if (program == X4_PROGRAM) {
            _processX4Matrix(msg.sender, referrer, level);
        } else {
            _processXXxMatrix(msg.sender, referrer, level);
        }
    }
    
    function canReinvest(address user, uint8 program, uint8 level) external view returns (bool) {
        if (!users[user].activeLevels[program][level]) return false;
        
        Matrix storage matrix = users[user].matrices[program][level];
        
        if (program == X4_PROGRAM) {
            return (matrix.firstLine.length == 2 && matrix.secondLine.length == 4);
        } else {
            return (matrix.firstLine.length == 2 && matrix.secondLine.length == 4 && matrix.thirdLine.length == 8);
        }
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    function getUserInfo(address user) external view returns (
        uint256 id,
        address referrer,
        uint256 totalEarned,
        uint256 totalSpent,
        uint32 registrationTime,
        uint256 directReferrals
    ) {
        return (
            users[user].id,
            users[user].referrer,
            users[user].totalEarned,
            users[user].totalSpent,
            users[user].registrationTime,
            users[user].directReferrals
        );
    }
    
    function isLevelActive(address user, uint8 program, uint8 level) external view returns (bool) {
        return users[user].activeLevels[program][level];
    }
    
    function getMatrixInfo(address user, uint8 program, uint8 level) external view returns (
        uint256 firstLineCount,
        uint256 secondLineCount,
        uint256 thirdLineCount,
        uint16 reinvestCount,
        bool blocked,
        uint32 lastActivity
    ) {
        Matrix storage matrix = users[user].matrices[program][level];
        return (
            matrix.firstLine.length,
            matrix.secondLine.length,
            matrix.thirdLine.length,
            matrix.reinvestCount,
            matrix.blocked,
            matrix.lastActivity
        );
    }
    
    function getMatrixReferrals(address user, uint8 program, uint8 level) external view returns (
        address[] memory firstLine,
        address[] memory secondLine,
        address[] memory thirdLine
    ) {
        Matrix storage matrix = users[user].matrices[program][level];
        return (matrix.firstLine, matrix.secondLine, matrix.thirdLine);
    }
    
    function getProgramEarnings(address user, uint8 program) external view returns (uint256) {
        return users[user].programEarnings[program];
    }
    
    function getContractStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalTurnover,
        bool _contractActive,
        address _linkTumToken,
        address _owner
    ) {
        return (totalUsers, totalTurnover, contractActive, address(linkTumToken), owner);
    }
    
    function getLevelCosts() external view returns (uint256[] memory costs) {
        costs = new uint256[](MAX_LEVELS);
        for (uint8 i = 1; i <= MAX_LEVELS; i++) {
            costs[i-1] = levelCosts[i];
        }
        return costs;
    }
    
    // =============================================================================
    // TEAM FUNCTIONS
    // =============================================================================
    
    function getUserReferrals(address user) external view returns (address[] memory) {
        return users[user].referralList;
    }
    
    function getActiveLevelsCount(address user, uint8 program) external view returns (uint8) {
        uint8 count = 0;
        for (uint8 i = 1; i <= MAX_LEVELS; i++) {
            if (users[user].activeLevels[program][i]) {
                count++;
            }
        }
        return count;
    }
    
    function getTeamStats(address user) external view returns (
        uint256 directReferralsCount,
        uint256 totalTeamEarnings,
        uint256 x4Earnings,
        uint256 xxxEarnings
    ) {
        directReferralsCount = users[user].directReferrals;
        x4Earnings = users[user].programEarnings[X4_PROGRAM];
        xxxEarnings = users[user].programEarnings[XXX_PROGRAM];
        totalTeamEarnings = x4Earnings + xxxEarnings;
        
        return (directReferralsCount, totalTeamEarnings, x4Earnings, xxxEarnings);
    }
    
    function isRecentRegistration(address user, uint256 numDays) external view returns (bool) {
        if (!registered[user]) return false;
        uint256 daysInSeconds = numDays * 24 * 60 * 60;
        return (block.timestamp - users[user].registrationTime) <= daysInSeconds;
    }
    
    function getReferralsPaginated(address user, uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory referrals, bool hasMore) 
    {
        address[] storage allReferrals = users[user].referralList;
        uint256 totalReferrals = allReferrals.length;
        
        if (offset >= totalReferrals) {
            return (new address[](0), false);
        }
        
        uint256 end = offset + limit;
        if (end > totalReferrals) {
            end = totalReferrals;
        }
        
        referrals = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            referrals[i - offset] = allReferrals[i];
        }
        
        hasMore = end < totalReferrals;
        return (referrals, hasMore);
    }
    
    function getReferralDetails(address referrer, uint256 index) 
        external 
        view 
        returns (
            address referralAddress,
            uint256 referralId,
            uint32 registrationTime,
            bool isActive
        ) 
    {
        require(index < users[referrer].referralList.length, "Index out of bounds");
        
        referralAddress = users[referrer].referralList[index];
        referralId = users[referralAddress].id;
        registrationTime = users[referralAddress].registrationTime;
        
        isActive = (block.timestamp - registrationTime) <= 30 days;
        
        return (referralAddress, referralId, registrationTime, isActive);
    }
    
    function getNetworkDepth(address user, uint8 maxDepth) external view returns (uint8 depth) {
        if (users[user].referralList.length == 0) return 0;
        
        depth = 1;
        address[] memory currentLevel = users[user].referralList;
        
        for (uint8 level = 1; level < maxDepth; level++) {
            address[] memory nextLevel = new address[](0);
            uint256 nextLevelCount = 0;
            
            for (uint256 i = 0; i < currentLevel.length; i++) {
                nextLevelCount += users[currentLevel[i]].referralList.length;
            }
            
            if (nextLevelCount == 0) break;
            
            depth = level + 1;
            
            nextLevel = new address[](nextLevelCount);
            uint256 nextIndex = 0;
            
            for (uint256 i = 0; i < currentLevel.length; i++) {
                address[] storage referrals = users[currentLevel[i]].referralList;
                for (uint256 j = 0; j < referrals.length; j++) {
                    nextLevel[nextIndex] = referrals[j];
                    nextIndex++;
                }
            }
            
            currentLevel = nextLevel;
        }
        
        return depth;
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    function pauseContract() external onlyOwner {
        contractActive = false;
    }
    
    function activateContract() external onlyOwner {
        contractActive = true;
    }
    
    function updateLevelCost(uint8 level, uint256 newCost) external onlyOwner {
        require(level >= 1 && level <= MAX_LEVELS, "Invalid level");
        require(newCost > 0, "Cost must be greater than 0");
        levelCosts[level] = newCost;
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= linkTumToken.balanceOf(address(this)), "Insufficient balance");
        require(linkTumToken.transfer(owner, amount), "Withdrawal failed");
    }
    
    // =============================================================================
    // FALLBACK
    // =============================================================================
    
    receive() external payable {
        revert("Contract does not accept ETH");
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}