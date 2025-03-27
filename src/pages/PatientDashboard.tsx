import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { HealthMetric } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const validationSchema = Yup.object({
  type: Yup.string()
    .oneOf(['bloodSugar', 'bloodPressure', 'weight'], 'Invalid metric type')
    .required('Metric type is required'),
  value: Yup.number()
    .required('Value is required')
    .positive('Value must be positive'),
  unit: Yup.string().required('Unit is required'),
  notes: Yup.string(),
});

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // TODO: Fetch patient's metrics from API
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:5000/api/patients/${user?.id}/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError('Failed to fetch metrics');
    }
  };

  const formik = useFormik({
    initialValues: {
      type: '',
      value: '',
      unit: '',
      notes: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // TODO: Implement API call
        const response = await fetch(`http://localhost:5000/api/patients/${user?.id}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          setSuccess('Metric added successfully');
          fetchMetrics();
          formik.resetForm();
        } else {
          setError('Failed to add metric');
        }
      } catch (err) {
        setError('Failed to add metric');
      }
    },
  });

  const getChartData = (metricType: string) => {
    const filteredMetrics = metrics
      .filter((m) => m.type === metricType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-7);

    return {
      labels: filteredMetrics.map((m) => new Date(m.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: metricType,
          data: filteredMetrics.map((m) => m.value),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Health Metrics Charts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Blood Sugar
            </Typography>
            <Line data={getChartData('bloodSugar')} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Blood Pressure
            </Typography>
            <Line data={getChartData('bloodPressure')} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weight
            </Typography>
            <Line data={getChartData('weight')} />
          </Paper>
        </Grid>

        {/* Add New Metric Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add New Metric
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Metric Type</InputLabel>
                    <Select
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                    >
                      <MenuItem value="bloodSugar">Blood Sugar</MenuItem>
                      <MenuItem value="bloodPressure">Blood Pressure</MenuItem>
                      <MenuItem value="weight">Weight</MenuItem>
                    </Select>
                    {formik.touched.type && formik.errors.type && (
                      <Typography color="error" variant="caption">
                        {formik.errors.type}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    name="value"
                    label="Value"
                    type="number"
                    value={formik.values.value}
                    onChange={formik.handleChange}
                    error={formik.touched.value && Boolean(formik.errors.value)}
                    helperText={formik.touched.value && formik.errors.value}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    name="unit"
                    label="Unit"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    error={formik.touched.unit && Boolean(formik.errors.unit)}
                    helperText={formik.touched.unit && formik.errors.unit}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="notes"
                    label="Notes"
                    multiline
                    rows={2}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={formik.isSubmitting}
                  >
                    Add Metric
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard; 