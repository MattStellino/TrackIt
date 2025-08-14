import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TransactionForm from '../components/TransactionForm';
import { api, tokenUtils } from '../utils/api';

/**
 * Transactions Page Component
 * Displays and manages all user transactions with filtering and pagination
 */
function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  /**
   * Initialize component and check authentication
   */
  useEffect(() => {
    const token = tokenUtils.getToken();
    if (!token) {
      navigate('/');
      return;
    }
    fetchTransactions();
  }, [navigate]);

  /**
   * Fetch transactions with pagination and filters
   */
  const fetchTransactions = async (page = 1) => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: page.toString(),
        limit: pagination.itemsPerPage.toString()
      };

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams[key] = value;
      });

      const data = await api.getTransactions(queryParams);
      setTransactions(data.transactions || []);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalItems || 0
      }));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        tokenUtils.clearAuth();
        navigate('/');
        return;
      }
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle filter input changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Apply filters and refresh transactions
   */
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  /**
   * Clear all filters and refresh transactions
   */
  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      search: ''
    });
    fetchTransactions(1);
  };

  /**
   * Handle pagination page changes
   */
  const handlePageChange = (page) => {
    fetchTransactions(page);
  };

  /**
   * Open transaction form for editing
   */
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  /**
   * Delete a transaction
   */
  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await api.deleteTransaction(transactionId);
      toast.success('Transaction deleted successfully!');
      fetchTransactions(pagination.currentPage);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  /**
   * Handle transaction form completion
   */
  const handleTransactionAdded = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
    fetchTransactions(pagination.currentPage);
  };

  /**
   * Format currency values for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Format dates for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get CSS class for transaction type styling
   */
  const getStatusColor = (type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  /**
   * Get background color for transaction type
   */
  const getStatusBg = (type) => {
    return type === 'income' ? 'bg-green-100' : 'bg-red-100';
  };

  // Show transaction form if active
  if (showTransactionForm) {
    return (
      <TransactionForm
        onTransactionAdded={handleTransactionAdded}
        editingTransaction={editingTransaction}
        onCancel={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
        }}
      />
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-main">
        {/* Header */}
        <div className="transactions-header">
          <div className="header-info">
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Manage and view all your financial transactions</p>
          </div>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="btn-modern btn-primary add-transaction-btn"
          >
            <span className="btn-icon">+</span>
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card-modern filters-section">
          <h3 className="section-title">Filters & Search</h3>
          <form onSubmit={handleFilterSubmit} className="filters-form">
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="form-select-modern"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Filter by category"
                className="form-control-modern"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search transactions..."
                className="form-control-modern"
              />
            </div>

            <div className="filter-actions">
              <button
                type="submit"
                className="btn-modern btn-primary"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-modern btn-outline"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="card-modern table-container">
          <div className="table-header">
            <h3 className="section-title">All Transactions</h3>
            <p className="table-info">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </p>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner-modern"></div>
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p className="empty-title">No transactions found</p>
              <p className="empty-subtitle">Add your first transaction to get started!</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="table-row">
                        <td>
                          <span className={`status-badge ${transaction.type}`}>
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className={`amount ${getStatusColor(transaction.type)}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="category">{transaction.category}</td>
                        <td className="description" title={transaction.description}>
                          {transaction.description || '-'}
                        </td>
                        <td className="date">{formatDate(transaction.date)}</td>
                        <td>
                          {transaction.tags && transaction.tags.length > 0 ? (
                            <div className="tags-container">
                              {transaction.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="tag">
                                  {tag}
                                </span>
                              ))}
                              {transaction.tags.length > 2 && (
                                <span className="tag">
                                  +{transaction.tags.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="no-tags">-</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="action-btn edit-btn"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(transaction._id)}
                              className="action-btn delete-btn"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <nav className="pagination-modern">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="page-item"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="page-item"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions; 