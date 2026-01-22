import { useState } from 'react';
import { Calendar, Search, Download } from 'lucide-react';
import { allDataApi } from '../../services/api';
import DataTable from '../../components/DataTable/DataTable';
import type { AllData } from '../../types';
import { format } from 'date-fns';
import './Attendance.css';

export default function Attendance() {
  const [data, setData] = useState<AllData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [toDate, setToDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [empcode, setEmpcode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (empcode.trim()) {
        response = await allDataApi.filter(empcode.trim(), fromDate, toDate);
      } else {
        response = await allDataApi.search(fromDate, toDate);
      }

      if (response.error) {
        setError(response.error);
        setData([]);
      } else {
        const responseData = response.data || response;
        const dataArray = Array.isArray(responseData) ? responseData : responseData.data || [];
        
        // Transform API response to AllData format
        const transformedData: AllData[] = dataArray.map((item: any) => ({
          empcode: item.Empcode || item.empcode || '',
          name: item.Name || item.name || '',
          in_time: item.INTime || item.in_time || item.InTime || '',
          out_time: item.OUTTime || item.out_time || item.OutTime || '',
          work_time: item.WorkTime || item.work_time || '',
          over_time: item.OverTime || item.over_time || '',
          break_time: item.BreakTime || item.break_time || '',
          status: item.Status || item.status || '',
          date_string: item.DateString || item.date_string || item.Date || '',
          remark: item.Remark || item.remark || '',
          erl_out: item.ErlOut || item.erl_out || '',
          late_in: item.Late_In || item.late_in || '',
        }));

        setData(transformedData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const csv = [
      ['Empcode', 'Name', 'Date', 'In Time', 'Out Time', 'Work Time', 'Break Time', 'Over Time', 'Status', 'Remark'].join(','),
      ...data.map(row => [
        row.empcode,
        row.name,
        row.date_string,
        row.in_time,
        row.out_time,
        row.work_time,
        row.break_time,
        row.over_time,
        row.status,
        row.remark,
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${fromDate}_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'empcode', header: 'Employee Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'date_string', header: 'Date', sortable: true },
    { key: 'in_time', header: 'In Time', sortable: true },
    { key: 'out_time', header: 'Out Time', sortable: true },
    { key: 'work_time', header: 'Work Time', sortable: true },
    { key: 'break_time', header: 'Break Time', sortable: true },
    { key: 'over_time', header: 'Over Time', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'remark', header: 'Remark', sortable: false },
  ];

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h2>Attendance Data</h2>
        <p>View and search attendance records</p>
      </div>

      <div className="search-panel">
        <div className="search-form">
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
          <div className="form-group">
            <label>
              <Search size={16} />
              Employee Code (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave empty for all employees"
              value={empcode}
              onChange={(e) => setEmpcode(e.target.value)}
            />
          </div>
          <button className="search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <span className="results-count">{data.length} records found</span>
          </div>
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            onExport={handleExport}
            searchable={true}
            searchKeys={['empcode', 'name', 'date_string']}
          />
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div className="empty-state">
          <Calendar size={48} />
          <p>Enter dates and click Search to view attendance data</p>
        </div>
      )}
    </div>
  );
}

