'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { bulkImportMembers, getMembers } from '@/services/admin.service';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

export default function ImportMembersModal({
  open,
  onClose,
  onImportSuccess,
  members = [],
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsedMembers, setParsedMembers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  const handleClose = () => {
    setFile(null);
    setParsedMembers([]);
    setError('');
    setIsSubmitting(false);
    setIsDragging(false);
    onClose();
  };

  // Generate & Download Excel template with ALL REAL MEMBER DATA from table list
  const handleDownloadSample = async () => {
    try {
      // 1. Fetch real members if not passed or passed empty
      let list = Array.isArray(members) && members.length > 0 ? members : [];
      if (!list || list.length === 0) {
        try {
          const apiRes = await getMembers({ limit: 1000, status: 'All' });
          list = apiRes.members || (Array.isArray(apiRes) ? apiRes : []);
        } catch (fetchErr) {
          console.warn('Could not fetch members dynamically, using local fallback:', fetchErr);
        }
      }

      if (list && list.length > 0) {
        const headers = [
          'Full Name',
          'Business Name',
          'Business Type',
          'Mobile Number',
          'Email Address',
          'City',
          'Address',
          'Membership ID',
          'Status',
          'Joined Date',
        ];

        const rows = [headers];

        list.forEach((m) => {
          rows.push([
            m.name || m.fullName || '',
            m.business || m.businessName || '',
            m.businessType || 'Retailer',
            m.mobile || m.phone || '',
            m.email || '',
            m.city || 'Ahmedabad',
            m.address || '',
            m.membershipId || m.idCard?.cardNumber || (m.id ? `JBAD${150 + Number(m.id)}` : ''),
            m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'Approved',
            m.joinedOn || m.createdAt || '',
          ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Pre-configure column widths for optimal reading
        ws['!cols'] = [
          { wch: 22 }, // Full Name
          { wch: 32 }, // Business Name
          { wch: 22 }, // Business Type
          { wch: 18 }, // Mobile Number
          { wch: 32 }, // Email Address
          { wch: 16 }, // City
          { wch: 45 }, // Address
          { wch: 18 }, // Membership ID
          { wch: 14 }, // Status
          { wch: 16 }, // Joined Date
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Members');
        XLSX.writeFile(wb, 'jaa_members_sample_template.xlsx');
        showToast('Real members Excel file downloaded successfully!', 'success');
        return;
      }

      // 2. Direct static file download fallback if list is unavailable
      const link = document.createElement('a');
      link.href = '/templates/jaa_members_sample_template.xlsx';
      link.download = 'jaa_members_sample_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Sample template downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate template:', err);
      // Direct static download fallback
      try {
        const link = document.createElement('a');
        link.href = '/templates/jaa_members_sample_template.xlsx';
        link.download = 'jaa_members_sample_template.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Sample template downloaded successfully!', 'success');
      } catch (innerErr) {
        showToast('Failed to download sample file', 'error');
      }
    }
  };

  // Helper to normalize header keys
  const normalizeKey = (key = '') => {
    return key
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
  };

  // Parse Excel / CSV file
  const processFile = async (uploadedFile) => {
    if (!uploadedFile) return;

    setError('');
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = uploadedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please upload a valid CSV, XLSX, or XLS spreadsheet.');
      return;
    }

    if (uploadedFile.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB maximum limit.');
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setError('The selected spreadsheet contains no sheets.');
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        setError('The uploaded file does not contain any data rows.');
        return;
      }

      // Map rows into standardized member payload
      const parsed = [];
      for (const row of rawRows) {
        const mapped = {};
        for (const [key, value] of Object.entries(row)) {
          const norm = normalizeKey(key);
          const val = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

          if (norm.includes('name') && !norm.includes('business')) {
            mapped.name = val;
          } else if (norm.includes('businessname') || norm === 'business' || norm.includes('company')) {
            mapped.business = val;
          } else if (norm.includes('businesstype') || norm === 'type') {
            mapped.businessType = val || 'Retailer';
          } else if (norm.includes('mobile') || norm.includes('phone') || norm.includes('contact')) {
            mapped.mobile = val.replace(/\D/g, '').slice(-10);
          } else if (norm.includes('email') || norm.includes('mail')) {
            mapped.email = val;
          } else if (norm.includes('city')) {
            mapped.city = val || 'Ahmedabad';
          } else if (norm.includes('address')) {
            mapped.address = val;
          } else if (norm.includes('membershipid') || norm.includes('cardnumber') || norm.includes('memid')) {
            mapped.membershipId = val;
          } else if (norm.includes('status')) {
            mapped.status = val.toLowerCase() === 'rejected' ? 'rejected' : 'approved';
          } else if (norm.includes('joined') || norm.includes('date')) {
            mapped.joinedOn = val;
          }
        }

        // Must have at least a Name or Business to be valid
        if (mapped.name || mapped.business) {
          if (!mapped.name && mapped.business) mapped.name = mapped.business;
          if (!mapped.business && mapped.name) mapped.business = `${mapped.name} Jewellers`;
          if (!mapped.mobile) mapped.mobile = '9876543210';
          if (!mapped.city) mapped.city = 'Ahmedabad';
          if (!mapped.businessType) mapped.businessType = 'Retailer';
          if (!mapped.status) mapped.status = 'approved';

          parsed.push(mapped);
        }
      }

      if (parsed.length === 0) {
        setError('No valid member records found. Please ensure column headers match the sample template.');
        return;
      }

      setFile(uploadedFile);
      setParsedMembers(parsed);
      setError('');
    } catch (err) {
      console.error('Failed to parse file:', err);
      setError('Failed to parse spreadsheet. Please ensure the file is not corrupted.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedMembers([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit and bulk import
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || parsedMembers.length === 0) {
      setError('Please select a valid CSV or Excel file first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await bulkImportMembers(parsedMembers);
      const importedCount = result?.importedCount ?? parsedMembers.length;

      showToast(`Successfully imported ${importedCount} member${importedCount === 1 ? '' : 's'}!`, 'success');

      if (onImportSuccess) {
        onImportSuccess(result);
      }
      handleClose();
    } catch (err) {
      console.error('Error importing members:', err);
      const msg = err.message || 'Failed to import members. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title=""
      onClose={handleClose}
      maxWidth="max-w-xl"
      headerBorder={false}
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="p-6 sm:p-8">
        {/* Modal Top Header matching reference image */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Import Members
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Upload CSV or Excel file to bulk import member records.
            </p>
          </div>

          {/* Close button with circular soft background */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-ink transition cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Template Notification Box matching reference image */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-[#F5F8FF] p-4 sm:p-4.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Document Icon Box */}
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-blue-200/80 text-[#3F4BC4] shadow-2xs">
              <FileSpreadsheet className="h-5 w-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-ink">
                Need the format?
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Download sample template file with all member details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-[#3F4BC4] hover:bg-blue-50/70 hover:border-blue-300 transition shadow-2xs cursor-pointer shrink-0"
          >
            Download Sample
          </button>
        </div>

        {/* Error notification banner if any */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-600 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="members-import-file-input"
        />

        {/* Drag & Drop Upload Container */}
        <div className="mt-5">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all',
                isDragging
                  ? 'border-brand-500 bg-[#EEF2FF]'
                  : 'border-[#D4DEFE] bg-[#F8FAFC] hover:border-brand-400 hover:bg-[#F5F8FF]'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload CSV or Excel file"
            >
              {/* Upload Icon Box matching reference image */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-blue-100 text-[#3F4BC4] shadow-xs group-hover:-translate-y-0.5 transition-transform">
                <Upload className="h-5 w-5 stroke-[2.2]" />
              </div>

              <p className="mt-3.5 text-xs sm:text-sm font-bold text-ink">
                Click to browse <span className="font-normal text-slate-500">or drag & drop file</span>
              </p>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                CSV, XLSX, or XLS (Max size 15MB)
              </p>
            </div>
          ) : (
            /* Selected File Preview Box */
            <div className="rounded-2xl sm:rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-emerald-200 text-emerald-600 shadow-xs">
                    <FileSpreadsheet className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB •{' '}
                      <span className="font-semibold text-emerald-600">
                        {parsedMembers.length} valid member record{parsedMembers.length === 1 ? '' : 's'} ready
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove file"
                  aria-label="Remove file"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Ready message */}
              <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3.5 py-1.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Ready to import into database</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions matching reference image */}
        <div className="mt-7 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-7 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-ink transition cursor-pointer text-center justify-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || parsedMembers.length === 0 || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3F4BC4] to-[#5060E6] px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Importing records...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 stroke-[2.2]" />
                <span>Upload & Import</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
