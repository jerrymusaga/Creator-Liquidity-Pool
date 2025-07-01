// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CLPRegistry
 * @dev Main contract for Creator Liquidity Pools - integrates with Zora V4 system
 * @notice This contract orchestrates creator economies using Zora Coins Framework
 */
contract CLPRegistry is Ownable, ReentrancyGuard {
    // Zora Factory on Base
    address public constant ZORA_FACTORY = 0x777777751622c0d3258f214F9DF38E35BF45baF3;
    
    // CLP Platform address for referral rewards
    address public immutable CLP_PLATFORM;
    
    // Counter for unique economy IDs (replaces deprecated Counters)
    uint256 private _nextEconomyId = 1;
    
    // Structs
    struct CreatorEconomy {
        uint256 id;
        address creator;
        address creatorCoin;        // Main Creator Coin (V4)
        address[] contentCoins;     // Array of Content Coins
        string name;
        string symbol;
        string metadataURI;
        uint256 cultureScore;       // Calculated ranking score
        uint256 totalVolume;        // Aggregate volume tracking
        uint256 totalEarnings;      // Creator's total V4 earnings
        uint256 createdAt;
        bool active;
    }
    
    struct ContentCoin {
        address coinAddress;
        address parentCreatorCoin;
        address creator;
        string name;
        string symbol;
        string contentType;         // "video", "meme", "music", etc.
        string contentURI;          // IPFS link to actual content
        string metadataURI;
        uint256 viralityScore;      // Performance metric (0-100)
        uint256 createdAt;
        bool active;
    }
    
    struct CultureMetrics {
        uint256 volume24h;
        uint256 volume7d;
        uint256 volume30d;
        uint256 uniqueTraders24h;
        uint256 holderCount;
        uint256 contentCoinsCount;
        uint256 lastUpdated;
    }

    // Storage
    mapping(uint256 => CreatorEconomy) public economies;           // economyId => economy
    mapping(address => ContentCoin) public contentCoins;          // contentCoin => info
    mapping(address => uint256) public creatorToEconomyId;        // creator => economyId
    mapping(address => uint256) public coinToEconomyId;           // creatorCoin => economyId
    mapping(address => address[]) public creatorContentCoins;     // creator => contentCoins[]
    mapping(uint256 => CultureMetrics) public cultureMetrics;    // economyId => metrics
    
    uint256[] public allEconomyIds;
    address[] public allCreatorCoins;
    address[] public allContentCoins;
    
    // Culture Index state
    uint256[] public cultureRankings;  // Sorted array of economy IDs by culture score
    uint256 public lastRankingUpdate;
    
    // Events
    event EconomyCreated(
        uint256 indexed economyId,
        address indexed creator,
        address indexed creatorCoin,
        string name,
        string symbol,
        string metadataURI
    );
    
    event ContentCoinAdded(
        address indexed creator,
        address indexed creatorCoin,
        address indexed contentCoin,
        string contentType,
        uint256 economyId
    );
    
    event CultureScoreUpdated(
        uint256 indexed economyId,
        address indexed creatorCoin,
        uint256 newScore,
        uint256 rank
    );
    
    event V4EarningsTracked(
        address indexed creator,
        address indexed coin,
        uint256 amount,
        uint256 totalEarnings
    );

    // Modifiers
    modifier onlyCreator(uint256 economyId) {
        require(economies[economyId].creator == msg.sender, "CLPRegistry: Not the creator");
        _;
    }
    
    modifier economyExists(uint256 economyId) {
        require(economies[economyId].active, "CLPRegistry: Economy does not exist");
        _;
    }

    constructor(address _clpPlatform) Ownable(msg.sender) {
        CLP_PLATFORM = _clpPlatform;
    }

    /**
     * @dev Register a Creator Economy after deploying via Zora Factory
     * @param creator Address of the creator
     * @param creatorCoin Address of the deployed Creator Coin (V4)
     * @param name Name of the creator economy
     * @param symbol Symbol of the creator coin
     * @param metadataURI IPFS URI for economy metadata
     */
    function registerCreatorEconomy(
        address creator,
        address creatorCoin,
        string memory name,
        string memory symbol,
        string memory metadataURI
    ) external returns (uint256 economyId) {
        require(creator != address(0), "CLPRegistry: Invalid creator");
        require(creatorCoin != address(0), "CLPRegistry: Invalid creator coin");
        require(creatorToEconomyId[creator] == 0, "CLPRegistry: Creator already has economy");
        
        // Use simple counter instead of deprecated Counters library
        economyId = _nextEconomyId;
        unchecked {
            _nextEconomyId++;
        }
        
        // Create economy struct
        economies[economyId] = CreatorEconomy({
            id: economyId,
            creator: creator,
            creatorCoin: creatorCoin,
            contentCoins: new address[](0),
            name: name,
            symbol: symbol,
            metadataURI: metadataURI,
            cultureScore: 1000, // Starting score
            totalVolume: 0,
            totalEarnings: 0,
            createdAt: block.timestamp,
            active: true
        });
        
        // Update mappings
        creatorToEconomyId[creator] = economyId;
        coinToEconomyId[creatorCoin] = economyId;
        allEconomyIds.push(economyId);
        allCreatorCoins.push(creatorCoin);
        
        // Initialize culture metrics
        cultureMetrics[economyId] = CultureMetrics({
            volume24h: 0,
            volume7d: 0,
            volume30d: 0,
            uniqueTraders24h: 0,
            holderCount: 1, // Creator is first holder
            contentCoinsCount: 0,
            lastUpdated: block.timestamp
        });
        
        emit EconomyCreated(economyId, creator, creatorCoin, name, symbol, metadataURI);
        return economyId;
    }
    
    /**
     * @dev Add a Content Coin to an existing economy
     * @param parentCreatorCoin Address of the parent Creator Coin
     * @param contentCoin Address of the deployed Content Coin
     * @param name Name of the content coin
     * @param symbol Symbol of the content coin
     * @param contentType Type of content ("video", "meme", etc.)
     * @param contentURI IPFS URI of the actual content
     * @param metadataURI IPFS URI for content metadata
     */
    function addContentCoin(
        address parentCreatorCoin,
        address contentCoin,
        string memory name,
        string memory symbol,
        string memory contentType,
        string memory contentURI,
        string memory metadataURI
    ) external returns (bool) {
        uint256 economyId = coinToEconomyId[parentCreatorCoin];
        require(economyId != 0, "CLPRegistry: Creator economy not found");
        require(economies[economyId].creator == msg.sender, "CLPRegistry: Not the creator");
        require(contentCoin != address(0), "CLPRegistry: Invalid content coin");
        
        // Create content coin struct
        contentCoins[contentCoin] = ContentCoin({
            coinAddress: contentCoin,
            parentCreatorCoin: parentCreatorCoin,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            contentType: contentType,
            contentURI: contentURI,
            metadataURI: metadataURI,
            viralityScore: 0,
            createdAt: block.timestamp,
            active: true
        });
        
        // Add to economy
        economies[economyId].contentCoins.push(contentCoin);
        creatorContentCoins[msg.sender].push(contentCoin);
        allContentCoins.push(contentCoin);
        
        // Update metrics
        cultureMetrics[economyId].contentCoinsCount++;
        cultureMetrics[economyId].lastUpdated = block.timestamp;
        
        emit ContentCoinAdded(msg.sender, parentCreatorCoin, contentCoin, contentType, economyId);
        return true;
    }
    
    /**
     * @dev Update V4 earnings for a creator (called by event indexer)
     * @param creator Address of the creator
     * @param coin Address of the coin (creator or content)
     * @param earnings Amount earned from V4 rewards
     */
    function updateV4Earnings(
        address creator,
        address coin,
        uint256 earnings
    ) external onlyOwner {
        uint256 economyId = creatorToEconomyId[creator];
        require(economyId != 0, "CLPRegistry: Creator economy not found");
        
        economies[economyId].totalEarnings += earnings;
        
        emit V4EarningsTracked(creator, coin, earnings, economies[economyId].totalEarnings);
    }
    
    /**
     * @dev Update culture metrics for an economy (called by analytics service)
     */
    function updateCultureMetrics(
        uint256 economyId,
        uint256 volume24h,
        uint256 volume7d,
        uint256 volume30d,
        uint256 uniqueTraders24h,
        uint256 holderCount
    ) external onlyOwner economyExists(economyId) {
        CultureMetrics storage metrics = cultureMetrics[economyId];
        
        metrics.volume24h = volume24h;
        metrics.volume7d = volume7d;
        metrics.volume30d = volume30d;
        metrics.uniqueTraders24h = uniqueTraders24h;
        metrics.holderCount = holderCount;
        metrics.lastUpdated = block.timestamp;
        
        // Update total volume in economy
        economies[economyId].totalVolume = volume30d;
        
        // Recalculate culture score
        uint256 newScore = calculateCultureScore(economyId);
        economies[economyId].cultureScore = newScore;
        
        emit CultureScoreUpdated(economyId, economies[economyId].creatorCoin, newScore, 0);
    }
    
    /**
     * @dev Calculate culture score based on multiple metrics
     */
    function calculateCultureScore(uint256 economyId) public view returns (uint256) {
        CreatorEconomy storage economy = economies[economyId];
        CultureMetrics storage metrics = cultureMetrics[economyId];
        
        // Base scoring algorithm (can be enhanced)
        uint256 volumeScore = metrics.volume24h / 100;  // $100 = 1 point
        uint256 holderScore = metrics.holderCount * 10; // 10 points per holder
        uint256 contentScore = metrics.contentCoinsCount * 50; // 50 points per content coin
        uint256 traderScore = metrics.uniqueTraders24h * 20; // 20 points per unique trader
        uint256 ageBonus = (block.timestamp - economy.createdAt) / 86400; // 1 point per day
        
        // Viral content bonus
        uint256 viralBonus = 0;
        address[] storage contentCoinAddresses = economies[economyId].contentCoins;
        for (uint256 i = 0; i < contentCoinAddresses.length; i++) {
            ContentCoin storage content = contentCoins[contentCoinAddresses[i]];
            if (content.viralityScore > 80) {
                viralBonus += 100; // Bonus for viral content
            }
        }
        
        return volumeScore + holderScore + contentScore + traderScore + ageBonus + viralBonus;
    }
    
    /**
     * @dev Update culture rankings (called periodically)
     */
    function updateCultureRankings() external onlyOwner {
        uint256[] memory economyIds = allEconomyIds;
        
        // Simple bubble sort for rankings (can be optimized)
        for (uint256 i = 0; i < economyIds.length; i++) {
            for (uint256 j = 0; j < economyIds.length - 1 - i; j++) {
                if (economies[economyIds[j]].cultureScore < economies[economyIds[j + 1]].cultureScore) {
                    uint256 temp = economyIds[j];
                    economyIds[j] = economyIds[j + 1];
                    economyIds[j + 1] = temp;
                }
            }
        }
        
        cultureRankings = economyIds;
        lastRankingUpdate = block.timestamp;
    }
    
    /**
     * @dev Update virality score for content coin
     */
    function updateViralityScore(
        address contentCoin,
        uint256 viralityScore
    ) external onlyOwner {
        require(contentCoins[contentCoin].active, "CLPRegistry: Content coin not found");
        require(viralityScore <= 100, "CLPRegistry: Invalid virality score");
        
        contentCoins[contentCoin].viralityScore = viralityScore;
    }

    // View Functions
    
    /**
     * @dev Get creator economy by ID
     */
    function getCreatorEconomy(uint256 economyId) external view returns (CreatorEconomy memory) {
        return economies[economyId];
    }
    
    /**
     * @dev Get content coin info
     */
    function getContentCoin(address contentCoin) external view returns (ContentCoin memory) {
        return contentCoins[contentCoin];
    }
    
    /**
     * @dev Get culture metrics for economy
     */
    function getCultureMetrics(uint256 economyId) external view returns (CultureMetrics memory) {
        return cultureMetrics[economyId];
    }
    
    /**
     * @dev Get culture leaderboard (top N economies)
     */
    function getCultureLeaderboard(uint256 limit) external view returns (
        uint256[] memory topEconomyIds,
        uint256[] memory scores
    ) {
        uint256 length = limit > cultureRankings.length ? cultureRankings.length : limit;
        topEconomyIds = new uint256[](length);
        scores = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 economyId = cultureRankings[i];
            topEconomyIds[i] = economyId;
            scores[i] = economies[economyId].cultureScore;
        }
    }
    
    /**
     * @dev Get creator's content coins
     */
    function getCreatorContentCoins(address creator) external view returns (address[] memory) {
        return creatorContentCoins[creator];
    }
    
    /**
     * @dev Get all active economies (paginated)
     */
    function getAllEconomies(uint256 offset, uint256 limit) external view returns (
        CreatorEconomy[] memory economiesData,
        uint256 total
    ) {
        total = allEconomyIds.length;
        uint256 end = offset + limit;
        if (end > total) end = total;
        
        uint256 length = end > offset ? end - offset : 0;
        economiesData = new CreatorEconomy[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 economyId = allEconomyIds[offset + i];
            economiesData[i] = economies[economyId];
        }
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalEconomies,
        uint256 totalCreatorCoins,
        uint256 totalContentCoins,
        uint256 totalVolume,
        uint256 totalEarnings
    ) {
        totalEconomies = allEconomyIds.length;
        totalCreatorCoins = allCreatorCoins.length;
        totalContentCoins = allContentCoins.length;
        
        for (uint256 i = 0; i < allEconomyIds.length; i++) {
            uint256 economyId = allEconomyIds[i];
            totalVolume += economies[economyId].totalVolume;
            totalEarnings += economies[economyId].totalEarnings;
        }
    }

    // Admin Functions
    
    /**
     * @dev Set economy active status
     */
    function setEconomyActive(uint256 economyId, bool active) external onlyOwner {
        economies[economyId].active = active;
    }
    
    /**
     * @dev Set content coin active status  
     */
    function setContentCoinActive(address contentCoin, bool active) external onlyOwner {
        contentCoins[contentCoin].active = active;
    }
    
    /**
     * @dev Emergency withdraw (only CLP platform fees)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(CLP_PLATFORM).transfer(address(this).balance);
    }

    /**
     * @dev Get current economy ID counter (useful for frontends)
     */
    function getCurrentEconomyId() external view returns (uint256) {
        return _nextEconomyId - 1;
    }
}