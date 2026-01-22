import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import { allDataApi, mcidDataApi, fileApi } from '../../services/api';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRecords: 0,
    todayAttendance: 0,
    averageWorkTime: '0:00',
  });
  const [loading, setLoading] = useState(true);
  const [attendanceChart, setAttendanceChart] = useState<any[]>([]);
  const [workTimeChart, setWorkTimeChart] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'dd/MM/yyyy');
      const weekAgo = format(subDays(new Date(), 7), 'dd/MM/yyyy');

      // Fetch recent attendance data
      const attendanceResponse = await allDataApi.search(weekAgo, today);
      
      if (attendanceResponse.data) {
        const data = Array.isArray(attendanceResponse.data) 
          ? attendanceResponse.data 
          : attendanceResponse.data.data || [];

        // Calculate stats
        const uniqueEmployees = new Set(data.map((item: any) => item.Empcode || item.empcode)).size;
        const todayData = data.filter((item: any) => {
          const dateStr = item.DateString || item.date_string || item.Date;
          return dateStr?.includes(today.replace(/\//g, '/'));
        });

        // Calculate average work time
        const workTimes = data
          .map((item: any) => {
            const wt = item.WorkTime || item.work_time || '0:00';
            const [hours, minutes] = wt.split(':').map(Number);
            return hours + minutes / 60;
          })
          .filter((wt: number) => !isNaN(wt) && wt > 0);

        const avgWorkTime = workTimes.length > 0
          ? workTimes.reduce((a: number, b: number) => a + b, 0) / workTimes.length
          : 0;

        const avgHours = Math.floor(avgWorkTime);
        const avgMinutes = Math.round((avgWorkTime - avgHours) * 60);

        setStats({
          totalEmployees: uniqueEmployees,
          totalRecords: data.length,
          todayAttendance: todayData.length,
          averageWorkTime: `${avgHours}:${avgMinutes.toString().padStart(2, '0')}`,
        });

        // Prepare chart data
        const attendanceByDate: Record<string, number> = {};
        data.forEach((item: any) => {
          const dateStr = item.DateString || item.date_string || item.Date;
          if (dateStr) {
            const date = dateStr.split(' ')[0]; // Get date part
            attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;
          }
        });

        const chartData = Object.entries(attendanceByDate)
          .map(([date, count]) => ({
            date: format(new Date(date.split('/').reverse().join('-')), 'MMM dd'),
            attendance: count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setAttendanceChart(chartData);

        // Work time distribution
        const workTimeDist: Record<string, number> = {};
        data.forEach((item: any) => {
          const wt = item.WorkTime || item.work_time || '0:00';
          const [hours] = wt.split(':').map(Number);
          const range = `${Math.floor(hours / 2) * 2}-${Math.floor(hours / 2) * 2 + 2}h`;
          workTimeDist[range] = (workTimeDist[range] || 0) + 1;
        });

        const workTimeData = Object.entries(workTimeDist)
          .map(([range, count]) => ({ range, count }))
          .sort((a, b) => a.range.localeCompare(b.range));

        setWorkTimeChart(workTimeData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: '#3b82f6',
    },
    {
      title: 'Total Records',
      value: stats.totalRecords,
      icon: Calendar,
      color: '#10b981',
    },
    {
      title: 'Today\'s Attendance',
      value: stats.todayAttendance,
      icon: Clock,
      color: '#f59e0b',
    },
    {
      title: 'Avg Work Time',
      value: stats.averageWorkTime,
      icon: TrendingUp,
      color: '#8b5cf6',
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="stat-card">
              <div className="stat-card-icon" style={{ backgroundColor: `${card.color}20` }}>
                <Icon size={24} style={{ color: card.color }} />
              </div>
              <div className="stat-card-content">
                <h3>{card.value}</h3>
                <p>{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Work Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workTimeChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

