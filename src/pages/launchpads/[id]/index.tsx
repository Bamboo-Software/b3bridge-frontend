/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LaunchpadMainContent } from './components/LaunchpadMainContent';
import { LaunchpadSideBar } from './components/LaunchpadSidebar';


export interface LaunchpadDetailData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  rating: number;
  totalRating: number;
  description: string;
  chains: Array<{
    id: string;
    name: string;
    logo: string;
    raised: string;
    target: string;
    progress: number;
    token: string;
    participants: number;
  }>;
  tokens: Array<{
    name: string;
    symbol: string;
    chain: string;
    price: string;
    allocation: string;
    vesting: string;
    logo: string;
  }>;
  goals: Array<{
    name: string;
    target: string;
    current: string;
    progress: number;
    currency: string;
  }>;
  timeline: Array<{
    phase: string;
    date: string;
    status: 'completed' | 'active' | 'upcoming';
  }>;
  contributors: Array<{
    address: string;
    amount: string;
    allocation: string;
    date: string;
    wallet: string;
  }>;
}

// Mock data for CANCELLED status
// const mockDetailData: LaunchpadDetailData = {
//   id: '2',
//   name: 'President Elon',
//   logo: '/images/tokens/president-elon.png',
//   banner: '/images/banners/president-elon-banner.jpg',
//   status: 'cancelled',
//   rating: 4.8,
//   totalRating: 156,
//   description:
//     "ELON is a meme coin inspired by the idea of Elon Musk becoming our president. He is one of the most influential figures of our time. Whether it's in tech, space, or shaping the future, people see Elon as a leader. This token reflects that same energy. We're not here to make political statements. We want to celebrate the idea of leadership with vision and purpose. $ELON represents the level of support his presidency would have.",
//   chains: [
//     {
//       id: 'eth',
//       name: 'Ethereum',
//       logo: '/images/chains/ethereum.png',
//       raised: '4',
//       target: '200',
//       progress: 2,
//       token: 'ETH',
//       participants: 479,
//     },
//     {
//       id: 'avax',
//       name: 'Avalanche',
//       logo: '/images/chains/avalanche.png',
//       raised: '4',
//       target: '200',
//       progress: 2,
//       token: 'AVAX',
//       participants: 89,
//     },
//     {
//       id: 'bsc',
//       name: 'BSC',
//       logo: '/images/chains/bsc.png',
//       raised: '4',
//       target: '200',
//       progress: 2,
//       token: 'BSC',
//       participants: 234,
//     },
//   ],
//   tokens: [
//     {
//       name: 'President Elon',
//       symbol: 'PELC',
//       chain: 'Ethereum',
//       price: '$0.0045 USDT',
//       allocation: 'Choose to pay',
//       vesting: 'TBA',
//       logo: '/images/tokens/president-elon.png',
//     },
//   ],
//   goals: [
//     {
//       name: 'Soft Cap',
//       target: '50,000',
//       current: '8,120',
//       progress: 16.2,
//       currency: 'USDT',
//     },
//     {
//       name: 'Hard Cap',
//       target: '200,000',
//       current: '8,120',
//       progress: 4.1,
//       currency: 'USDT',
//     },
//   ],
//   timeline: [
//     {
//       phase: 'Start time',
//       date: '2025-06-01 10:00',
//       status: 'completed',
//     },
//     {
//       phase: 'End time',
//       date: '2025-06-15 18:00',
//       status: 'cancelled',
//     },
//   ],
//   contributors: [
//     {
//       address: '0x7b6...Fe5',
//       amount: '0.5',
//       allocation: '111,111',
//       date: '2025-06-02',
//       wallet: 'ETH',
//     },
//     {
//       address: '0x9A2...3cd',
//       amount: '1.2',
//       allocation: '266,666',
//       date: '2025-06-02',
//       wallet: 'AVAX',
//     },
//   ],
// };

// Mock data for ENDED status
// const mockDetailData: LaunchpadDetailData = {
//   id: '2',
//   name: 'President Elon',
//   logo: '/images/tokens/president-elon.png',
//   banner: '/images/banners/president-elon-banner.jpg',
//   status: 'ended',
//   rating: 4.8,
//   totalRating: 156,
//   description:
//     "ELON is a meme coin inspired by the idea of Elon Musk becoming our president. He is one of the most influential figures of our time. Whether it's in tech, space, or shaping the future, people see Elon as a leader. This token reflects that same energy. We're not here to make political statements. We want to celebrate the idea of leadership with vision and purpose. $ELON represents the level of support his presidency would have.",
//   chains: [
//     {
//       id: 'eth',
//       name: 'Ethereum',
//       logo: '/images/chains/ethereum.png',
//       raised: '200',
//       target: '200',
//       progress: 100,
//       token: 'ETH',
//       participants: 1250,
//     },
//     {
//       id: 'avax',
//       name: 'Avalanche',
//       logo: '/images/chains/avalanche.png',
//       raised: '180',
//       target: '200',
//       progress: 90,
//       token: 'AVAX',
//       participants: 450,
//     },
//     {
//       id: 'bsc',
//       name: 'BSC',
//       logo: '/images/chains/bsc.png',
//       raised: '200',
//       target: '200',
//       progress: 100,
//       token: 'BSC',
//       participants: 800,
//     },
//   ],
//   tokens: [
//     {
//       name: 'President Elon',
//       symbol: 'PELC',
//       chain: 'Ethereum',
//       price: '$0.0045 USDT',
//       allocation: 'Choose to pay',
//       vesting: 'TBA',
//       logo: '/images/tokens/president-elon.png',
//     },
//   ],
//   goals: [
//     {
//       name: 'Soft Cap',
//       target: '50,000',
//       current: '50,000',
//       progress: 100,
//       currency: 'USDT',
//     },
//     {
//       name: 'Hard Cap',
//       target: '200,000',
//       current: '185,000',
//       progress: 92.5,
//       currency: 'USDT',
//     },
//   ],
//   timeline: [
//     {
//       phase: 'Start time',
//       date: '2025-05-01 10:00',
//       status: 'completed',
//     },
//     {
//       phase: 'End time',
//       date: '2025-05-15 18:00',
//       status: 'completed',
//     },
//   ],
//   contributors: [
//     {
//       address: '0x7b6...Fe5',
//       amount: '2.5',
//       allocation: '555,555',
//       date: '2025-05-02',
//       wallet: 'ETH',
//     },
//     {
//       address: '0x9A2...3cd',
//       amount: '3.2',
//       allocation: '711,111',
//       date: '2025-05-03',
//       wallet: 'AVAX',
//     },
//     {
//       address: '0x1F8...9Ab',
//       amount: '1.8',
//       allocation: '400,000',
//       date: '2025-05-02',
//       wallet: 'BSC',
//     },
//     {
//       address: '0x4C9...2Bd',
//       amount: '4.1',
//       allocation: '911,111',
//       date: '2025-05-04',
//       wallet: 'ETH',
//     },
//     {
//       address: '0x8E1...7Af',
//       amount: '1.3',
//       allocation: '288,888',
//       date: '2025-05-05',
//       wallet: 'BSC',
//     },
//   ],
// };

// Mock data for UPCOMING status
// const mockDetailData: LaunchpadDetailData = {
//   id: '2',
//   name: 'President Elon',
//   logo: '/images/tokens/president-elon.png',
//   banner: '/images/banners/president-elon-banner.jpg',
//   status: 'upcoming',
//   rating: 4.8,
//   totalRating: 156,
//   description:
//     "ELON is a meme coin inspired by the idea of Elon Musk becoming our president. He is one of the most influential figures of our time. Whether it's in tech, space, or shaping the future, people see Elon as a leader. This token reflects that same energy. We're not here to make political statements. We want to celebrate the idea of leadership with vision and purpose. $ELON represents the level of support his presidency would have.",
//   chains: [
//     {
//       id: 'eth',
//       name: 'Ethereum',
//       logo: '/images/chains/ethereum.png',
//       raised: '0',
//       target: '200',
//       progress: 0,
//       token: 'ETH',
//       participants: 0,
//     },
//     {
//       id: 'avax',
//       name: 'Avalanche',
//       logo: '/images/chains/avalanche.png',
//       raised: '0',
//       target: '200',
//       progress: 0,
//       token: 'AVAX',
//       participants: 0,
//     },
//     {
//       id: 'bsc',
//       name: 'BSC',
//       logo: '/images/chains/bsc.png',
//       raised: '0',
//       target: '200',
//       progress: 0,
//       token: 'BSC',
//       participants: 0,
//     },
//   ],
//   tokens: [
//     {
//       name: 'President Elon',
//       symbol: 'PELC',
//       chain: 'Ethereum',
//       price: '$0.0045 USDT',
//       allocation: 'Choose to pay',
//       vesting: 'TBA',
//       logo: '/images/tokens/president-elon.png',
//     },
//   ],
//   goals: [
//     {
//       name: 'Soft Cap',
//       target: '50,000',
//       current: '0',
//       progress: 0,
//       currency: 'USDT',
//     },
//     {
//       name: 'Hard Cap',
//       target: '200,000',
//       current: '0',
//       progress: 0,
//       currency: 'USDT',
//     },
//   ],
//   timeline: [
//     {
//       phase: 'Start time',
//       date: '2025-08-01 10:00',
//       status: 'upcoming',
//     },
//     {
//       phase: 'End time',
//       date: '2025-08-15 18:00',
//       status: 'upcoming',
//     },
//   ],
//   contributors: [],
// };

// Mock data for LIVE status
const mockDetailData: LaunchpadDetailData = {
  id: '2',
  name: 'President Elon',
  logo: '/images/tokens/president-elon.png',
  banner: '/images/banners/president-elon-banner.jpg',
  status: 'live',
  rating: 4.8,
  totalRating: 156,
  description:
    "ELON is a meme coin inspired by the idea of Elon Musk becoming our president. He is one of the most influential figures of our time. Whether it's in tech, space, or shaping the future, people see Elon as a leader. This token reflects that same energy. We're not here to make political statements. We want to celebrate the idea of leadership with vision and purpose. $ELON represents the level of support his presidency would have.",
  chains: [
    {
      id: 'eth',
      name: 'Ethereum',
      logo: '/images/chains/ethereum.png',
      raised: '45',
      target: '200',
      progress: 22.5,
      token: 'ETH',
      participants: 479,
    },
    {
      id: 'avax',
      name: 'Avalanche',
      logo: '/images/chains/avalanche.png',
      raised: '32',
      target: '200',
      progress: 16,
      token: 'AVAX',
      participants: 89,
    },
    {
      id: 'bsc',
      name: 'BSC',
      logo: '/images/chains/bsc.png',
      raised: '28',
      target: '200',
      progress: 14,
      token: 'BSC',
      participants: 234,
    },
  ],
  tokens: [
    {
      name: 'President Elon',
      symbol: 'PELC',
      chain: 'Ethereum',
      price: '$0.0045 USDT',
      allocation: 'Choose to pay',
      vesting: 'TBA',
      logo: '/images/tokens/president-elon.png',
    },
  ],
  goals: [
    {
      name: 'Soft Cap',
      target: '50,000',
      current: '27,895',
      progress: 55.8,
      currency: 'USDT',
    },
    {
      name: 'Hard Cap',
      target: '200,000',
      current: '27,895',
      progress: 13.9,
      currency: 'USDT',
    },
  ],
  timeline: [
    {
      phase: 'Start time',
      date: '2025-07-01 10:00',
      status: 'completed',
    },
    {
      phase: 'End time',
      date: '2025-07-15 18:00',
      status: 'upcoming',
    },
  ],
  contributors: [
    {
      address: '0x7b6...Fe5',
      amount: '0.5',
      allocation: '111,111',
      date: '2025-07-02',
      wallet: 'ETH',
    },
    {
      address: '0x9A2...3cd',
      amount: '1.2',
      allocation: '266,666',
      date: '2025-07-02',
      wallet: 'AVAX',
    },
    {
      address: '0x1F8...9Ab',
      amount: '0.8',
      allocation: '177,777',
      date: '2025-07-01',
      wallet: 'BSC',
    },
  ],
};

export default function LaunchpadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [launchpad, setLaunchpad] = useState<LaunchpadDetailData | null>(null);
 

  useEffect(() => {
    if (id) {
      setLaunchpad(mockDetailData);
    }
  }, [id]);

  if (!launchpad) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading launchpad details...</p>
        </div>
      </div>
    );
  }


  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
            <LaunchpadMainContent launchpad={launchpad} />      

          {/* Sidebar */}
          <LaunchpadSideBar launchpad={launchpad} />
        </div>
      </div>
    </div>
  );
}
