/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NumericFormat } from 'react-number-format';
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
import { cn } from '@/utils';
import { MultiSelect } from '@/components/ui/multiselect';
import { configLaunchPadsChains } from '@/utils/constants/chain';
import type { Chain } from 'viem';
import { getChainImage } from '@/utils/blockchain/chain';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { ITokenOFT } from '@/utils/interfaces/token';
import type { LaunchpadFormValues } from './launchpadFormValidation';
import { NumericCustomInput } from '@/pages/common/NumericCustomInput';

export function Step1Info({ tokens }: { tokens: ITokenOFT[] }) {
  const { control, watch } = useFormContext<LaunchpadFormValues>();
  const selectedToken = watch('token');
  const token = tokens.find((t: ITokenOFT) => t.id === selectedToken);
  const selectedChains = watch('chain') || [];
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
              <SelectTrigger className='w-full  border border-[color:var(--gray-charcoal)] rounded-lg px-4 py-3 text-foreground hover:text-accent-foreground '>
                <SelectValue placeholder='Select token' />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((t: ITokenOFT) => (
                  <SelectItem
                    className='!hover:text-accent-foreground'
                    key={t.id}
                    value={t.id}
                  >
                    <div className='flex gap-2'>
                      <Image
                        src={t.logoUrl || '/images/default-coin-logo.jpg'}
                        fallbackSrc='/images/default-coin-logo.jpg'
                        alt={t.name}
                        className='w-5 h-5 rounded-full'
                      />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {selectedToken && (
          <div className='rounded-lg p-6 mt-3 flex flex-col  bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)]'>
            <div className='flex justify-between pb-3  border-b border-[color:var(--gray-charcoal)]'>
              <span className='text-foreground'>Name</span>
              <span className='font-semibold  text-primary'>{token?.name}</span>
            </div>
            <div className='flex justify-between py-3 border-b border-[color:var(--gray-charcoal)]'>
              <span className='text-foreground'>Symbol</span>
              <span className='font-semibold  text-primary'>
                {token?.symbol}
              </span>
            </div>
            <div className='flex justify-between pt-3'>
              <span className='text-foreground'>Decimals</span>
              <span className='font-semibold  text-primary'>
                {token?.decimals}
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Chain */}
      <div className='mb-6'>
        <div className='flex items-start justify-between mb-3'>
          <label className='block font-semibold text-foreground'>Chain</label>
          <Controller
            name='chain'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <MultiSelect
                className='!bg-transparent border-input'
                variant='default'
                badgeClassName='!bg-[color:var(--gray-night)]'
                value={field.value || []}
                onValueChange={field.onChange}
                options={configLaunchPadsChains.map((chain: Chain) => ({
                  label: (
                    <div className='flex items-center gap-2'>
                      <Image
                        objectFit='contain'
                        src={getChainImage({
                          chainId: chain.id,
                          source: ChainTokenSource.Local,
                        })}
                        alt={chain.name}
                        className='w-5 h-5 rounded-full'
                      />
                      <span>{chain.name}</span>
                    </div>
                  ),
                  value: chain.id.toString(),
                }))}
                placeholder='Select chain(s)'
              />
            )}
          />
        </div>

       <Accordion type='multiple' className='flex flex-col gap-3'>
          {configLaunchPadsChains
            .filter((chain: Chain) =>
              selectedChains.includes(chain.id.toString())
            )
            .map((chain: Chain) => (
              <AccordionItem
                key={chain.id}
                value={chain.id.toString()}
                className='cursor-pointer !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
              >
                <div className='rounded-xl bg-[color:var(--gray-night)]'>
                  <AccordionTrigger
                    className={cn([
                      'p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline',
                    ])}
                  >
                    <div className='flex !flex-1 gap-2 items-center'>
                      <Image
                        src={getChainImage({
                          chainId: chain.id,
                          source: ChainTokenSource.Local,
                        })}
                        objectFit='contain'
                        alt={chain.name}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='font-semibold text-foreground'>
                        {chain.name}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='mx-6 pt-3 pb-6  border-t border-[color:var(--gray-charcoal)]'>
                    <div className='flex flex-col gap-0'>
                      <div className='flex justify-between pb-3'>
                        <label className='text-foreground'>Presale Rate</label>
                        <Controller
                          name={`chainFields.${chain.id}.presaleRate`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Presale Rate'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className='flex justify-between py-3'>
                        <label className='text-foreground'>
                          Number of tokens
                        </label>
                        <Controller
                          name={`chainFields.${chain.id}.numberOfTokens`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Number of tokens'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className='flex justify-between py-3'>
                        <label className='text-foreground'>Softcap</label>
                        <Controller
                          name={`chainFields.${chain.id}.softcap`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Softcap'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className='flex justify-between py-3'>
                        <label className='text-foreground'>Hardcap</label>
                        <Controller
                          name={`chainFields.${chain.id}.hardcap`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Hardcap'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className='flex justify-between py-3'>
                        <label className='text-foreground'>Minimum Buy</label>
                        <Controller
                          name={`chainFields.${chain.id}.minBuy`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Minimum Buy'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className='flex justify-between pt-3'>
                        <label className='text-foreground'>Maximum Buy</label>
                        <Controller
                          name={`chainFields.${chain.id}.maxBuy`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              {...field}
                              customInput={NumericCustomInput}
                              placeholder='Maximum Buy'
                              allowNegative={false}
                              decimalScale={0}
                              allowLeadingZeros={false}
                              thousandSeparator
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
        </Accordion>
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
        </div>
      </div>

      <div className='flex flex-col gap-2 text-primary mt-4'>
        <div className='text-sm'>
          Total fees:
          <span className='ms-1 font-semibold'>2% System</span>
        </div>
      </div>
    </>
  );
}
