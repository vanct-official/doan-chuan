import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, maxWidth: 480, mx: 'auto', mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Ứng dụng gặp lỗi
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {this.state.error?.message || 'Không thể hiển thị trang này.'}
            </Typography>
          </Alert>
          <Button variant="contained" onClick={this.handleReload}>
            Tải lại trang
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
