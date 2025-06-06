import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import WebsiteMonitor from '../components/contributionMethods/WebsiteMonitor';
import { contributionMethods } from '../lib/mockData';
import { ContributionMethod } from '../types';
import { Card } from '../components/ui/card';
import { fadeIn, slideUp, staggerContainer } from '../lib/framer-variants';
import { formatDate, getContributionIcon, getStatusColor } from '../lib/utils';

const WebsiteMonitorPage = () => {
  const [method, setMethod] = useState<ContributionMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the contribution method data
  useEffect(() => {
    // In a real app, this would be an API call
    const foundMethod = contributionMethods.find(m => m.id === 'website-monitor');
    if (foundMethod) {
      setMethod(foundMethod);
    }
    setLoading(false);
  }, []);

  // Only render on client-side to avoid hydration mismatch
  if (!mounted || loading || !method) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={method.name}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Method header */}
        <motion.div variants={fadeIn} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
              {getContributionIcon(method.icon)}
            </div>
            <h1 className="text-3xl font-bold">{method.name}</h1>
          </div>
          
          <p className="text-muted-foreground max-w-3xl">{method.description}</p>
          
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(method.active ? 'active' : 'inactive')}`}>
            {method.active ? 'Active' : 'Inactive'}
          </div>
        </motion.div>

        {/* Stats overview */}
        <motion.div variants={slideUp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Contributions</div>
              <div className="text-2xl font-bold">{method.metrics.contributions.toLocaleString()}</div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Rewards Earned</div>
              <div className="text-2xl font-bold">{method.metrics.rewards.toFixed(2)} <span className="text-base font-normal">SOL</span></div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Per Contribution</div>
              <div className="text-2xl font-bold">{method.rewardRate.toFixed(2)} <span className="text-base font-normal">SOL</span></div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Last Contribution</div>
              <div className="text-xl font-bold">
                {method.metrics.lastContribution ? formatDate(method.metrics.lastContribution) : 'Never'}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Method-specific component */}
        <motion.div variants={slideUp} className="mt-8">
          <WebsiteMonitor />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default WebsiteMonitorPage;