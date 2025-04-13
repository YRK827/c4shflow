// const nodeBtnAlert = document.querySelector('button')
// if (nodeBtnAlert) {
//     console.log(nodeBtnAlert)
//     nodeBtnAlert.addEventListener('click', (e) => {
//         e.currentTarget.innerHTML = 'Clicked'
//     })
// }

// Cashflow utility functions for localStorage data management
const CashflowApp = {
    // Initialize the application
    init() {
        this.setupEventListeners();
        this.initializeData();
        // console.log('CashflowApp initialized');
    },

    // Set up event listeners for common UI elements
    setupEventListeners() {
        // Back button
        const btnBack = document.getElementById('btnBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Add button that navigates to add.eta
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                window.location.href = '/add';
            });
        }
    },

    // Initialize data storage if needed
    initializeData() {
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
            this.logAction('App initialized with empty transactions array');
        }
        
        if (!localStorage.getItem('logs')) {
            localStorage.setItem('logs', JSON.stringify([]));
        }

        // 예산 데이터 초기화
        if (!localStorage.getItem('budgets')) {
            localStorage.setItem('budgets', JSON.stringify([]));
            this.logAction('Budget storage initialized');
        }
    },

    // Get all transactions
    getAllTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        return transactions;
    },

    // Add a new transaction
    addTransaction(transaction) {
        // Add ID and timestamp if not present
        if (!transaction.id) {
            transaction.id = Date.now().toString();
        }
        if (!transaction.createdAt) {
            transaction.createdAt = new Date().toISOString();
        }

        const transactions = this.getAllTransactions();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Log the action
        this.logAction(`Transaction added: ${transaction.type} - ${transaction.amount}원 - ${transaction.category}`);
        
        return transaction;
    },

    // Delete a transaction
    deleteTransaction(id) {
        let transactions = this.getAllTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(filtered));
        this.logAction(`Transaction deleted: ID ${id}`);
    },

    // Calculate summary statistics
    getSummary() {
        const transactions = this.getAllTransactions();
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
        return {
            income,
            expense,
            balance: income - expense
        };
    },

    // Log actions for auditing and tracking
    logAction(action) {
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            action: action
        });
        localStorage.setItem('logs', JSON.stringify(logs));
        console.log(`[LOG] ${action}`);
    },

    // Get all logs
    getLogs() {
        return JSON.parse(localStorage.getItem('logs') || '[]');
    },

    // Helper function to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    },

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem('transactions');
        localStorage.removeItem('logs');
        localStorage.removeItem('budgets');
        this.initializeData();
        this.logAction('All data cleared');
    },

    // Budget 관련 기능
    // 모든 예산 가져오기
    getAllBudgets() {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        return budgets;
    },

    // 특정 연/월의 예산 가져오기
    getBudget(year, month) {
        const budgets = this.getAllBudgets();
        return budgets.find(b => b.year === year && b.month === month);
    },

    // 현재 연/월의 예산 가져오기
    getCurrentBudget() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // 0-based to 1-based
        return this.getBudget(year, month);
    },

    // 예산 추가 또는 업데이트
    setBudget(year, month, amount) {
        let budgets = this.getAllBudgets();
        const existingBudget = budgets.find(b => b.year === year && b.month === month);
        
        if (existingBudget) {
            // 기존 예산 업데이트
            existingBudget.amount = amount;
            existingBudget.updatedAt = new Date().toISOString();
            this.logAction(`예산 업데이트: ${year}년 ${month}월 - ${this.formatCurrency(amount)}`);
        } else {
            // 새 예산 추가
            const newBudget = {
                id: Date.now().toString(),
                year,
                month,
                amount,
                createdAt: new Date().toISOString()
            };
            budgets.push(newBudget);
            this.logAction(`새 예산 설정: ${year}년 ${month}월 - ${this.formatCurrency(amount)}`);
        }
        
        localStorage.setItem('budgets', JSON.stringify(budgets));
    },

    // 특정 연/월의 지출 합계 계산
    getMonthlyExpense(year, month) {
        const transactions = this.getAllTransactions();
        const monthlyExpenses = transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.type === 'expense' && 
                  txDate.getFullYear() === year && 
                  txDate.getMonth() + 1 === month; // 0-based to 1-based
        });
        
        return monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    },

    // 예산 상태 계산 (특정 연/월)
    getBudgetStatus(year, month) {
        const budget = this.getBudget(year, month);
        if (!budget) {
            return {
                exists: false,
                budget: 0,
                spent: 0,
                remaining: 0,
                isOver: false
            };
        }
        
        const spent = this.getMonthlyExpense(year, month);
        const remaining = budget.amount - spent;
        
        return {
            exists: true,
            budget: budget.amount,
            spent,
            remaining: Math.abs(remaining),
            isOver: remaining < 0,
            year,
            month
        };
    },

    // 현재 월의 예산 상태 계산
    getCurrentBudgetStatus() {
        const today = new Date();
        return this.getBudgetStatus(today.getFullYear(), today.getMonth() + 1);
    },

    // 예산 삭제 함수 추가
    deleteBudget(year, month) {
        let budgets = this.getAllBudgets();
        const filteredBudgets = budgets.filter(b => !(b.year === year && b.month === month));
        
        if (filteredBudgets.length < budgets.length) {
            localStorage.setItem('budgets', JSON.stringify(filteredBudgets));
            this.logAction(`예산 삭제: ${year}년 ${month}월`);
            return true;
        }
        
        return false;
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CashflowApp.init();
});