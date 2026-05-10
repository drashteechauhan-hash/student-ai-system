import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'https://student-ai-system-kgq0.onrender.com'

;

export default function DatasetUpload() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [retrainResult, setRetrainResult] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['.xlsx', '.csv', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Only .xlsx, .xls or .csv files allowed');
      return;
    }
    setUploading(true);
    setUploadResult(null);
    setRetrainResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/upload-dataset`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      toast.success(`✅ Dataset uploaded: ${res.data.rows} rows`);
    } catch (e) {
      toast.error('Upload failed — is the backend running?');
    }
    setUploading(false);
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainResult(null);
    try {
      const res = await axios.post(`${API}/retrain`);
      setRetrainResult(res.data);
      toast.success('🤖 Models retrained successfully!');
    } catch (e) {
      toast.error('Retraining failed — check backend logs');
    }
    setRetraining(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">📤 Upload Dataset & Retrain</div>
        <span style={{
          fontSize: '11px', padding: '3px 8px',
          background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
          borderRadius: '6px',
        }}>Live Retraining</span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent-purple)' : 'rgba(124,58,237,0.3)'}`,
          borderRadius: 'var(--radius)',
          padding: '28px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)',
          transition: 'var(--transition)',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
          {uploading ? '⏳' : '📁'}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {uploading ? 'Uploading...' : 'Drop your .xlsx or .csv file here'}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          or click to browse
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '10px',
          marginBottom: '12px',
          fontSize: '13px',
        }}>
          <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>
            ✅ {uploadResult.message}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {uploadResult.rows} rows · {uploadResult.columns?.length} columns
          </div>
        </div>
      )}

      {/* Retrain Button */}
      <button
        className="btn btn-primary"
        onClick={handleRetrain}
        disabled={retraining}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {retraining ? (
          <>
            <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            Retraining all 5 models...
          </>
        ) : '🤖 Retrain Models'}
      </button>

      {/* Retrain Result */}
      {retrainResult && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '10px',
          fontSize: '13px',
        }}>
          <div style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '8px' }}>
            🏆 Retraining Complete
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Performance Model</div>
              <div style={{ fontWeight: '600' }}>{retrainResult.performance_model}</div>
              <div style={{ color: '#10b981' }}>{retrainResult.performance_accuracy}% acc</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Risk Model</div>
              <div style={{ fontWeight: '600' }}>{retrainResult.risk_model}</div>
              <div style={{ color: '#10b981' }}>{retrainResult.risk_accuracy}% acc</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
