import { useState } from 'react';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Crown, Zap, Eye, Ticket, Calendar } from 'lucide-react';

export default function PremiumPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  
  const handleGetPremium = () => {
    toast({
      title: "Premium subscription",
      description: "This feature is not available in the MVP version.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Premium Membership" showNotifications={false} />
      
      <div className="pt-16 pb-20">
        {/* Premium Header */}
        <div className="h-48 bg-gradient-to-r from-yellow-500 to-yellow-400 flex flex-col items-center justify-center text-white px-4">
          <div className="text-center">
            <Crown className="h-10 w-10 mb-3 mx-auto" />
            <h2 className="text-2xl font-montserrat font-bold mb-1">Birdie Premium</h2>
            <p>Elevate your golf social experience</p>
          </div>
        </div>
        
        <div className="p-4">
          {/* Premium Benefits */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-montserrat font-bold text-lg mb-1">Premium Benefits</h3>
                <p className="text-sm text-gray-500">Unlock the full Birdie Social experience</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Instant Connections</h4>
                    <p className="text-sm text-gray-500">Get 10 SuperSwipes per month to instantly connect with golfers you're interested in</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">See Who's Interested</h4>
                    <p className="text-sm text-gray-500">View all players who have already swiped right on your profile</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Exclusive Discounts</h4>
                    <p className="text-sm text-gray-500">Access flash deals and special rates at partner courses</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Priority Tee Times</h4>
                    <p className="text-sm text-gray-500">Get early access to book popular tee times before they fill up</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Plan Selection */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-montserrat font-bold mb-3">Choose Your Plan</h3>
              
              <div className="space-y-3">
                <div 
                  className={`border-2 ${
                    selectedPlan === 'annual' ? 'border-yellow-500' : 'border-gray-400'
                  } rounded-lg p-3 relative`}
                >
                  <div className="absolute -top-3 -right-1 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                    Best Value
                  </div>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <input 
                        type="radio" 
                        id="plan-annual" 
                        name="plan" 
                        className="w-5 h-5" 
                        checked={selectedPlan === 'annual'}
                        onChange={() => setSelectedPlan('annual')}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="plan-annual" className="font-medium">Annual</label>
                      <p className="text-sm text-gray-500">$99.99 per year (save 40%)</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${
                    selectedPlan === 'monthly' ? 'border-yellow-500 border-2' : 'border-gray-400'
                  } rounded-lg p-3`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      <input 
                        type="radio" 
                        id="plan-monthly" 
                        name="plan" 
                        className="w-5 h-5" 
                        checked={selectedPlan === 'monthly'}
                        onChange={() => setSelectedPlan('monthly')}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="plan-monthly" className="font-medium">Monthly</label>
                      <p className="text-sm text-gray-500">$12.99 per month</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button
            onClick={handleGetPremium}
            className="w-full py-3 bg-yellow-500 text-white rounded-full font-medium shadow-md hover:bg-yellow-600 transition mb-4"
          >
            Get Premium
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and authorize recurring charges to your payment method until canceled.
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
