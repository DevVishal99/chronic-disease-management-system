import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Patient, HealthMetric, Message } from '../types';

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientMetrics, setPatientMetrics] = useState<HealthMetric[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:5000/api/providers/${user?.id}/patients`);
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError('Failed to fetch patients');
    }
  };

  const fetchPatientMetrics = async (patientId: string) => {
    try {
      // TODO: Implement API call
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/metrics`);
      const data = await response.json();
      setPatientMetrics(data);
      setSelectedPatient(patients.find(p => p.id === patientId) || null);
    } catch (err) {
      setError('Failed to fetch patient metrics');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPatient || !message.trim()) return;

    try {
      // TODO: Implement API call
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: selectedPatient.id,
          content: message,
        }),
      });

      if (response.ok) {
        setSuccess('Message sent successfully');
        setMessage('');
        setOpenDialog(false);
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const getPatientStatus = (patient: Patient) => {
    // TODO: Implement status logic based on metrics
    return 'Stable';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, Dr. {user?.name}
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
        {/* Patient List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Patients
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={getPatientStatus(patient)}
                          color={getPatientStatus(patient) === 'Stable' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => fetchPatientMetrics(patient.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Patient Metrics */}
        <Grid item xs={12} md={8}>
          {selectedPatient && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {selectedPatient.name}'s Health Metrics
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
                >
                  Send Message
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patientMetrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          {new Date(metric.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{metric.type}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>{metric.unit}</TableCell>
                        <TableCell>{metric.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Message Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Send Message to {selectedPatient?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderDashboard; 