
import React, { useState } from 'react';
import { DollarSign, Plus, TrendingUp, PieChart, ArrowLeft, Coffee, Car, Home, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExpenseLogger = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const expenses = [
    { id: 1, amount: 150, description: 'Lunch at cafe', category: 'food', date: '2024-01-23', aiCategorized: true },
    { id: 2, amount: 80, description: 'Metro card recharge', category: 'transport', date: '2024-01-23', aiCategorized: true },
    { id: 3, amount: 25, description: 'Coffee with friends', category: 'food', date: '2024-01-22', aiCategorized: false },
    { id: 4, amount: 1200, description: 'Grocery shopping', category: 'essentials', date: '2024-01-22', aiCategorized: true },
  ];

  const categoryData = [
    { name: 'Food & Dining', amount: 3250, percentage: 45, icon: Coffee, color: 'bg-orange-100 text-orange-600' },
    { name: 'Transport', amount: 1800, percentage: 25, icon: Car, color: 'bg-blue-100 text-blue-600' },
    { name: 'Essentials', amount: 1500, percentage: 20, icon: ShoppingBag, color: 'bg-green-100 text-green-600' },
    { name: 'Housing', amount: 720, percentage: 10, icon: Home, color: 'bg-purple-100 text-purple-600' },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food': return <Coffee className="h-4 w-4" />;
      case 'transport': return <Car className="h-4 w-4" />;
      case 'essentials': return <ShoppingBag className="h-4 w-4" />;
      case 'housing': return <Home className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'essentials': return 'bg-green-100 text-green-800';
      case 'housing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addExpense = () => {
    if (amount && description) {
      console.log('Adding expense:', { amount, description, category });
      setAmount('');
      setDescription('');
      setCategory('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Logger</h2>
          <p className="text-gray-600">Track spending with smart AI categorization</p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Today's Spend</p>
                <p className="text-2xl font-bold text-green-800">₹340</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">This Week</p>
                <p className="text-2xl font-bold text-blue-800">₹2,145</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">This Month</p>
                <p className="text-2xl font-bold text-purple-800">₹7,270</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log New Expense
          </CardTitle>
          <CardDescription>
            Add an expense and let AI categorize it for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (₹)</label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                placeholder="What did you spend on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-categorize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="essentials">Essentials</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addExpense} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Log Expense
          </Button>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending Breakdown (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.percentage}% of total</p>
                    </div>
                  </div>
                  <p className="font-bold">₹{category.amount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)}`}>
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">{expense.date}</p>
                      {expense.aiCategorized && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          AI Categorized
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="font-bold">₹{expense.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseLogger;
