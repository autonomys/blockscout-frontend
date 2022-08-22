import { Center, VStack, Box } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

import Page from 'ui/shared/Page/Page';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <Page>
      <Center h="100%">
        <VStack gap={ 4 }>
          <Box>home page for { router.query.network_type } { router.query.network_sub_type } network</Box>
        </VStack>
      </Center>
    </Page>
  );
};

export default Home;