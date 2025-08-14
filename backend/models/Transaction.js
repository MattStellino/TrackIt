/**
 * Transaction Model
 * Defines the schema and methods for financial transactions
 */

const mongoose = require('mongoose');

/**
 * Transaction Schema Definition
 * Contains all transaction-related fields with validation and indexing
 */
const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01,
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 200
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Compound indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, amount: 1 });

/**
 * Virtual field for formatted amount display
 * @returns {string} - Currency formatted amount
 */
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

/**
 * Virtual field for formatted date display
 * @returns {string} - Human readable date
 */
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

/**
 * Instance method to get transaction summary
 * @returns {Object} - Transaction summary object
 */
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    category: this.category,
    description: this.description,
    date: this.date,
    formattedAmount: this.formattedAmount,
    formattedDate: this.formattedDate
  };
};

/**
 * Static method to get user's transaction statistics
 * @param {string} userId - User ID to get stats for
 * @returns {Promise<Object>} - Transaction statistics
 */
transactionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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
        avgTransactionAmount: { $avg: '$amount' }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransactions: 0,
      avgTransactionAmount: 0,
      netAmount: 0
    };
  }

  const stat = stats[0];
  return {
    ...stat,
    netAmount: stat.totalIncome - stat.totalExpenses
  };
};

// Ensure virtual fields are included in JSON serialization
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
