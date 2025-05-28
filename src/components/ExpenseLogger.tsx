
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'bills' | 'health' | 'other';
  date: string;
  type: 'expense' | 'income';
}

interface ExpenseLoggerProps {
  onBack: () => void;
}

const ExpenseLogger = ({ onBack }: ExpenseLoggerProps) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Expense[]>([
    {
      id: '1',
      amount: 250,
      description: 'Grocery shopping',
      category: 'food',
      date: '2025-05-28',
      type: 'expense'
    },
    {
      id: '2',
      amount: 50,
      description: 'Uber ride',
      category: 'transport',
      date: '2025-05-28',
      type: 'expense'
    },
    {
      id: '3',
      amount: 120,
      description: 'Dinner with friends',
      category: 'entertainment',
      date: '2025-05-27',
      type: 'expense'
    },
    {
      id: '4',
      amount: 5000,
      description: 'Salary deposit',
      category: 'other',
      date: '2025-05-25',
      type: 'income'
    }
  ]);

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: 'food' as Expense['category'],
    type: 'expense' as Expense['type']
  });

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Error",
        description: "Please fill in amount and description.",
        variant: "destructive",
      });
      return;
    }

    const transaction: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: new Date().toISOString().split('T')[0],
      type: newTransaction.type
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      amount: '',
      description: '',
      category: 'food',
      type: 'expense'
    });

    toast({
      title: "Transaction Added",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} has been logged successfully.`,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-green-100 text-green-800';
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'entertainment': return 'bg-purple-100 text-purple-800';
      case 'shopping': return 'bg-pink-100 text-pink-800';
      case 'bills': return 'bg-orange-100 text-orange-800';
      case 'health': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && t.date === new Date().toISOString().split('T')[0])
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Expense Logger</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Income</p>
                <p className="text-2xl font-bold text-green-800">₹{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-red-800">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Today's Spending</p>
                <p className="text-2xl font-bold text-blue-800">₹{todayExpenses.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'expense' | 'income' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (₹)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="What was this for?"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value as Expense['category'] })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="food">Food & Dining</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills & Utilities</option>
                <option value="health">Health & Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button onClick={addTransaction} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.type === 'income' ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> :
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(transaction.category)}>
                    {transaction.category}
                  </Badge>
                  <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseLogger;
