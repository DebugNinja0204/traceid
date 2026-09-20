import React, { useState } from 'react';
import { Upload, Lock, AlertTriangle, UserPlus } from 'lucide-react';
import { api } from '../api/client';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (investigationId: string) => void;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [event, setEvent] = useState('');
  const [consenter, setConsenter] = useState('');
  const [scope, setScope] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Investigation Title is required.');
      return;
    }
    if (!consentChecked || !consenter.trim() || !scope.trim()) {
      setError('Consent verification is mandatory before processing (I8). Consenter name and scope must be explicitly provided.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append(
        'context',
        JSON.stringify({
          name: name.trim() || 'Unknown Subject',
          institution: institution.trim(),
          event: event.trim(),
        })
      );
      formData.append('consent_consenter', consenter.trim());
      formData.append('consent_scope', scope.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createInvestigation(formData);
      // Run pipeline
      await api.runPipeline(res.investigation_id);
      onCreated(res.investigation_id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Investigation Case"
      subtitle="Mandatory Consent Gate (I8) · Strictly Authorized Public & Synthetic Sources"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        {/* Case Title & Basic Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Case Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Keynote Speaker Identity Verification"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jane Doe"
            />
            <Input
              label="Institution / Org"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University"
            />
          </div>

          <Input
            label="Event / Authorized Context"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="e.g. NEURAX Hackathon 2026 Keynote"
          />
        </div>

        {/* Image Upload Dropzone */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              fontFamily: 'var(--font-sans)',
              marginBottom: '6px',
            }}
          >
            Consented Reference Image (OCR & Reference Only - D2)
          </label>
          <div
            style={{
              border: '1px dashed rgba(0, 0, 0, 0.16)',
              borderRadius: '10px',
              padding: '16px',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={18} color="#0284c7" />
              <div>
                <p style={{ fontSize: '0.82rem', color: '#0f172a', margin: 0, fontWeight: 500 }}>
                  {imageFile ? imageFile.name : 'Select or drop consented reference photo'}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  EXIF stripped immediately; no open-web face scraping (D2).
                </p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              style={{ display: 'none' }}
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="image-upload"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              Browse
            </label>
          </div>
        </div>

        {/* Mandatory Consent Gate Box (I8) */}
        <div
          style={{
            background: 'rgba(2, 132, 199, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.22)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="#0284c7" />
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0284c7',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Mandatory Consent Verification Gate (Invariant I8)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Consenter Name *"
              value={consenter}
              onChange={(e) => setConsenter(e.target.value)}
              placeholder="e.g. Subject Self / Authorized Investigator"
              required
            />
            <Input
              label="Authorized Investigation Scope *"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. Keynote speaker identity verification"
              required
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#334155',
              cursor: 'pointer',
              userSelect: 'none',
              marginTop: '4px',
              lineHeight: 1.45,
            }}
          >
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#0284c7' }}
            />
            <span>
              I certify under penalty of policy violation that explicit, auditable consent was obtained for this search. Processing public/authorized synthetic sandbox sources only.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={<UserPlus size={15} />}
          >
            Initialize Case & Execute Pipeline
          </Button>
        </div>
      </form>
    </Modal>
  );
};