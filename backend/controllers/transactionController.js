const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * Create a new transaction for the authenticated user
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, tags, isRecurring, recurringInterval, date } = req.body;

    const newTransaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      tags,
      isRecurring,
      recurringInterval,
      date: date || new Date()
    });

    await newTransaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating transaction',
      error: err.message 
    });
  }
};

/**
 * Get paginated transactions with filtering and sorting options
 */
exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { userId: req.userId };
    
    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transactions',
      error: err.message 
    });
  }
};

/**
 * Get a specific transaction by ID
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.userId 
    }).populate('userId', 'name email');

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transaction',
      error: err.message 
    });
  }
};

/**
 * Update an existing transaction
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, tags, isRecurring, recurringInterval, date } = req.body;

    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurringInterval !== undefined) updateData.recurringInterval = recurringInterval;
    if (date !== undefined) updateData.date = date;

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updated
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating transaction', 
      error: err.message 
    });
  }
};

/**
 * Delete a transaction
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.findOneAndDelete({ 
      _id: id, 
      userId: req.userId 
    });

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Transaction deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting transaction', 
      error: err.message 
    });
  }
};

/**
 * Get transaction statistics and analytics
 */
exports.getTransactionStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    
    if (period !== 'all') {
      const now = new Date();
      const startOfPeriod = new Date();
      
      switch (period) {
        case 'today':
          startOfPeriod.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startOfPeriod.setDate(now.getDate() - now.getDay());
          startOfPeriod.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startOfPeriod.setDate(1);
          startOfPeriod.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startOfPeriod.setMonth(0, 1);
          startOfPeriod.setHours(0, 0, 0, 0);
          break;
      }
      
      dateFilter = { date: { $gte: startOfPeriod } };
    }

    // Get overall statistics
    const stats = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.userId),
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.userId),
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly breakdown for the last 12 months
    const monthlyStats = await Transaction.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalIncome: 0,
          totalExpenses: 0,
          totalTransactions: 0,
          avgTransactionAmount: 0,
          minAmount: 0,
          maxAmount: 0,
          netAmount: 0
        },
        categoryStats: [],
        monthlyStats: []
      });
    }

    const stat = stats[0];
    const result = {
      success: true,
      stats: {
        ...stat,
        netAmount: stat.totalIncome - stat.totalExpenses
      },
      categoryStats,
      monthlyStats
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transaction statistics',
      error: err.message 
    });
  }
};

/**
 * Get transaction categories with usage statistics
 */
exports.getTransactionCategories = async (req, res) => {
  try {
    const categories = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching categories',
      error: err.message 
    });
  }
};

/**
 * Bulk delete multiple transactions
 */
exports.bulkDeleteTransactions = async (req, res) => {
  try {
    const { transactionIds } = req.body;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction IDs array is required'
      });
    }

    const result = await Transaction.deleteMany({
      _id: { $in: transactionIds },
      userId: req.userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} transactions deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting transactions',
      error: err.message 
    });
  }
};
