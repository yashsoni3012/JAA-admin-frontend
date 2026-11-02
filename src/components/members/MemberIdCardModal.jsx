'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import MemberIdCard from '@/components/members/MemberIdCard';
import { getMemberById } from '@/services/admin.service';

export default function MemberIdCardModal({
  open,
  member,
  onClose,
}) {
  const [activeMember, setActiveMember] = useState(member);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveMember(member);
    if (open && member?.id) {
      let isMounted = true;
      setLoading(true);
      getMemberById(member.id)
        .then((fresh) => {
          if (isMounted && fresh) {
            setActiveMember(fresh);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [open, member]);

  const current = activeMember || member;
  const isApproved = String(current?.status || '').toLowerCase() === 'approved';

  if (!open || !member || !isApproved) return null;

  return (
    <Modal
      open={open}
      title="Member ID Card"
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerClassName="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 md:px-8 md:pt-7"
      bodyClassName="px-3 sm:px-6 py-3 sm:py-4 md:px-8 md:py-6"
    >
      <div className="space-y-4 sm:space-y-6">
        {loading && !activeMember?.idCard?.qrCode ? (
          <div className="flex justify-center py-12">
            <Loader label="Loading member card..." />
          </div>
        ) : (
          <MemberIdCard member={activeMember || member} />
        )}

        <div className="flex justify-end pt-3 sm:pt-4 border-t border-slate-100 no-print">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full px-6 py-2.5 text-sm font-semibold justify-center"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

