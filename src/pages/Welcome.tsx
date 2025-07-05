import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCurrentUserMember } from '../utils/memberUtils';
import { tenantUtils } from '../utils/tenantUtils';
import { usePermissions } from '../hooks/usePermissions';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ActivityLogService } from '../services/ActivityLogService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui2/card';
import { Button } from '../components/ui2/button';
import {
  Building2,
  DollarSign,
  BarChart3,
  Users,
  Plus,
  Calendar,
  FileText,
  Heart,
  ChevronRight,
  Bell,
  Zap,
  History,
  Pencil,
  Trash2,
} from 'lucide-react';
import { QuickAccessCard, Announcements } from '../components/welcome';
import WelcomeGreeting from '../components/WelcomeGreeting';
import { Badge } from '../components/ui2/badge';
import { Progress } from '../components/ui2/progress';

function Welcome() {
  const { hasPermission } = usePermissions();

  // Fetch the logged in member
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['current-user-member'],
    queryFn: getCurrentUserMember,
  });

  // Fetch current tenant info
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['current-tenant-info'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  // Get recent activity data
  const activityService = container.get<ActivityLogService>(TYPES.ActivityLogService);
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => activityService.getRecentActivity(5),
  });

  // Featured quick links
  const featuredLinks = [
    { label: 'Church Overview', href: '/dashboard/church', icon: Building2, permission: null },
    { label: 'Donations', href: '/finances/giving', icon: DollarSign, permission: 'finance.view' },
    { label: 'Members', href: '/members/list', icon: Users, permission: 'member.view' },
  ];

  // All quick links
  const allQuickLinks = [
    ...featuredLinks,
    { label: 'Reports', href: '/finances/reports', icon: BarChart3, permission: 'finance.report' },
    { label: 'Calendar', href: '/calendar', icon: Calendar, permission: null },
    { label: 'Statements', href: '/finances/statements', icon: FileText, permission: 'finance.view' },
  ];
  
  // Quick actions
  const quickActions = [
    { label: 'Record Donation', href: '/finances/giving/add', icon: Heart, permission: 'finance.create' },
    { label: 'Add Member', href: '/members/add', icon: Users, permission: 'member.create' },
    { label: 'Create Report', href: '/finances/reports', icon: FileText, permission: 'finance.report' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner with Greeting */}
      <WelcomeGreeting />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Access */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Quick Links */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredLinks
                .filter((q) => !q.permission || hasPermission(q.permission))
                .map((q) => (
                  <QuickAccessCard
                    key={q.label}
                    to={q.href}
                    icon={q.icon}
                    label={q.label}
                  />
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              Quick Actions
            </h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  {quickActions
                    .filter((a) => !a.permission || hasPermission(a.permission))
                    .map((a, index) => (
                      <Link to={a.href} key={a.label} className="group">
                        <div className="p-6 hover:bg-muted/50 transition-colors h-full flex flex-col justify-between">
                          <div className="mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <a.icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-medium text-foreground">{a.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {index === 0 ? 'Record a new donation' : 
                               index === 1 ? 'Add a new church member' : 'Generate financial reports'}
                            </p>
                          </div>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                            Get Started <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </h2>
            <Card>
              <CardContent className="p-6">
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          {activity.action === 'create' ? (
                            <Plus className="h-5 w-5" />
                          ) : activity.action === 'update' ? (
                            <Pencil className="h-5 w-5" />
                          ) : activity.action === 'delete' ? (
                            <Trash2 className="h-5 w-5" />
                          ) : (
                            <History className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-foreground">
                              {activity.action} {activity.entity_type}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          {activity.auth_users?.email && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.auth_users.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent activity to display</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 px-6 py-3">
                <Link to="/activity" className="text-sm text-primary font-medium flex items-center hover:underline">
                  View all activity <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Right Column - Church Info & Resources */}
        <div className="space-y-6">
          {/* Church Info Card */}
          {tenant && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Church Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    {tenant.profile_picture_url ? (
                      <img
                        src={tenant.profile_picture_url}
                        alt={tenant.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tenant.name}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {tenant.subscription_tier} Plan
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {tenant.subscription_tier === 'free' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Member Usage</span>
                        <span className="font-medium">15/25</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Link to="/settings/subscription">
                      <Button variant="outline" className="w-full">
                        Manage Subscription
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* All Quick Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">All Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {allQuickLinks
                  .filter((q) => !q.permission || hasPermission(q.permission))
                  .map((link) => (
                    <Link 
                      key={link.label} 
                      to={link.href}
                      className="flex items-center p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                        <link.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Announcements */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Announcements
            </h2>
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
