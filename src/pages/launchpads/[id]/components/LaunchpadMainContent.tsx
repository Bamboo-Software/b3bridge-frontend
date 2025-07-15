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
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatNumber, shortenAddress } from '@/utils';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { getStatusBadge } from '@/utils/launchpads';
import { LaunchpadContributor } from './LaunchpadContributor';
import type { ContributorRow, PresaleDetailResponse } from '@/utils/interfaces/launchpad';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';

interface LaunchpadMainContentProps {
  launchpad: PresaleDetailResponse;
  supportedChains: LaunchpadSupportedChain[];
  contributorState: ContributorRow[]
}

export const LaunchpadMainContent = ({
  launchpad,
  supportedChains,
  contributorState
}: LaunchpadMainContentProps) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (key: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  const mainChain = launchpad.presaleChains[0];
  const oftToken = mainChain?.oftToken;
  const tokenAddress = mainChain?.tokenAddress || '';
  const tokenName = oftToken?.name || launchpad.title;
  const tokenSymbol = oftToken?.symbol || '';
  const tokenDecimals = oftToken?.decimals ?? 18;
  const tokenLogo = oftToken?.logoUrl || '/images/default-coin-logo.jpg';

  const getChainInfo = (chainId: string) => {
    return supportedChains.find((c) => c.chainId === chainId);
  };

  // Social links mapping
  const socialLinks = [
    {
      url: launchpad.githubURL,
      icon: GithubIcon,
      label: 'GitHub'
    },
    {
      url: launchpad.telegramURL,
      icon: TelegramIcon,
      label: 'Telegram'
    },
    {
      url: launchpad.xURL,
      icon: XIcon,
      label: 'X (Twitter)'
    },
    {
      url: launchpad.websiteURL,
      icon: GlobeIcon,
      label: 'Website'
    }
  ].filter(link => link.url && link.url.trim() !== ''); // Only show links that have URLs
  return (
    <div className='lg:col-span-2 space-y-6'>
      {/* Header */}
      <Card className='bg-[var(--gray-night)] border-[#2a3441] rounded-xl overflow-hidden'>
        <div className='relative'>
          {/* Banner image inside card */}
          <div className='h-48'>
            <Image
              src={launchpad.bannerUrl}
              fallbackSrc='/images/default-banner.png'
              alt={launchpad.title}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Project logo overlay - positioned at bottom center of banner */}
          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
            <Image
              src={tokenLogo}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={tokenName}
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
            {launchpad.title}
          </h1>

          {/* Social links - only show if there are any links */}
          {socialLinks.length > 0 && (
            <div className='flex gap-3 justify-center pb-4 border-b border-[color:var(--gray-charcoal)]'>
              {socialLinks.map((social, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={social.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:opacity-70 transition-opacity'
                      >
                        <Image src={social.icon} alt={`${social.label} icon`} />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{social.label}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}

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
                    {tokenName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Symbol</span>
                  <span className='font-semibold text-primary'>
                    {tokenSymbol}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>Decimals</span>
                  <span className='font-semibold text-primary'>
                    {tokenDecimals}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chain Info */}
          <div className='mb-6'>
            <div className='font-semibold mb-4 text-white'>Chains</div>
            <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
              <Accordion type='multiple' className='flex flex-col gap-3'>
                {launchpad.presaleChains.map((chain) => {
                  const chainInfo = getChainInfo(chain.chainId);
                  return (
                    <AccordionItem
                      key={chain.id}
                      value={chain.id}
                      className='cursor-pointer !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
                    >
                      <div className='rounded-xl bg-[color:var(--gray-night)]'>
                        <AccordionTrigger className='p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline'>
                          <div className='flex !flex-1 gap-2 items-center'>
                            <Image
                              src={chainInfo?.icon || ''}
                              alt={chain.oftToken.name}
                              className='w-6 h-6 rounded-full'
                            />
                            <span className='font-semibold text-foreground'>
                              {chainInfo?.name }
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='px-6 pb-6 pt-3 border-t border-[color:var(--gray-charcoal)]'>
                          <div className='flex flex-col'>
                            <div className='flex items-center justify-between py-2'>
                              <span className='text-foreground'>
                                Token Address
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      className='flex items-center gap-2 font-semibold text-primary cursor-pointer truncate max-w-[220px]'
                                      onClick={() =>
                                        handleCopy(chain.id, chain.tokenAddress)
                                      }
                                    >
                                      <span>
                                        {shortenAddress(chain.tokenAddress) ||
                                          '-'}
                                      </span>
                                      {copied[chain.id] ? (
                                        <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                                      ) : (
                                        <Image src={CopyIcon} alt='copy' />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>{chain.tokenAddress}</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>
                                Presale Rate
                              </span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.presaleRate)}
                              </span>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>
                                Number of tokens
                              </span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.totalTokens)}
                              </span>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>Softcap</span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.softCap)}
                              </span>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>Hardcap</span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.hardCap)}
                              </span>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>
                                Minimum Buy
                              </span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.minContribution)}
                              </span>
                            </div>
                            <div className='flex justify-between py-2 border-t border-[color:var(--gray-charcoal)]'>
                              <span className='text-foreground'>
                                Maximum Buy
                              </span>
                              <span className='font-semibold text-primary'>
                                {formatNumber(chain.maxContribution)}
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  );
                })}
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
                    {launchpad.startTime
                      ? new Date(launchpad.startTime).toLocaleString()
                      : '-'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground'>End time</span>
                  <span className='font-semibold text-primary'>
                    {launchpad.endTime
                      ? new Date(launchpad.endTime).toLocaleString()
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributors */}
      <LaunchpadContributor launchpad={launchpad} supportedChains={supportedChains} mergedContributors={contributorState}/>
    </div>
  );
};