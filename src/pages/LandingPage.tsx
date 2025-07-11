import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui2/button';
import { Card, CardContent } from '../components/ui2/card';
import { Users, DollarSign, ChevronRight, BarChart3, Heart, Calendar, Shield } from 'lucide-react';
import SEO from '../components/SEO';

const LandingPage = () => {
  return (
    <>
      <SEO title="StewardTrack" description="Simplify your church administration" />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="relative py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/landing_logo_with_name.svg"
              alt="StewardTrack Logo"
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Simplify Your Church Administration
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
                Streamline member management, track finances, and organize ministries with our all-in-one church administration platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1438032005730-c779502df39b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                alt="Church interior" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-48">
                <div className="flex items-center">
                  <Users className="h-10 w-10 text-primary p-2 bg-primary-50 dark:bg-primary-900/20 rounded-full" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Members</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Easy management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything Your Church Needs
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Powerful tools designed specifically for church administration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Member Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track member information, attendance, and ministry involvement with ease.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Comprehensive member profiles</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Family relationship tracking</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Ministry involvement records</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Financial Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage tithes, offerings, and expenses with powerful accounting tools.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Double-entry accounting</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Contribution tracking</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Financial reporting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Reporting & Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gain insights with comprehensive reports and visual analytics.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Customizable dashboards</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Growth trend analysis</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Exportable reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Event Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize church events and track attendance seamlessly.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Service planning</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Volunteer scheduling</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Attendance tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Ministry Coordination
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize and manage your church's various ministries effectively.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Ministry team management</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Resource allocation</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Communication tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Secure & Private
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Keep your church data secure with enterprise-grade security.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Data encryption</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-4 w-4 text-primary mr-2" />
                    <span>Audit logging</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your church's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Free
                </h3>
                <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">
                  Perfect for small churches just getting started
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Up to 25 members</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Basic financial tracking</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Simple reporting</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Email support</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Popular
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Basic
                </h3>
                <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$49</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">
                  Great for growing churches with more needs
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Up to 100 members</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Advanced financial tracking</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Comprehensive reporting</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Priority email support</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Bulk import/export</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link to="/register">
                    <Button className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Premium
                </h3>
                <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$99</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500 dark:text-gray-400">
                  For established churches with complex needs
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Up to 250 members</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Full financial suite</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Custom dashboards</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Phone & email support</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Custom branding</span>
                  </li>
                </ul>

                <div className="mt-8">
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by Churches Everywhere
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              See what church leaders are saying about StewardTrack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-primary">
                    JD
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pastor John Davis
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Grace Community Church
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "StewardTrack has transformed how we manage our church. The financial tools alone have saved us countless hours each month."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-primary">
                    SM
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sarah Martinez
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Church Administrator
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "The member management features are intuitive and powerful. We've been able to better connect with our congregation and track ministry involvement."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-primary">
                    RJ
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rev. Robert Johnson
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      New Life Fellowship
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "The reporting features give us insights we never had before. We can now make data-driven decisions about our ministries and outreach."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to streamline your church administration?
          </h2>
          <p className="mt-4 text-xl text-white/80">
            Join thousands of churches using StewardTrack to manage their ministries more effectively.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Register Your Church
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <img
                  src="/landing_logo_with_name_dark.svg"
                  alt="StewardTrack Logo"
                  className="h-6 w-auto"
                />
              </div>
              <p className="mt-4 text-gray-400">
                Empowering churches with modern administration tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/settings/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/settings/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} StewardTrack. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;
