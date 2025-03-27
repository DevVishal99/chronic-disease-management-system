import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['patient', 'provider'], 'Invalid role')
    .required('Role is required'),
  dateOfBirth: Yup.string().when('role', {
    is: 'patient',
    then: Yup.string().required('Date of birth is required for patients'),
    otherwise: Yup.string(),
  }),
  specialization: Yup.string().when('role', {
    is: 'provider',
    then: Yup.string().required('Specialization is required for providers'),
    otherwise: Yup.string(),
  }),
  consent: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = React.useState<string>('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: '',
      dateOfBirth: '',
      specialization: '',
      consent: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await register(values);
        navigate(values.role === 'patient' ? '/patient' : '/provider');
      } catch (err) {
        setError('Registration failed. Please try again.');
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              label="Role"
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="provider">Healthcare Provider</MenuItem>
            </Select>
            {formik.touched.role && formik.errors.role && (
              <Typography color="error" variant="caption">
                {formik.errors.role}
              </Typography>
            )}
          </FormControl>

          {formik.values.role === 'patient' && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="dateOfBirth"
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
            />
          )}

          {formik.values.role === 'provider' && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="specialization"
              label="Specialization"
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              error={formik.touched.specialization && Boolean(formik.errors.specialization)}
              helperText={formik.touched.specialization && formik.errors.specialization}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                name="consent"
                checked={formik.values.consent}
                onChange={formik.handleChange}
                color="primary"
              />
            }
            label="I agree to the terms and conditions"
          />
          {formik.touched.consent && formik.errors.consent && (
            <Typography color="error" variant="caption" display="block">
              {formik.errors.consent}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register; 