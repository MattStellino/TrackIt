import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { api, tokenUtils } from '../utils/api';

/**
 * Dashboard Component
 * Main dashboard showing financial overview and recent transactions
 */
function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  /**
   * Initialize dashboard data on component mount
   */
  useEffect(() => {
    const token = tokenUtils.getToken();
    if (!token) {
      navigate('/');
      return;
    }
    fetchTransactions();
    fetchStats();
  }, [navigate]);

  /**
   * Fetch recent transactions for the dashboard
   */
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions({ limit: 5 });
      setTransactions(data.transactions || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        tokenUtils.clearAuth();
        navigate('/');
        return;
      }
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch transaction statistics for the dashboard
   */
  const fetchStats = async () => {
    try {
      const data = await api.getTransactionStats();
      setStats({
        totalIncome: data.stats?.totalIncome || 0,
        totalExpenses: data.stats?.totalExpenses || 0,
        netAmount: data.stats?.netAmount || 0,
        transactionCount: data.stats?.totalTransactions || 0
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  /**
   * Handle transaction form completion
   */
  const handleTransactionAdded = () => {
    setShowTransactionForm(false);
    // Add a small delay to ensure the backend has processed the transaction
    setTimeout(() => {
      fetchTransactions();
      fetchStats();
    }, 500);
  };

  /**
   * Handle user logout
   */
  const logout = () => {
    tokenUtils.clearAuth();
    navigate('/');
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

  // Show transaction form if active
  if (showTransactionForm) {
    return (
      <TransactionForm
        onTransactionAdded={handleTransactionAdded}
        onCancel={() => setShowTransactionForm(false)}
      />
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <span className="logo-text">T</span>
            </div>
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="btn-modern btn-primary"
            >
              <span className="btn-icon">+</span>
              <span>Add Transaction</span>
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="btn-modern btn-outline"
            >
              Profile
            </button>
            
            <button
              onClick={logout}
              className="btn-modern btn-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="dashboard-main">
        <div className="content-wrapper">
          {/* Stats Section */}
          <div className="stats-grid">
            {/* Total Income */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon income-icon">
                  <span>$</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Income</p>
                  <p className="stat-value">{formatCurrency(stats.totalIncome)}</p>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon expense-icon">
                  <span>-</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Total Expenses</p>
                  <p className="stat-value">{formatCurrency(stats.totalExpenses)}</p>
                </div>
              </div>
            </div>

            {/* Net Amount */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon net-icon">
                  <span>=</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Net Amount</p>
                  <p className={`stat-value ${stats.netAmount >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(stats.netAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon count-icon">
                  <span>#</span>
                </div>
                <div className="stat-details">
                  <p className="stat-label">Transactions</p>
                  <p className="stat-value">{stats.transactionCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="dashboard-sections">
            {/* Quick Actions */}
            <div className="quick-actions-section">
              <div className="card-modern">
                <h3 className="section-title">Quick Actions</h3>
                <div className="actions-container">
                  <button
                    onClick={() => setShowTransactionForm(true)}
                    className="btn-modern btn-primary action-btn"
                  >
                    <span className="btn-icon">+</span>
                    <span>Add Transaction</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/profile')}
                    className="btn-modern btn-outline action-btn"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
              <div className="card-modern">
                <div className="activity-header">
                  <h3 className="section-title">Recent Activity</h3>
                  <button
                    onClick={() => navigate('/transactions')}
                    className="view-all-link"
                  >
                    View All Transactions
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner-modern"></div>
                    <p>Loading recent activity...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p className="empty-title">No recent transactions</p>
                    <p className="empty-subtitle">Add your first transaction to get started!</p>
                  </div>
                ) : (
                  <div className="transactions-list">
                    {transactions.map((transaction) => (
                      <div key={transaction._id} className="transaction-item">
                        <div className="transaction-info">
                          <div className={`transaction-indicator ${transaction.type}`}></div>
                          <div className="transaction-details">
                            <p className="transaction-category">{transaction.category}</p>
                            <p className="transaction-description">{transaction.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="transaction-amount">
                          <p className={`amount ${getStatusColor(transaction.type)}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="transaction-date">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
