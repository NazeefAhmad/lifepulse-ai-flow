
import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ExpenseLoggerProps {
  onBack: () => void;
}

const ExpenseLogger = ({ onBack }: ExpenseLoggerProps) => {
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Grocery shopping', amount: 85.50, category: 'food', date: '2024-01-15' },
    { id: 2, description: 'Gas station', amount: 45.00, category: 'transport', date: '2024-01-14' },
    { id: 3, description: 'Coffee shop', amount: 12.75, category: 'food', date: '2024-01-14' }
  ]);
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food'
  });

  const addExpense = () => {
    if (newExpense.description.trim() && newExpense.amount) {
      setExpenses([{
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0]
      }, ...expenses]);
      setNewExpense({ description: '', amount: '', category: 'food' });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-green-100 text-green-800';
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'entertainment': return 'bg-purple-100 text-purple-800';
      case 'shopping': return 'bg-pink-100 text-pink-800';
      case 'utilities': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'other'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Logger</h2>
          <p className="text-gray-600">Track your spending and stay on budget</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg per day</p>
                <p className="text-2xl font-bold">${(totalExpenses / 7).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
            />
            <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addExpense} disabled={!newExpense.description.trim() || !newExpense.amount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            {expenses.length} expenses recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-500">{expense.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                  <span className="font-bold text-lg">${expense.amount.toFixed(2)}</span>
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
