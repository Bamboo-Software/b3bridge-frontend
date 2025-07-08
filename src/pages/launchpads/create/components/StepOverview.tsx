/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Image from '@/components/ui/image';
import { CHAINS, TOKENS, type LaunchpadForm } from '..';
import { cn } from '@/utils';

const SOCIAL_FIELDS = [
  { key: 'website', label: 'Website' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X' },
  { key: 'github', label: 'Github' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'discord', label: 'Discord' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'youtube', label: 'Youtube Video' },
  { key: 'description', label: 'Description' },
];

export function Step3Overview() {
  const { getValues } = useFormContext<LaunchpadForm>();
  const values = getValues();
  const token = TOKENS.find((t) => t.value === values.token);
  const [openChain, setOpenChain] = useState<string | undefined>(values.chain);
  return (
    <div className='space-y-6'>
      {/* Token Info */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2 text-primary'>Token Information</div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <span className='text-foreground'>Total token</span>
            <span className='font-semibold text-primary'>
              {values.numberOfTokens} {token?.symbol}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token name</span>
            <span className='font-semibold text-primary'>{token?.name}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token symbol</span>
            <span className='font-semibold text-primary'>{token?.symbol}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token decimals</span>
            <span className='font-semibold text-primary'>
              {token?.decimals}
            </span>
          </div>
        </div>
      </div>
      {/* Chain */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2 text-primary'>Chain</div>
        <Accordion
          type='single'
          collapsible
          value={openChain}
          onValueChange={setOpenChain}
          className='flex flex-col gap-3'
        >
          {CHAINS.map((chain: any) => (
            <AccordionItem
              key={chain.key}
              value={chain.key}
              className='cursor-pointer  !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
            >
              <div className='rounded-xl bg-[color:var(--gray-night)]'>
                <AccordionTrigger
                  className={cn(
                    (openChain || openChain === chain.key) && '!pt-6 px-6 !pb-3',
                    'p6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline',
                  )}
                >
                  <div className='flex !flex-1 gap-2 items-center '>
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      className='w-6 h-6 rounded-full'
                    />
                    <span className='font-semibold text-foreground'>
                      {chain.name}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-0 pb-0 pt-3'>
                  {chain.fields.length > 0 ? (
                    chain.fields.map((field: any, idx: number) => (
                      <div key={idx} className='flex justify-between py-1'>
                        <span className='text-foreground'>
                          {field.label}
                          {field.sub && (
                            <span className='block text-xs text-primary'>
                              {field.sub}
                            </span>
                          )}
                        </span>
                        <span className='font-semibold text-primary'>
                          {field.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className='text-foreground text-xs'>No data</span>
                  )}
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* Time */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2 text-primary'>Time</div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <span className='text-foreground'>Start time</span>
            <span className='font-semibold text-primary'>
              {values.startTime
                ? new Date(values.startTime)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')
                : '-'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>End time</span>
            <span className='font-semibold text-primary'>
              {values.endTime
                ? new Date(values.endTime)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')
                : '-'}
            </span>
          </div>
        </div>
      </div>
      {/* Additional Info */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2 text-primary'>
          Additional information
        </div>
        <div className='flex flex-col gap-2'>
          {SOCIAL_FIELDS.map((f) =>
            values[f.key as keyof LaunchpadForm] ? (
              <div className='flex justify-between' key={f.key}>
                <span className='text-foreground'>{f.label}</span>
                <span className='font-semibold text-primary text-right max-w-[60%] break-words'>
                  {values[f.key as keyof LaunchpadForm] as string}
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
