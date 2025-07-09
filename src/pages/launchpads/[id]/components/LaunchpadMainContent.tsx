/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from '@/components/ui/image';
import { Card, CardContent } from '@/components/ui/card';
import GithubIcon from '@/assets/icons/github-primary-icon.svg';
import TelegramIcon from '@/assets/icons/telegram-primary-icon.svg';
import XIcon from '@/assets/icons/x-primary-icon.svg';
import GlobeIcon from '@/assets/icons/website-primary-icon.svg';
import CopyIcon from '@/assets/icons/copy-icon.svg';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AccordionContent } from '@radix-ui/react-accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { shortenAddress } from '@/utils';
import { CheckIcon } from 'lucide-react';
import type { LaunchpadDetailData } from '..';
import { useState } from 'react';
import { getStatusBadge } from '@/utils/launchpads';
import { LaunchpadContributor } from './LaunchpadContributor';

export const LaunchpadMainContent = ({
  launchpad,
}: {
  launchpad: LaunchpadDetailData;
}) => {
  const tokenAddress = '9Xh5zLJITnY9RJoyyH7B5333gmFgYGDXwxESSqynLat';

  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (key: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <div className='lg:col-span-2 space-y-6'>
      {/* Header */}
      <Card className='bg-[var(--gray-night)] border-[#2a3441] rounded-xl overflow-hidden'>
        <div className='relative'>
          {/* Banner image inside card */}
          <div className='h-48'>
            <Image
              src={launchpad.banner}
              fallbackSrc='/images/default-banner.png'
              alt={launchpad.name}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Project logo overlay - positioned at bottom center of banner */}
          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
            <Image
              src={launchpad.logo}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={launchpad.name}
              className='w-20 h-20 rounded-full'
            />
          </div>
        </div>

        <CardContent className='p-6 pt-12 relative'>
          {/* Status badge */}
          <div className='absolute top-4 right-4'>
            {getStatusBadge(launchpad.status)}
          </div>
          <h1 className='text-2xl font-bold text-white mb-4 text-center'>
            {launchpad.name}
          </h1>

          {/* Social links */}
          <div className='flex gap-3 justify-center pb-4 border-b border-[color:var(--gray-charcoal)]'>
            <Image src={GithubIcon} alt='social icon' />
            <Image src={TelegramIcon} alt='social icon' />
            <Image src={XIcon} alt='social icon' />
            <Image src={GlobeIcon} alt='social icon' />
          </div>

          {/* About */}
          <div className='mt-4 mb-6'>
            <h2 className='text-lg font-semibold mb-4 text-white'>About</h2>
            <p className='text-gray-300 leading-relaxed text-sm'>
              {launchpad.description}
            </p>
          </div>

          {/* Token Info */}
          <div className='mb-6'>
              <div className='font-semibold mb-4 text-white'>Token</div>
            <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between py-2'>
                  <span className='text-foreground'>Address</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className='flex items-center gap-2 font-semibold text-primary cursor-pointer truncate max-w-[220px]'
                          onClick={() => handleCopy('token', tokenAddress)}
                        >
                          <span>{shortenAddress(tokenAddress) || '-'}</span>
                          {copied['token'] ? (
                            <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                          ) : (
                            <Image src={CopyIcon} alt='copy' />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{tokenAddress}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Name</span>
                  <span className='font-semibold text-primary'>
                    {launchpad.tokens[0]?.name || launchpad.name}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Symbol</span>
                  <span className='font-semibold text-primary'>
                    {launchpad.tokens[0]?.symbol || 'ELON'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Decimals</span>
                  <span className='font-semibold text-primary'>9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chain */}
          <div className='mb-6'>
            <div className='font-semibold mb-4 text-white'>Chain</div>
            <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
              <Accordion
                type='single'
                collapsible
                className='flex flex-col gap-3'
              >
                {launchpad.chains.map((chain: any) => (
                  <AccordionItem
                    key={chain.id}
                    value={chain.id}
                    className='cursor-pointer !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
                  >
                    <div className='rounded-xl bg-[color:var(--gray-night)]'>
                      <AccordionTrigger className='p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline'>
                        <div className='flex !flex-1 gap-2 items-center'>
                          <Image
                            src={chain.logo}
                            alt={chain.name}
                            className='w-6 h-6 rounded-full'
                          />
                          <span className='font-semibold text-foreground'>
                            {chain.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 pb-6 pt-3 border-t border-[color:var(--gray-charcoal)]'>
                        <div className='flex flex-col'>
                          <div className='flex items-center justify-between py-2'>
                            <span className='text-foreground'>Address</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className='flex items-center gap-2 font-semibold text-primary cursor-pointer truncate max-w-[220px]'
                                    onClick={() =>
                                      handleCopy(chain.id, tokenAddress)
                                    }
                                  >
                                    <span>
                                      {shortenAddress(tokenAddress) || '-'}
                                    </span>
                                    {copied[chain.id] ? (
                                      <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                                    ) : (
                                      <Image src={CopyIcon} alt='copy' />
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>{tokenAddress}</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {[
                            { label: 'Presale Rate', value: '12' },
                            { label: 'Number of tokens', value: '14' },
                            {
                              label: `Softcap (${chain.token})`,
                              value: `${chain.raised} ${chain.token}`,
                            },
                            {
                              label: `Hardcap (${chain.token})`,
                              value: `${chain.target} ${chain.token}`,
                            },
                            {
                              label: 'Minimum Buy',
                              value: `0.1 ${chain.token}`,
                            },
                            {
                              label: 'Maximum Buy',
                              value: `10 ${chain.token}`,
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'
                            >
                              <span className='text-foreground'>
                                {item.label}
                              </span>
                              <span className='font-semibold text-primary'>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Time */}
          <div className='mb-6'>
            <div className='font-semibold mb-4 text-white'>Time</div>
            <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Start time</span>
                  <span className='font-semibold text-primary'>
                    {launchpad.timeline.find(
                      (t: any) => t.phase === 'Start time'
                    )?.date || '2025.07.07 14:00'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>End time</span>
                  <span className='font-semibold text-primary'>
                    {launchpad.timeline.find((t: any) => t.phase === 'End time')
                      ?.date || '2025.07.08 17:00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributors */}
      <LaunchpadContributor/>
    </div>
  );
};
