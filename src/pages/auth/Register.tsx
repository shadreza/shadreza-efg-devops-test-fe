import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { register, clearError } from '../../store/slices/authSlice';

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    phone_number: '',
    emirates_id: '',
    preferred_language: 'en',
    role: 'risk_analyst',
  });
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.password_confirm) {
      errors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }

    // Phone number validation (UAE format)
    if (formData.phone_number) {
      const phoneRegex = /^\+971[0-9]{8,9}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        errors.phone_number = 'Please enter a valid UAE phone number (e.g., +971501234567)';
      }
    }

    // Emirates ID validation
    if (formData.emirates_id) {
      const emiratesIdRegex = /^[0-9]{3}-[0-9]{4}-[0-9]{7}-[0-9]{1}$/;
      if (!emiratesIdRegex.test(formData.emirates_id)) {
        errors.emirates_id = 'Please enter a valid Emirates ID (e.g., 784-1234-1234567-1)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormData({ ...formData, [field]: newValue });
    
    // Auto-generate username from email if username is empty
    if (field === 'email' && !formData.username && newValue) {
      const generatedUsername = newValue.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      if (generatedUsername) {
        setFormData(prev => ({ ...prev, [field]: newValue, username: generatedUsername }));
      }
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    if (!validateForm()) {
      setLocalError('Please fix the errors below');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      // Registration successful, will redirect via useEffect
    } catch (err: any) {
      console.error('Registration error:', err);
      setLocalError(err || 'Registration failed. Please try again.');
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Auto-add +971 prefix if not present
    if (value && !value.startsWith('+971')) {
      value = '+971' + value.replace(/^\+?971?/, '');
    }
    setFormData({ ...formData, phone_number: value });
    if (validationErrors.phone_number) {
      setValidationErrors({ ...validationErrors, phone_number: '' });
    }
  };

  const formatEmiratesId = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Apply format: 784-1234-1234567-1
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 14) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 14)}-${cleaned.slice(14, 15)}`;
  };

  const handleEmiratesIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEmiratesId(e.target.value);
    setFormData({ ...formData, emirates_id: formatted });
    if (validationErrors.emirates_id) {
      setValidationErrors({ ...validationErrors, emirates_id: '' });
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
              QBT AML SYSTEM REGISTRATION
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join the QBT AML SYSTEM 
              </Typography>
            </Box>

            {(localError || error) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {localError || error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    type="email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    placeholder="Enter your email address"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username *"
                    variant="outlined"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                    error={!!validationErrors.username}
                    helperText={validationErrors.username || 'Choose a unique username'}
                    placeholder="Enter your username"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={formData.first_name}
                    onChange={handleInputChange('first_name')}
                    disabled={isLoading}
                    autoComplete="given-name"
                    error={!!validationErrors.first_name}
                    helperText={validationErrors.first_name}
                    placeholder="Enter your first name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={formData.last_name}
                    onChange={handleInputChange('last_name')}
                    disabled={isLoading}
                    autoComplete="family-name"
                    error={!!validationErrors.last_name}
                    helperText={validationErrors.last_name}
                    placeholder="Enter your last name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    type="password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    error={!!validationErrors.password}
                    helperText={validationErrors.password || 'Minimum 8 characters'}
                    placeholder="Enter your password"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    variant="outlined"
                    value={formData.password_confirm}
                    onChange={handleInputChange('password_confirm')}
                    type="password"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    error={!!validationErrors.password_confirm}
                    helperText={validationErrors.password_confirm}
                    placeholder="Confirm your password"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    value={formData.phone_number}
                    onChange={handlePhoneNumberChange}
                    disabled={isLoading}
                    error={!!validationErrors.phone_number}
                    helperText={validationErrors.phone_number || 'UAE format: +971501234567'}
                    placeholder="+971501234567"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emirates ID"
                    variant="outlined"
                    value={formData.emirates_id}
                    onChange={handleEmiratesIdChange}
                    disabled={isLoading}
                    error={!!validationErrors.emirates_id}
                    helperText={validationErrors.emirates_id || 'Format: 784-1234-1234567-1'}
                    placeholder="784-1234-1234567-1"
                    inputProps={{ maxLength: 18 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Preferred Language"
                    variant="outlined"
                    value={formData.preferred_language}
                    onChange={handleInputChange('preferred_language')}
                    disabled={isLoading}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">العربية (Arabic)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink 
                    component={Link} 
                    to="/login" 
                    variant="body2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Sign in here
                  </MuiLink>
                </Typography>
              </Box>
            </form>

            {/* Development hint */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" color="info.contrastText">
                <strong>Note:</strong> Phone number and Emirates ID are optional but recommended for enhanced security
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}; 