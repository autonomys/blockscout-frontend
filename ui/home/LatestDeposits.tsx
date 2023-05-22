import { Box, Flex, Text, Skeleton } from '@chakra-ui/react';
import { route } from 'nextjs-routes';
import React from 'react';

import type { SocketMessage } from 'lib/socket/types';

import useApiQuery from 'lib/api/useApiQuery';
import useGradualIncrement from 'lib/hooks/useGradualIncrement';
import useIsMobile from 'lib/hooks/useIsMobile';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import LinkInternal from 'ui/shared/LinkInternal';
import SocketNewItemsNotice from 'ui/shared/SocketNewItemsNotice';

import LatestDepositsItem from './LatestDepositsItem';
import LatestDepositsItemSkeleton from './LatestDepositsItemSkeleton';

const LatestDeposits = () => {
  const isMobile = useIsMobile();
  const itemsCount = isMobile ? 2 : 6;
  const { data, isLoading, isError } = useApiQuery('homepage_deposits');

  const [ num, setNum ] = useGradualIncrement(0);
  const [ socketAlert, setSocketAlert ] = React.useState('');

  const handleSocketClose = React.useCallback(() => {
    setSocketAlert('Connection is lost. Please reload page.');
  }, []);

  const handleSocketError = React.useCallback(() => {
    setSocketAlert('An error has occurred while fetching new transactions. Please reload page.');
  }, []);

  const handleNewDepositMessage: SocketMessage.NewDeposits['handler'] = React.useCallback((payload) => {
    setNum(payload.deposits);
  }, [ setNum ]);

  const channel = useSocketChannel({
    topic: 'optimism_deposits:new_deposits',
    onSocketClose: handleSocketClose,
    onSocketError: handleSocketError,
    isDisabled: false,
  });

  useSocketMessage({
    channel,
    event: 'deposits',
    handler: handleNewDepositMessage,
  });

  if (isLoading) {
    return (
      <>
        <Skeleton h="32px" w="100%" borderBottomLeftRadius={ 0 } borderBottomRightRadius={ 0 }/>
        { Array.from(Array(itemsCount)).map((item, index) => <LatestDepositsItemSkeleton key={ index }/>) }
      </>
    );
  }

  if (isError) {
    return <Text mt={ 4 }>No data. Please reload page.</Text>;
  }

  if (data) {
    const depositsUrl = route({ pathname: '/l2-deposits' });
    return (
      <>
        <SocketNewItemsNotice borderBottomRadius={ 0 } url={ depositsUrl } num={ num } alert={ socketAlert } type="deposit"/>
        <Box mb={{ base: 3, lg: 4 }}>
          { data.slice(0, itemsCount).map((item => <LatestDepositsItem key={ item.l2_tx_hash } item={ item }/>)) }
        </Box>
        <Flex justifyContent="center">
          <LinkInternal fontSize="sm" href={ depositsUrl }>View all deposits</LinkInternal>
        </Flex>
      </>
    );
  }

  return null;
};

export default LatestDeposits;