import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { allDataApi } from '../../services/api';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Analytics.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'dd/MM/yyyy'));
  const [toDate, setToDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [attendanceByDate, setAttendanceByDate] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [employeeAttendance, setEmployeeAttendance] = useState<any[]>([]);
  const [workTimeDistribution, setWorkTimeDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    try {
      const response = await allDataApi.search(fromDate, toDate);
      
      if (response.error) {
        console.error('Error:', response.error);
        return;
      }

      const data = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];

      // Attendance by date
      const attendanceByDateMap: Record<string, number> = {};
      data.forEach((item: any) => {
        const dateStr = item.DateString || item.date_string || item.Date;
        if (dateStr) {
          const date = dateStr.split(' ')[0];
          attendanceByDateMap[date] = (attendanceByDateMap[date] || 0) + 1;
        }
      });

      const attendanceData = Object.entries(attendanceByDateMap)
        .map(([date, count]) => ({
          date: format(new Date(date.split('/').reverse().join('-')), 'MMM dd'),
          attendance: count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setAttendanceByDate(attendanceData);

      // Status distribution
      const statusMap: Record<string, number> = {};
      data.forEach((item: any) => {
        const status = item.Status || item.status || 'Unknown';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });

      const statusData = Object.entries(statusMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setStatusDistribution(statusData);

      // Top employees by attendance
      const employeeMap: Record<string, number> = {};
      data.forEach((item: any) => {
        const empcode = item.Empcode || item.empcode || 'Unknown';
        employeeMap[empcode] = (employeeMap[empcode] || 0) + 1;
      });

      const employeeData = Object.entries(employeeMap)
        .map(([empcode, count]) => ({ empcode, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setEmployeeAttendance(employeeData);

      // Work time distribution
      const workTimeMap: Record<string, number> = {};
      data.forEach((item: any) => {
        const wt = item.WorkTime || item.work_time || '0:00';
        const [hours] = wt.split(':').map(Number);
        const range = `${Math.floor(hours / 2) * 2}-${Math.floor(hours / 2) * 2 + 2}h`;
        workTimeMap[range] = (workTimeMap[range] || 0) + 1;
      });

      const workTimeData = Object.entries(workTimeMap)
        .map(([range, count]) => ({ range, count }))
        .sort((a, b) => a.range.localeCompare(b.range));

      setWorkTimeDistribution(workTimeData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>View detailed analytics and insights</p>
      </div>

      <div className="date-filter">
        <div className="form-group">
          <label>
            <Calendar size={16} />
            From Date (DD/MM/YYYY)
          </label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            <Calendar size={16} />
            To Date (DD/MM/YYYY)
          </label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button className="search-btn" onClick={loadAnalytics} disabled={loading}>
          {loading ? 'Loading...' : 'Load Analytics'}
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <div className="charts-container">
          <div className="chart-card">
            <h3>
              <TrendingUp size={20} />
              Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>
              <BarChart3 size={20} />
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>
              <BarChart3 size={20} />
              Top 10 Employees by Attendance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeAttendance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="empcode" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>
              <BarChart3 size={20} />
              Work Time Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

