'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, CheckCircle2, ShieldCheck, QrCode as QrIcon, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';

export default function MemberIdCard({
  member,
  showActions = true,
  className = '',
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const cardContainerRef = useRef(null);

  if (!member) return null;

  // Derive all data dynamically from API response
  const membershipId =
    member.idCard?.cardNumber || member.membershipId || `JBAD${member.id || 168}`;
  const status = (member.idCard?.status || member.status || 'Active').toUpperCase();
  const rawStatus = (member.status || '').toLowerCase();
  const isApproved = rawStatus === 'approved' || status === 'ACTIVE';
  const isPending = rawStatus === 'pending' || status === 'PENDING';
  const isRejected = rawStatus === 'rejected' || status === 'REJECTED';

  const memberSince = member.joinedOn || member.idCard?.issuedAt || member.createdAt || '28-10-2026';
  const validUntil = member.idCard?.validUntil || null;
  const qrTarget = member.idCard?.qrCode || `https://yourdomain.com/verify/${membershipId}`;

  // Generate QR code as high-resolution PNG data URL
  useEffect(() => {
    let isMounted = true;
    if (qrTarget) {
      QRCode.toDataURL(qrTarget, {
        width: 180,
        margin: 1,
        color: {
          dark: '#1B1F3B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate QR Code:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [qrTarget]);

  // Download ID Card as PDF using dynamic imports of html2canvas and jspdf
  const handleDownloadPdf = async () => {
    if (!cardContainerRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const { jsPDF } = await import('jspdf');

      const element = cardContainerRef.current;

      // Render element onto canvas at 2x scale for print sharpness
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#F8FAFC',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 170; // 170mm width on A4 page
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = (210 - imgWidth) / 2;
      const yOffset = 25;

      // Header on PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(27, 31, 59);
      pdf.text('Jewellers Association Ahmedabad', 105, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Official Member ID Card - ${membershipId}`, 105, 20, { align: 'center' });

      // Add ID Card image
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      // Footer timestamp
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-GB')} via JAA Admin Portal`, 105, 285, {
        align: 'center',
      });

      pdf.save(`JAA-Member-ID-${membershipId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback: trigger print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Action buttons (Download PDF & Print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ID Card Status:
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
                isApproved
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : isPending
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'
                )}
              />
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-brand-500 hover:text-brand-600 shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print ID Card</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleDownloadPdf}
              loading={isGeneratingPdf}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-md shadow-brand-500/25"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ID CARDS CONTAINER (Front & Back) - Printable Target */}
      <div
        id="member-id-card-printable"
        ref={cardContainerRef}
        className="flex flex-col items-center gap-8 py-2 print:py-0 print:gap-6"
      >
        {/* ========================================================= */}
        {/* CARD 1: FRONT SIDE (Exact replica of attached reference)   */}
        {/* ========================================================= */}
        <div className="w-full max-w-[480px] overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 print:border print:shadow-none">
          {/* Top Royal Blue Header */}
          <div className="bg-gradient-to-r from-[#17257D] via-[#2435A5] to-[#3649BE] px-6 py-4 flex items-center justify-between">
            {/* Left: Circle Logo & Title */}
            <div className="flex items-center gap-3.5">
              {/* White Circle with JAA in Red */}
              <div className="h-11 w-11 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-[13px] font-black italic tracking-tighter text-red-600 select-none">
                  JAA
                </span>
              </div>
              <div className="leading-tight">
                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                  Jewellers Association
                </h3>
                <p className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] text-white/85 uppercase mt-0.5">
                  AHMEDABAD
                </p>
              </div>
            </div>

            {/* Right: MEMBER Pill Badge */}
            <span className="rounded-full bg-white/20 border border-white/30 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              MEMBER
            </span>
          </div>

          {/* Main Card Body */}
          <div className="p-6 md:p-7 flex items-center gap-6">
            {/* Member Profile Photo with Red Border */}
            <div className="relative h-28 w-24 md:h-32 md:w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-[#D92D20] bg-slate-200 shadow-sm flex items-center justify-center">
              {member.avatar && !photoError ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  onError={() => setPhotoError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-slate-300 text-slate-600 font-bold text-sm tracking-wider">
                  <span>PHOTO</span>
                </div>
              )}
            </div>

            {/* Member Name, Business, Membership ID */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-tight leading-snug truncate">
                {member.name || 'Member Name'}
              </h4>
              <p className="text-sm md:text-base font-normal text-slate-500 mt-0.5 truncate">
                {member.business || 'Business Member'}
              </p>

              <div className="mt-3">
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  MEMBERSHIP ID
                </span>
                <span className="block text-2xl md:text-[28px] font-black text-[#D92D20] tracking-widest font-mono leading-tight mt-0.5">
                  {membershipId}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-white">
            <div>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                MEMBER SINCE
              </span>
              <span className="block text-sm font-bold text-[#1E293B] mt-0.5">
                {memberSince}
              </span>
            </div>

            {/* Status Indicator Badge matching design */}
            <div>
              <span
                className={cn(
                  'inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider',
                  isApproved
                    ? 'bg-[#D1FADF] text-[#027A48] border border-[#A6F4C5]'
                    : isPending
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                )}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: BACK SIDE (Exact replica of attached reference)    */}
        {/* ========================================================= */}
        <div className="w-full max-w-[480px] overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 print:border print:shadow-none">
          {/* Top Red-to-Blue Gradient Edge Strip */}
          <div className="h-2 w-full bg-gradient-to-r from-[#D92D20] via-[#8B2580] to-[#1E2B8F]" />

          {/* 2-Column Info Grid */}
          <div className="p-6 md:p-7 space-y-4">
            {/* Row 1: Mobile & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  MOBILE
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5">
                  {member.mobile || '-'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  EMAIL
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5 truncate" title={member.email}>
                  {member.email || '-'}
                </span>
              </div>
            </div>

            {/* Row 2: Business & Business Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  BUSINESS
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5 truncate" title={member.business}>
                  {member.business || '-'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  BUSINESS TYPE
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5">
                  {member.businessType || 'Retail Jeweller'}
                </span>
              </div>
            </div>

            {/* Row 3: City & Joined On */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  CITY
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5">
                  {member.city || 'Ahmedabad'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  JOINED ON
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5">
                  {memberSince}
                </span>
              </div>
            </div>

            {/* Row 4: Address + QR Code verification container */}
            <div className="grid grid-cols-[1fr_auto] gap-4 items-start pt-1">
              <div>
                <span className="block text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                  ADDRESS
                </span>
                <span className="block text-sm font-semibold text-[#1E293B] mt-0.5 leading-snug">
                  {member.address || 'Ahmedabad, Gujarat, India'}
                </span>

                {validUntil && (
                  <div className="mt-2 text-xs font-semibold text-slate-500">
                    <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">VALID UNTIL: </span>
                    <span className="text-[#1E293B] font-bold">{validUntil}</span>
                  </div>
                )}
              </div>

              {/* Dynamic QR Code from idCard.qrCode */}
              <div className="flex flex-col items-center justify-center pl-2">
                <div className="h-18 w-18 md:h-20 md:w-20 rounded-xl border border-slate-200 bg-white p-1 shadow-xs flex items-center justify-center">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Verify Membership QR" className="h-full w-full object-contain" />
                  ) : (
                    <QrIcon className="h-8 w-8 text-slate-300 animate-pulse" />
                  )}
                </div>
                <span className="text-[8px] md:text-[9px] font-bold tracking-wider text-slate-400 uppercase mt-1 text-center">
                  SCAN TO VERIFY
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section: Disclaimer + Authorised Signature */}
          <div className="border-t border-slate-100 px-6 py-4 md:px-7 flex items-center justify-between gap-4 bg-white">
            <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight max-w-[240px]">
              This card is the property of Jewellers Association Ahmedabad. If found, please return it to the association office.
            </p>

            <div className="text-center shrink-0">
              <div className="w-28 md:w-32 border-b border-slate-300 mx-auto mb-1.5" />
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase block">
                AUTHORISED SIGN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Print Stylesheet for clean Card-Only Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #member-id-card-printable,
          #member-id-card-printable * {
            visibility: visible !important;
          }
          #member-id-card-printable {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 480px !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

