import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ContactFloatButton } from '../components/ContactFloatButton';

export const CustomerLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      <Footer />
      <ContactFloatButton />
    </Box>
  );
};
