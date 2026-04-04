const ModerationLog = require("../models/moderationLog.js");
const ApiKey = require("../models/apiKey.js");

const getDashboardStats = async (req, res) => {
    try {
        const { appId } = req.user;

        const activeKeysCount = await ApiKey.countDocuments({ appId, isActive: true });
        const totalRequests = await ModerationLog.countDocuments({ appId });

        const flaggedRequests = await ModerationLog.countDocuments({ appId, flagged: true });
        const flaggedPercentage = totalRequests === 0 ? 0 : (flaggedRequests / totalRequests) * 100;

        const stats = await ModerationLog.aggregate([
            { $match: { appId } },
            { $group: { _id: null, avgConf: { $avg: "$confidence" } } }
        ]);
        const avgConfidence = stats.length > 0 ? stats[0].avgConf * 100 : 0;

        // Daily usage stats (last 7 days and prior week for trends)
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(now.getDate() - 14);

        const thisWeekRequests = await ModerationLog.countDocuments({ appId, createdAt: { $gte: sevenDaysAgo } });
        const lastWeekRequests = await ModerationLog.countDocuments({ appId, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } });
        const requestsTrend = lastWeekRequests === 0 ? (thisWeekRequests > 0 ? 100 : 0) : ((thisWeekRequests - lastWeekRequests) / lastWeekRequests) * 100;

        const thisWeekFlagged = await ModerationLog.countDocuments({ appId, flagged: true, createdAt: { $gte: sevenDaysAgo } });
        const lastWeekFlagged = await ModerationLog.countDocuments({ appId, flagged: true, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } });
        
        const thisWeekFlaggedPct = thisWeekRequests === 0 ? 0 : (thisWeekFlagged / thisWeekRequests) * 100;
        const lastWeekFlaggedPct = lastWeekRequests === 0 ? 0 : (lastWeekFlagged / lastWeekRequests) * 100;
        const flaggedTrend = thisWeekFlaggedPct - lastWeekFlaggedPct;

        const thisWeekStats = await ModerationLog.aggregate([
            { $match: { appId, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, avgConf: { $avg: "$confidence" } } }
        ]);
        const lastWeekStats = await ModerationLog.aggregate([
            { $match: { appId, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
            { $group: { _id: null, avgConf: { $avg: "$confidence" } } }
        ]);
        const thisWeekAvgConf = thisWeekStats.length > 0 ? thisWeekStats[0].avgConf * 100 : 0;
        const lastWeekAvgConf = lastWeekStats.length > 0 ? lastWeekStats[0].avgConf * 100 : 0;
        const confidenceTrend = thisWeekAvgConf - lastWeekAvgConf;


        const recentActivity = await ModerationLog.find({ appId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("text flagged confidence createdAt");

        const categoryStatsAgg = await ModerationLog.aggregate([
            { $match: { appId, flagged: true } },
            { $unwind: "$labels" },
            { $group: { _id: "$labels", count: { $sum: 1 } } }
        ]);
        const categoryStats = categoryStatsAgg.map(c => ({ category: c._id, count: c.count }));

        const usageAgg = await ModerationLog.aggregate([
            { $match: { appId, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    requests: { $sum: 1 },
                    flagged: { $sum: { $cond: ["$flagged", 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        let usageStats = usageAgg.map(u => ({
            date: new Date(u._id).toLocaleDateString('en-US', { weekday: 'short' }),
            requests: u.requests,
            flagged: u.flagged
        }));

        res.json({
            totalRequests,
            flaggedPercentage: Number(flaggedPercentage.toFixed(1)),
            avgConfidence: Number(avgConfidence.toFixed(1)),
            activeKeys: activeKeysCount,
            requestsTrend: Number(requestsTrend.toFixed(1)),
            flaggedTrend: Number(flaggedTrend.toFixed(1)),
            confidenceTrend: Number(confidenceTrend.toFixed(1)),
            categoryStats,
            usageStats,
            recentActivity: recentActivity.map(log => ({
                id: log._id,
                input: log.text,
                verdict: log.flagged ? "flagged" : "safe",
                confidence: log.confidence,
                time: log.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getDashboardStats };
