import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  FileQuestion,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
  Camera,
  Layers,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface StatusBannerProps {
  status: string;
  reasons: string[];
  whatWouldChange: string[];
  imageAnalysis?: {
    visible_text?: string[];
    detected_logos?: string[];
    detected_affiliations?: string[];
    visual_context?: string;
    suggested_queries?: string[];
    detected_role?: string | null;
  } | null;
  hasImage?: boolean;
  invId?: string;
  clusterCount?: number;
  candidateCount?: number;
  evidenceCount?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  reasons,
  whatWouldChange,
  imageAnalysis,
  hasImage,
  invId,
  clusterCount = 0,
  candidateCount = 1,
  evidenceCount = 0,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'STRONG_MATCH':
        return {
          title: 'STRONG MATCH',
          matchStrength: 'High Evidence Grounding',
          strengthBadge: 'VERIFIED HIGH',
          strengthColor: '#39FF88',
          color: '#39FF88',
          bg: 'rgba(57, 255, 136, 0.06)',
          border: 'rgba(57, 255, 136, 0.2)',
          shadow: '0 8px 30px -4px rgba(57, 255, 136, 0.08)',
          desc: 'High confidence identity resolution: ≥2 independent source clusters with discriminating signals verified and zero unresolved hard contradictions.',
          icon: <ShieldCheck size={28} color="#39FF88" />,
        };
      case 'POSSIBLE_MATCH':
        return {
          title: 'POSSIBLE MATCH',
          matchStrength: 'Moderate Evidence Grounding',
          strengthBadge: 'MODERATE CORROBORATION',
          strengthColor: '#38BDF8',
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.06)',
          border: 'rgba(56, 189, 248, 0.2)',
          shadow: '0 8px 30px -4px rgba(56, 189, 248, 0.08)',
          desc: 'Corroborated identity signals present across sources. Additional independent proof is recommended before definitive attribution.',
          icon: <HelpCircle size={28} color="#38BDF8" />,
        };
      case 'AMBIGUOUS':
        return {
          title: 'AMBIGUOUS (MULTI-CANDIDATE COLLISION)',
          matchStrength: 'Equivocal Grounding',
          strengthBadge: 'COLLISION DETECTED',
          strengthColor: '#FBBF24',
          color: '#FBBF24',
          bg: 'rgba(251, 191, 36, 0.06)',
          border: 'rgba(251, 191, 36, 0.2)',
          shadow: '0 8px 30px -4px rgba(251, 191, 36, 0.08)',
          desc: 'Multiple candidates match available evidence equally. Deterministic engine strictly refuses to guess without separating evidence.',
          icon: <AlertTriangle size={28} color="#FBBF24" />,
        };
      case 'INSUFFICIENT_EVIDENCE':
        return {
          title: 'INSUFFICIENT EVIDENCE (DELIBERATE OUTCOME)',
          matchStrength: 'Sparse Grounding',
          strengthBadge: 'LOW FOOTPRINT',
          strengthColor: '#6B8F76',
          color: '#6B8F76',
          bg: 'rgba(107, 143, 118, 0.06)',
          border: 'rgba(107, 143, 118, 0.15)',
          shadow: '0 8px 30px -4px rgba(107, 143, 118, 0.06)',
          desc: 'Sparse digital footprint or only weak signals observed. Zero identity hallucination or forced attribution.',
          icon: <FileQuestion size={28} color="#6B8F76" />,
        };
      case 'LIKELY_DIFFERENT':
        return {
          title: 'LIKELY DIFFERENT (HARD CONTRADICTION)',
          matchStrength: 'Conflict Detected',
          strengthBadge: 'HARD CONFLICT',
          strengthColor: '#F87171',
          color: '#F87171',
          bg: 'rgba(248, 113, 113, 0.06)',
          border: 'rgba(248, 113, 113, 0.2)',
          shadow: '0 8px 30px -4px rgba(248, 113, 113, 0.08)',
          desc: 'Hard factual contradiction detected (e.g. impossible chronological overlap or mutually exclusive institutional affiliation).',
          icon: <ShieldAlert size={28} color="#F87171" />,
        };
      default:
        return {
          title: status,
          matchStrength: 'Evaluating',
          strengthBadge: 'PENDING',
          strengthColor: '#6B8F76',
          color: '#475569',
          bg: 'rgba(100, 116, 139, 0.06)',
          border: 'rgba(100, 116, 139, 0.18)',
          shadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          desc: 'Evaluating evidence across independent clusters...',
          icon: <Clock size={28} color="#475569" />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '18px',
        padding: '24px 28px',
        marginBottom: '26px',
        boxShadow: config.shadow,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
        <div
          style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(13, 21, 16, 0.8)',
            border: `1px solid ${config.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {config.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2
              style={{
                color: config.color,
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                fontFamily: 'var(--font-mono)',
                margin: 0,
              }}
            >
              {config.title}
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(13, 21, 16, 0.8)',
                color: config.strengthColor,
                border: `1px solid ${config.border}`,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
              }}
            >
              {config.strengthBadge}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(13, 21, 16, 0.8)',
                color: '#6B8F76',
                border: '1px solid rgba(57, 255, 136, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              DECISION RULE V1 (AUDITABLE)
            </span>
          </div>

          <p style={{ color: '#A8C4B0', fontSize: '0.88rem', marginBottom: '18px', maxWidth: '920px', lineHeight: 1.5 }}>
            {config.desc}
          </p>

          {/* Match Strength & Evidence Calibration Index (Auditable Confidence Assessment) */}
          <div
            style={{
              background: 'rgba(13, 21, 16, 0.6)',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid rgba(57, 255, 136, 0.06)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#39FF88" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A8C4B0', fontFamily: 'var(--font-mono)' }}>
                  EVIDENCE STRENGTH & CALIBRATION METRICS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#3D5E47' }}>
                <Info size={13} />
                <span>Zero fake percentages (Invariant I10): Audited on verified derivation clusters</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(57, 255, 136, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(57, 255, 136, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#6B8F76', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Independent Clusters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: clusterCount >= 2 ? '#39FF88' : '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                    {clusterCount}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6B8F76' }}>
                    {clusterCount >= 2 ? '(≥ 2 req. PASS)' : '(min. 2 recommended)'}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(57, 255, 136, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(57, 255, 136, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#6B8F76', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Evidence Claims Extracted
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                    {evidenceCount}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6B8F76' }}>
                    verbatim verified
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(57, 255, 136, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(57, 255, 136, 0.06)' }}>
                <div style={{ fontSize: '0.68rem', color: '#6B8F76', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Candidate Disambiguation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: candidateCount === 1 ? '#39FF88' : '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                    {candidateCount === 1 ? 'Clear Leader' : `${candidateCount} Candidates`}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Grounding Certainty
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color={config.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: config.color }}>
                    {config.matchStrength}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Multimodal Image Analysis Banner (when photo was provided) */}
          {hasImage && (
            <div
              style={{
                background: 'rgba(13, 21, 16, 0.6)',
                borderRadius: '12px',
                padding: '14px 18px',
                border: '1px solid rgba(56, 189, 248, 0.12)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Camera size={16} color="#38BDF8" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                  MULTIMODAL VISUAL IDENTITY ANALYSIS (GEMINI VISION)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {invId && (
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(57, 255, 136, 0.15)',
                      flexShrink: 0,
                      background: '#0A0F0C',
                    }}
                  >
                    <img
                      src={`http://localhost:8000/api/v1/investigations/${invId}/image`}
                      alt="Consented reference"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '240px' }}>
                  {imageAnalysis?.visual_context && (
                    <div style={{ fontSize: '0.82rem', color: '#A8C4B0', marginBottom: '6px', lineHeight: 1.45 }}>
                      <strong style={{ color: '#E8F5EC' }}>Visual Context:</strong> {imageAnalysis.visual_context}
                    </div>
                  )}

                  {imageAnalysis?.visible_text && imageAnalysis.visible_text.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#6B8F76', fontWeight: 600 }}>Detected Badge/Text:</span>
                      {imageAnalysis.visible_text.map((txt, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(56, 189, 248, 0.08)',
                            color: '#38BDF8',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            border: '1px solid rgba(56, 189, 248, 0.18)',
                          }}
                        >
                          {txt}
                        </span>
                      ))}
                    </div>
                  )}

                  {imageAnalysis?.detected_logos && imageAnalysis.detected_logos.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#6B8F76', fontWeight: 600 }}>Identified Logos/Emblems:</span>
                      {imageAnalysis.detected_logos.map((logo, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(57, 255, 136, 0.06)',
                            color: '#8FFFC0',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            border: '1px solid rgba(57, 255, 136, 0.14)',
                          }}
                        >
                          {logo}
                        </span>
                      ))}
                    </div>
                  )}

                  {imageAnalysis?.suggested_queries && imageAnalysis.suggested_queries.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <Search size={13} color="#6B8F76" />
                      <span style={{ fontSize: '0.72rem', color: '#6B8F76', fontWeight: 600 }}>Visual Search Criteria Executed:</span>
                      {imageAnalysis.suggested_queries.slice(0, 3).map((q, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.68rem',
                            background: 'rgba(57, 255, 136, 0.04)',
                            color: '#A8C4B0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            border: '1px solid rgba(57, 255, 136, 0.08)',
                          }}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Why this status was assigned */}
            <div
              style={{
                background: 'rgba(13, 21, 16, 0.6)',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(57, 255, 136, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#6B8F76',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  marginBottom: '10px',
                }}
              >
                <Info size={14} color="#39FF88" />
                <span>Why this status was assigned</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#A8C4B0', margin: 0, lineHeight: 1.6 }}>
                {reasons && reasons.length > 0 ? (
                  reasons.map((r, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {r}
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#3D5E47' }}>No specific reasons recorded.</li>
                )}
              </ul>
            </div>

            {/* What would change this assessment */}
            <div
              style={{
                background: 'rgba(13, 21, 16, 0.6)',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(57, 255, 136, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#39FF88',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={14} color="#39FF88" />
                <span>What would change this assessment</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#A8C4B0', margin: 0, lineHeight: 1.6 }}>
                {whatWouldChange && whatWouldChange.length > 0 ? (
                  whatWouldChange.map((w, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {w}
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#3D5E47' }}>Continuous evidence monitoring active.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};