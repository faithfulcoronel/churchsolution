import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui2/card';
import { DollarSign, PiggyBank, FileText, Layers, ChevronRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export function QuickLinks() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-base font-medium text-foreground">Quick Links</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/finances/transactions">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Transactions</h4>
                    <p className="text-xs text-muted-foreground">View all financial records</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/finances/budgets">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Budgets</h4>
                    <p className="text-xs text-muted-foreground">Manage budget allocations</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/finances/reports">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Reports</h4>
                    <p className="text-xs text-muted-foreground">Generate financial reports</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/finances/transactions/add">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Bulk Entry</h4>
                    <p className="text-xs text-muted-foreground">Enter multiple transactions</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-base font-medium text-foreground">Bulk Operations</h3>
          </div>
          <div className="space-y-4 grid grid-cols-1 gap-2">
            <Link to="/finances/transactions/add">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Layers className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Bulk Transaction Entry</h4>
                      <p className="text-xs text-muted-foreground">Enter multiple transactions at once</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/finances/transactions/add?type=income">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Bulk Income Entry</h4>
                      <p className="text-xs text-muted-foreground">Record multiple income transactions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/finances/transactions/add?type=expense">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Bulk Expense Entry</h4>
                      <p className="text-xs text-muted-foreground">Record multiple expense transactions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

