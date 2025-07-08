/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext, Controller } from 'react-hook-form';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import Image from '@/components/ui/image';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { LaunchpadForm } from '..';
import { cn } from '@/utils';

export function Step1Info({ CHAINS, TOKENS }: any) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<LaunchpadForm>();
  const selectedToken = watch('token');
  const token = TOKENS.find((t: any) => t.value === selectedToken);

  return (
    <>     
      {/* Token */}
      <div className='mb-6'>
        <label className='block mb-2 font-semibold text-foreground'>
          Choose Token
        </label>
        <Controller
          name='token'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className='w-full bg-muted/20 border !border-[color:var(--gray-charcoal)] rounded-lg px-4 py-3 text-foreground focus:outline-none'>
                <SelectValue placeholder='Select token' />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((t: any) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.token && (
          <div className='text-red-500 text-xs mt-1'>Token is required</div>
        )}
        <div className='mt-2 text-xs text-primary cursor-pointer'>
          Pool creation fee: {token?.poolFee}
        </div>
        <div className='rounded-lg p-6 mt-3 flex flex-col  bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)]'>
          <div className='flex justify-between pb-3  border-b border-[color:var(--gray-charcoal)]'>
            <span className='text-foreground'>Name</span>
            <span className='font-semibold  text-primary'>{token?.name}</span>
          </div>
          <div className='flex justify-between py-3 border-b border-[color:var(--gray-charcoal)]'>
            <span className='text-foreground'>Symbol</span>
            <span className='font-semibold  text-primary'>{token?.symbol}</span>
          </div>
          <div className='flex justify-between pt-3'>
            <span className='text-foreground'>Decimals</span>
            <span className='font-semibold  text-primary'>
              {token?.decimals}
            </span>
          </div>
        </div>
      </div>
      {/* Chain */}
      <div className='mb-6'>
        <label className='block mb-2 font-semibold text-foreground'>
          Chain
        </label>
        <Controller
          name='chain'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Accordion
              type='single'
              collapsible
              value={field.value}
              onValueChange={field.onChange}
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
                        className={cn([
                          (field.value && field.value === chain.key) && '!pt-6 px-6 !pb-3',
                          'p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline',
                        ])}
                    >
                      <div className='flex !flex-1 gap-2 items-center'>
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
                    <AccordionContent className='mx-6 pt-3 pb-6 border border-t-[color:var(--gray-charcoal)]'>
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
          )}
        />
        {errors.chain && (
          <div className='text-red-500 text-xs mt-1'>Chain is required</div>
        )}
      </div>

      {/* Time */}
      <div className='flex gap-3 mb-6'>
        <div className='flex-1'>
          <label className='block mb-2 font-semibold text-foreground'>
            Start time (UTC)
          </label>
          <Controller
            name='startTime'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                className='w-full'
                value={field.value || undefined}
                onChange={field.onChange}
                placeholder='Start date'
              />
            )}
          />
          {errors.startTime && (
            <div className='text-red-500 text-xs mt-1'>Required</div>
          )}
        </div>
        <div className='flex-1'>
          <label className='block mb-2 font-semibold text-foreground'>
            End time (UTC)
          </label>
          <Controller
            name='endTime'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                className='w-full'
                value={field.value || undefined}
                onChange={field.onChange}
                placeholder='End date'
              />
            )}
          />
          {errors.endTime && (
            <div className='text-red-500 text-xs mt-1'>Required</div>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2 text-primary mt-4'>
        <div className='text-sm'>
          Total fees:
          <span className='ms-1 font-semibold'>5% System</span>
          <span className='mx-1 text-[var(--gray-neutral-1)]'>|</span>
          <span className='font-semibold'>10% to create launchpad</span>
        </div>
      </div>
    </>
  );
}
