/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { useFormContext, Controller } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type {
  IGetListTokenResponse,
  ITokenGroup,
  ITokenOFT,
} from '@/utils/interfaces/token';
import type { LaunchpadFormValues } from './launchpadFormValidation';
import { NumericCustomInput } from '@/pages/common/NumericCustomInput';
import type { Dispatch, SetStateAction } from 'react';
import { appConfig } from '@/utils/constants/app';
import { Loader2, ChevronDown } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebounceValue';

export function Step1Info({
  tokenState,
}: {
  tokenState: {
    tokenData?: IGetListTokenResponse;
    isLoadingMyTokens: boolean;
    error: any;
    filterTokens: {
      page: number;
      q: string;
    };
    setFilterTokens: Dispatch<
      SetStateAction<{
        page: number;
        q: string;
      }>
    >;
  };
}) {
  const { tokenData, isLoadingMyTokens, error, filterTokens, setFilterTokens } =
    tokenState;
  const { control, watch, setValue } = useFormContext<LaunchpadFormValues>();
  const selectedToken = watch('token');
  const selectedChains = watch('chain') || [];

  // State cho dropdown và infinity scroll
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allTokenGroups, setAllTokenGroups] = useState<
    IGetListTokenResponse['items']
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);

  useEffect(() => {
    setAllTokenGroups([]);
    setHasMore(true);
  }, [filterTokens.q]);

  // Chỉ render token group, không flatten ra từng token
  useEffect(() => {
    if (tokenData?.items) {
      setAllTokenGroups((prev) => {
        if (filterTokens.page === 1) {
          return tokenData.items;
        } else {
          const newGroups = tokenData.items.filter(
            (newGroup) =>
              !prev.some(
                (existingGroup) =>
                  existingGroup.tokenGroupId === newGroup.tokenGroupId
              )
          );
          return [...prev, ...newGroups];
        }
      });
      setHasMore(
        (tokenData as any).meta
          ? allTokenGroups.length < (tokenData as any).meta.total
          : tokenData.items.length === appConfig.defaultLimit
      );
    } else if (tokenData && tokenData.items && tokenData.items.length === 0) {
      setHasMore(false);
    }
  }, [tokenData, filterTokens.page]);

  const handleFilterChange = (key: keyof typeof filterTokens, value: any) => {
    setFilterTokens((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  useEffect(() => {
    handleFilterChange('q', debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const fetchMoreTokens = useCallback(() => {
    if (hasMore && !isLoadingMyTokens && (tokenData as any)?.meta) {
      const totalItems = (tokenData as any).meta.total;
      const currentItems = allTokenGroups.length;

      if (
        currentItems < totalItems &&
        filterTokens.page < (tokenData as any).meta.totalPages
      ) {
        setFilterTokens((prev) => ({ ...prev, page: prev.page + 1 }));
      } else {
        setHasMore(false);
      }
    }
  }, [
    hasMore,
    isLoadingMyTokens,
    setFilterTokens,
    allTokenGroups.length,
    tokenData,
    filterTokens.page,
  ]);

  const handleSelectTokenGroup = (group: ITokenGroup) => {
    setValue('token', group);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  // Lấy danh sách chainId từ token group đã chọn
  const availableChains = useMemo(() => {
    if (!selectedToken) return [];
    return selectedToken.tokens.map((t: ITokenOFT) => t.chainId?.toString());
  }, [selectedToken]);

  const presaleId = watch('presaleId');

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
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-between border border-[color:var(--gray-charcoal)] rounded-lg px-4 py-3 text-foreground hover:text-accent-foreground h-auto'
                  disabled={!!presaleId}
                >
                  {selectedToken ? (
                    <div className='flex items-center gap-2'>
                      <Image
                        src={
                          selectedToken.logoUrl ||
                          '/images/default-coin-logo.jpg'
                        }
                        fallbackSrc='/images/default-coin-logo.jpg'
                        alt={selectedToken.name}
                        className='w-5 h-5 rounded-full'
                      />
                      <span>
                        {selectedToken.name} ({selectedToken.symbol})
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>Select token</span>
                  )}
                  <ChevronDown className='h-4 w-4 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[600px] p-0'>
                <div className='p-4 border-b'>
                  <Input
                    placeholder='Search tokens...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full'
                    disabled={!!presaleId}
                  />
                </div>

                <div
                  id='token-infinity-scroll-container'
                  className='max-h-[300px] overflow-y-auto'
                >
                  {error ? (
                    <div className='p-4 text-sm text-red-500 text-center'>
                      Error loading tokens:{' '}
                      {error.message || 'Something went wrong'}
                    </div>
                  ) : (
                    <InfiniteScroll
                      dataLength={allTokenGroups.length}
                      next={fetchMoreTokens}
                      hasMore={hasMore && !isLoadingMyTokens}
                      loader={
                        <div className='flex items-center justify-center p-4'>
                          <Loader2 className='h-4 w-4 animate-spin mr-2' />
                          <span className='text-sm text-muted-foreground'>
                            Loading...
                          </span>
                        </div>
                      }
                      scrollableTarget='token-infinity-scroll-container'
                      endMessage={
                        allTokenGroups.length > 0 && (
                          <div className='p-2 text-sm text-muted-foreground text-center'>
                            All tokens loaded
                          </div>
                        )
                      }
                    >
                      {isLoadingMyTokens && filterTokens.page === 1 ? (
                        <div className='flex items-center justify-center p-8'>
                          <Loader2 className='h-6 w-6 animate-spin mr-2' />
                          <span className='text-sm text-muted-foreground'>
                            Loading tokens...
                          </span>
                        </div>
                      ) : allTokenGroups.length > 0 ? (
                        allTokenGroups.map((group) => (
                          <div
                            key={group.tokenGroupId}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted border-b border-border last:border-b-0 transition-colors ${
                              field.value?.tokenGroupId === group.tokenGroupId
                                ? 'bg-muted font-semibold'
                                : ''
                            }`}
                            onClick={() =>
                              !presaleId && handleSelectTokenGroup(group)
                            }
                            style={presaleId ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                          >
                            <Image
                              src={
                                group.logoUrl || '/images/default-coin-logo.jpg'
                              }
                              fallbackSrc='/images/default-coin-logo.jpg'
                              alt={group.name}
                              className='w-8 h-8 rounded-full'
                            />
                            <div className='flex-1'>
                              <div className='font-medium text-foreground'>
                                {group.name}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {group.symbol}
                              </div>
                            </div>
                            {field.value?.tokenGroupId ===
                              group.tokenGroupId && (
                              <div className='text-primary text-sm'>✓</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className='p-8 text-sm text-muted-foreground text-center'>
                          No tokens found
                        </div>
                      )}
                    </InfiniteScroll>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />

        {selectedToken && selectedToken.id && (
          <div className='rounded-lg p-6 mt-3 flex flex-col bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)]'>
            <div className='flex justify-between pb-3 border-b border-[color:var(--gray-charcoal)]'>
              <span className='text-foreground'>Name</span>
              <span className='font-semibold text-primary'>
                {selectedToken.name}
              </span>
            </div>
            <div className='flex justify-between py-3 border-b border-[color:var(--gray-charcoal)]'>
              <span className='text-foreground'>Symbol</span>
              <span className='font-semibold text-primary'>
                {selectedToken.symbol}
              </span>
            </div>
            <div className='flex justify-between pt-3'>
              <span className='text-foreground'>Decimals</span>
              <span className='font-semibold text-primary'>
                {selectedToken.decimals}
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
                maxCount={2}
                options={configLaunchPadsChains
                  .filter((chain: Chain) =>
                    availableChains.includes(chain.id.toString())
                  )
                  .map((chain: Chain) => ({
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
                disabled={!!presaleId}
              />
            )}
          />
        </div>

        <Accordion type='multiple' className='flex flex-col gap-3'>
          {configLaunchPadsChains
            .filter(
              (chain: Chain) =>
                selectedChains.includes(chain.id.toString()) &&
                availableChains.includes(chain.id.toString())
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
                  <AccordionContent className='mx-6 pt-3 pb-6 border-t border-[color:var(--gray-charcoal)]'>
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
                              disabled={!!presaleId}
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
                              disabled={!!presaleId}
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
                              disabled={!!presaleId}
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
                              disabled={!!presaleId}
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
                              disabled={!!presaleId}
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
                              disabled={!!presaleId}
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
                disabled={!!presaleId}
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
                disabled={!!presaleId}
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
