import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

/**
 * TransactionForm Component
 * Handles creating and editing transactions
 */
function TransactionForm({ onTransactionAdded, editingTransaction, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    isRecurring: false,
    recurringInterval: 'monthly'
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize form data when editing an existing transaction
   */
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        description: editingTransaction.description || '',
        date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: editingTransaction.tags ? editingTransaction.tags.join(', ') : '',
        isRecurring: editingTransaction.isRecurring || false,
        recurringInterval: editingTransaction.recurringInterval || 'monthly'
      });
    }
  }, [editingTransaction]);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: '',
      isRecurring: false,
      recurringInterval: 'monthly'
    });
  };

  /**
   * Handle form submission for creating or updating transactions
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      let data;
      if (editingTransaction) {
        data = await api.updateTransaction(editingTransaction._id, transactionData);
      } else {
        data = await api.createTransaction(transactionData);
      }

      toast.success(editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      
      if (onTransactionAdded) {
        onTransactionAdded(data.transaction || data);
      }
      
      if (!editingTransaction) {
        resetForm();
      }
    } catch (err) {
      // Handle validation errors
      if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
        const errorMessages = err.data.errors.map(err => err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(err.message || 'Failed to save transaction');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined categories for different transaction types
  const categories = {
    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Insurance', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Refund', 'Other']
  };

  // Recurring interval options
  const intervals = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className="transaction-form-container">
      <div className="transaction-form-card">
        <div className="form-header">
          <div className="form-icon">
            <span className="icon-text">+</span>
          </div>
          <h2 className="form-title">
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <p className="form-subtitle">
            {editingTransaction ? 'Update your transaction details below' : 'Track your income and expenses with detailed information'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          {/* Transaction Type Selection */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Transaction Type
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <div className={`radio-button ${formData.type === 'expense' ? 'checked expense' : ''}`}>
                    {formData.type === 'expense' && (
                      <div className="radio-dot"></div>
                    )}
                  </div>
                  <span className={`radio-label ${formData.type === 'expense' ? 'checked expense' : ''}`}>
                    Expense
                  </span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <div className={`radio-button ${formData.type === 'income' ? 'checked income' : ''}`}>
                    {formData.type === 'income' && (
                      <div className="radio-dot"></div>
                    )}
                  </div>
                  <span className={`radio-label ${formData.type === 'income' ? 'checked income' : ''}`}>
                    Income
                  </span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount
              </label>
              <div className="amount-input-wrapper">
                <div className="amount-prefix">$</div>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="form-control-modern amount-input"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Category and Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Category
              </label>
              <select
                name="category"
                className="form-select-modern"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {categories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date
              </label>
              <input
                type="date"
                name="date"
                className="form-control-modern"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description and Tags */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Description
              </label>
              <input
                type="text"
                name="description"
                className="form-control-modern"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Brief description of the transaction"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                className="form-control-modern"
                value={formData.tags}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Separate tags with commas (e.g., food, dining, lunch)"
              />
            </div>
          </div>

          {/* Recurring Transaction Options */}
          <div className="recurring-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="isRecurring"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="checkbox-input"
                disabled={isLoading}
              />
              <label htmlFor="isRecurring" className="checkbox-label">
                This is a recurring transaction
              </label>
            </div>
            
            {formData.isRecurring && (
              <div className="recurring-options">
                <label className="form-label">
                  Recurring Interval
                </label>
                <select
                  name="recurringInterval"
                  className="form-select-modern"
                  value={formData.recurringInterval}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {intervals.map(interval => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-modern btn-primary submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  {editingTransaction ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editingTransaction ? 'Update Transaction' : 'Add Transaction'
              )}
            </button>
            
            {editingTransaction && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-modern btn-outline"
              >
                Cancel
              </button>
            )}
            
            {!editingTransaction && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-modern btn-outline"
              >
                Reset Form
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
