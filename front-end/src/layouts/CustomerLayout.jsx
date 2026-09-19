import React from 'react';
import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ContactFloatButton } from '../components/ContactFloatButton';

export const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      {isHomePage ? (
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      ) : (
        <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 2.5, md: 4 } }}>
          {children}
        </Container>
      )}
      <Footer />
      <ContactFloatButton />
    </Box>
  );
};
