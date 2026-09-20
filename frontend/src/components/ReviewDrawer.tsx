import React, { useState } from 'react';
import { Scale, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, History } from 'lucide-react';
import { api, ReviewAction } from '../api/client';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Badge } from './ui/Badge';

interface ReviewDrawerProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'CLAIM' | 'CANDIDATE';
  targetId?: string;
  reviews: ReviewAction[];
  onReviewSubmitted: (newStatus: string) => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  investigationId,
  isOpen,
  onClose,
  targetType: initialTargetType = 'CLAIM',
  targetId: initialTargetId = '',
  reviews,
  onReviewSubmitted,
}) => {
  const [actionType, setActionType] = useState<'CONFIRM' | 'REJECT'>('CONFIRM');
  const [targetType, setTargetType] = useState<'CLAIM' | 'CANDIDATE'>(initialTargetType);
  const [targetId, setTargetId] = useState(initialTargetId);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A mandatory reason is required for all human review actions (I11).');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitReview(investigationId, actionType, targetType, targetId, reason);
      setReason('');
      onReviewSubmitted(res.new_status);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Review submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Human Review & Audit (I11)"
      subtitle="Insert-Only Audit Trail · Never Deletes Raw Evidence"
      icon={
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Scale size={18} color="#7c3aed" />
        </div>
      }
      width="520px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#e11d48',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Review Action Submission Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                marginBottom: '8px',
              }}
            >
              Action Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Button
                type="button"
                variant={actionType === 'CONFIRM' ? 'primary' : 'secondary'}
                icon={<CheckCircle2 size={15} color={actionType === 'CONFIRM' ? '#ffffff' : '#059669'} />}
                onClick={() => setActionType('CONFIRM')}
                style={{
                  background: actionType === 'CONFIRM' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : undefined,
                  borderColor: actionType === 'CONFIRM' ? '#059669' : undefined,
                }}
              >
                CONFIRM
              </Button>
              <Button
                type="button"
                variant={actionType === 'REJECT' ? 'destructive' : 'secondary'}
                icon={<XCircle size={15} color={actionType === 'REJECT' ? '#ffffff' : '#e11d48'} />}
                onClick={() => setActionType('REJECT')}
                style={{
                  background: actionType === 'REJECT' ? 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)' : undefined,
                  color: actionType === 'REJECT' ? '#ffffff' : undefined,
                }}
              >
                REJECT
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '6px',
                }}
              >
                Target Type
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                }}
              >
                <option value="CLAIM">CLAIM</option>
                <option value="CANDIDATE">CANDIDATE</option>
              </select>
            </div>

            <div>
              <Input
                label="Target ID"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="e.g. claim-12 or candidate id"
              />
            </div>
          </div>

          <div>
            <Textarea
              label="Mandatory Reason / Justification"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State verified institutional verification or evidence justification..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            icon={<ShieldCheck size={16} />}
          >
            Submit Auditable Human Verdict
          </Button>
        </form>

        {/* Audit History Log */}
        <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <History size={16} color="#64748b" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Review Audit Trail ({reviews.length})
            </h4>
          </div>

          {reviews.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              Zero human interventions logged yet for this case. Deterministic core decisions currently active.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge variant={rev.action_type === 'CONFIRM' ? 'verified' : 'flagged'}>
                        {rev.action_type}
                      </Badge>
                      <span style={{ fontSize: '0.74rem', color: '#0284c7', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {rev.target_type}: {rev.target_id.substring(0, 10)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {new Date(rev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    {rev.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};