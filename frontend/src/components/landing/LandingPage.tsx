import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Layers,
  Scale,
  Lock,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { DemoScenario } from '../../api/client';

export interface LandingPageProps {
  scenarios: DemoScenario[];
  onLaunchWorkspace: (scenarioId?: string) => void;
  onExploreComponents: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  scenarios,
  onLaunchWorkspace,
  onExploreComponents,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>

      {/* Hero Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '72px 20px 20px',
          maxWidth: '1080px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(57, 255, 136, 0.05)',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            padding: '6px 16px',
            borderRadius: '9999px',
            marginBottom: '28px',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#39FF88',
              boxShadow: '0 0 8px rgba(57, 255, 136, 0.6)',
              animation: 'pulse-dot 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#8FFFC0', fontFamily: 'var(--font-mono)' }}>
            NEURAX HACKATHON 3.0 • DOMAIN 3: AI IN CYBERSECURITY
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            color: '#E8F5EC',
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            marginBottom: '22px',
            maxWidth: '900px',
          }}
        >
          Evidence-First Digital{' '}
          <span style={{ color: '#39FF88' }}>Identity Intelligence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            color: '#6B8F76',
            maxWidth: '760px',
            lineHeight: 1.65,
            marginBottom: '40px',
          }}
        >
          TRACEID analyzes consented imagery and authorized public evidence to discover, correlate, and verify digital identities. It decides whether public evidence is sufficient—
          <strong style={{ color: '#A8C4B0' }}>insufficient evidence is a first-class outcome</strong>, never a hallucinated match.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={16} />}
            onClick={() => onLaunchWorkspace('scenario-a-strong-match')}
          >
            Launch Investigation Workspace
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={<Layers size={16} />}
            onClick={onExploreComponents}
            style={{ color: '#8FFFC0' }}
          >
            Explore Design System
          </Button>
        </motion.div>

        {/* Value Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            width: '100%',
            maxWidth: '840px',
            marginTop: '56px',
          }}
        >
          {[
            { label: 'Source Independence', val: 'D9 Layered Method', sub: 'Collapses syndicated copycats' },
            { label: 'Decision Engine', val: '100% Deterministic', sub: 'LLM never decides final status' },
            { label: 'Uncertainty Model', val: 'Zero Hallucinations', sub: 'Insufficient evidence is valid' },
            { label: 'Privacy Standard', val: 'Invariant I8 Gate', sub: 'Auditable consent before search' },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(13, 21, 16, 0.85)',
                border: '1px solid rgba(57, 255, 136, 0.08)',
                borderRadius: '14px',
                padding: '18px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.66rem', color: '#3D5E47', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#E8F5EC', margin: '6px 0 4px' }}>
                {m.val}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B8F76' }}>
                {m.sub}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Live Platform Preview */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div
          style={{
            background: 'rgba(13, 21, 16, 0.9)',
            border: '1px solid rgba(57, 255, 136, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(57, 255, 136, 0.1)',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#39FF88',
                }}
              >
                <Shield size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.0rem', fontWeight: 700, color: '#E8F5EC', margin: 0 }}>
                  Live Platform Preview: Dr. Aarav Mehta (Scenario A)
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#6B8F76', margin: 0 }}>
                  Real-time execution: 3 independent clusters, 2 discriminating signals, 0 contradictions.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              iconRight={<ChevronRight size={14} />}
              onClick={() => onLaunchWorkspace('scenario-a-strong-match')}
            >
              Open in Workspace
            </Button>
          </div>

          {/* Mini Status Card */}
          <div
            style={{
              background: 'rgba(57, 255, 136, 0.05)',
              border: '1px solid rgba(57, 255, 136, 0.15)',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(57, 255, 136, 0.08)',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#39FF88',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#39FF88', margin: 0, fontFamily: 'var(--font-mono)' }}>
                    STRONG MATCH
                  </h4>
                  <Badge variant="verified">DECISION RULE V1</Badge>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#A8C4B0', margin: '3px 0 0 0' }}>
                  High-confidence attribution verified across 3 independent institutional clusters.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge variant="discriminating">2 DISCRIMINATING SIGNALS</Badge>
              <Badge variant="corroborating">3 INDEPENDENT CLUSTERS</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="corroborating">ARCHITECTURAL EXCELLENCE</Badge>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#E8F5EC', letterSpacing: '-0.02em', marginTop: '12px', marginBottom: 0 }}>
            Why TRACEID Differs from Generic OSINT Tools
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#6B8F76', maxWidth: '680px', margin: '10px auto 0' }}>
            Built specifically to solve false matches, syndicate mirror poisoning, and black-box probability guesses in identity intelligence.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              icon: <Layers size={20} />,
              iconColor: '#38BDF8',
              iconBg: 'rgba(56, 189, 248, 0.08)',
              title: 'Layered Source Independence (D9)',
              desc: 'Scrapers count URLs; TRACEID counts origin clusters. When Source A publishes and 10 scrapers replicate the bio, minhash shingling detects derivation and grants only one confirmation.',
            },
            {
              icon: <Scale size={20} />,
              iconColor: '#39FF88',
              iconBg: 'rgba(57, 255, 136, 0.07)',
              title: 'Deterministic Core Rules (I9)',
              desc: 'AI agents extract structured facts and propose hypotheses, but the verdict is strictly deterministic. Mathematical thresholds prevent hallucinated attributions.',
            },
            {
              icon: <Lock size={20} />,
              iconColor: '#8FFFC0',
              iconBg: 'rgba(57, 255, 136, 0.06)',
              title: 'Mandatory Consent Gate (I8)',
              desc: 'Zero unauthorized scraping or dark-web searches. Every investigation requires documented consenter identity and investigation scope. Images are retained strictly for the case lifetime.',
            },
            {
              icon: <AlertTriangle size={20} />,
              iconColor: '#FBBF24',
              iconBg: 'rgba(251, 191, 36, 0.07)',
              title: 'Contradiction Search Before Status',
              desc: 'Impossible timelines or mutually exclusive physical locations trigger hard contradictions, mandating LIKELY DIFFERENT unless officially resolved.',
            },
            {
              icon: <FileQuestion size={20} />,
              iconColor: '#A8C4B0',
              iconBg: 'rgba(168, 196, 176, 0.07)',
              title: 'Interpretable 3-Column Matrix (D7)',
              desc: 'No arbitrary confidence percentages (e.g. "87% match"). Evidence is clearly partitioned into Supporting, Contradicting, and Unresolved claims.',
            },
            {
              icon: <Bot size={20} />,
              iconColor: '#38BDF8',
              iconBg: 'rgba(56, 189, 248, 0.07)',
              title: 'Grounded Evidence Copilot',
              desc: 'An interactive analyst assistant that answers questions citing exact evidence IDs. It strictly enforces privacy policy and refuses requests seeking private PII.',
            },
          ].map((item, i) => (
            <Card key={i} variant="standard" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: item.iconBg,
                  border: `1px solid ${item.iconColor}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.iconColor,
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#E8F5EC', margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B8F76', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4-Stage Pipeline */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
        }}
      >
        <Card variant="elevated" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Badge variant="verified">AUDITABLE PIPELINE</Badge>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E8F5EC', margin: '12px 0 0', letterSpacing: '-0.02em' }}>
              How TRACEID Processes Evidence
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B8F76', marginTop: '8px' }}>
              A deterministic, bounded loop from consented ingestion to auditable attribution.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                num: '01',
                title: 'Consented Ingestion',
                desc: 'Invariant I8 consent verification and image visible-context OCR extraction (D2).',
              },
              {
                num: '02',
                title: 'Multi-Source Discovery',
                desc: 'Targeted adapter queries against authorized public and synthetic domains.',
              },
              {
                num: '03',
                title: 'Independence & Resolution',
                desc: 'MinHash clustering of copies (D9), followed by entity linkage and contradiction checks.',
              },
              {
                num: '04',
                title: 'Deterministic Verdict',
                desc: 'Auditable rule engine sets 1 of 5 discrete statuses with justification proofs.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(13, 21, 16, 0.6)',
                  border: '1px solid rgba(57, 255, 136, 0.07)',
                  borderRadius: '14px',
                  padding: '22px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#39FF88', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#E8F5EC', margin: 0 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#6B8F76', lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Demo Scenarios */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Badge variant="corroborating">DEMO SUITE (3–5 MIN REPLAY)</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E8F5EC', margin: '12px 0 0', letterSpacing: '-0.02em' }}>
            Explore Verified Case Scenarios
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6B8F76', marginTop: '8px' }}>
            Click any scenario below to immediately launch its live state in the Investigation Workspace.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {scenarios.map((scen) => {
            const statusColorMap: Record<string, string> = {
              'STRONG_MATCH': '#39FF88',
              'POSSIBLE_MATCH': '#38BDF8',
              'AMBIGUOUS': '#FBBF24',
              'INSUFFICIENT_EVIDENCE': '#6B8F76',
              'LIKELY_DIFFERENT': '#F87171',
            };
            const badgeMap: Record<string, 'verified' | 'corroborating' | 'status-ambiguous' | 'weak' | 'flagged'> = {
              'STRONG_MATCH': 'verified',
              'POSSIBLE_MATCH': 'corroborating',
              'AMBIGUOUS': 'status-ambiguous',
              'INSUFFICIENT_EVIDENCE': 'weak',
              'LIKELY_DIFFERENT': 'flagged',
            };
            const sc = statusColorMap[scen.expected_status] || '#6B8F76';

            return (
              <Card
                key={scen.id}
                variant="interactive"
                onClick={() => onLaunchWorkspace(scen.id)}
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'pointer',
                  borderLeft: `2px solid ${sc}33`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Badge variant={badgeMap[scen.expected_status] || 'weak'}>
                    {scen.expected_status}
                  </Badge>
                  <span style={{ fontSize: '0.68rem', color: '#3D5E47', fontFamily: 'var(--font-mono)' }}>
                    {scen.id}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#E8F5EC', margin: 0 }}>
                  {scen.name}
                </h4>

                <p style={{ fontSize: '0.8rem', color: '#6B8F76', lineHeight: 1.5, margin: 0 }}>
                  {scen.description}
                </p>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.76rem',
                    color: sc,
                    fontWeight: 600,
                  }}
                >
                  <Zap size={12} />
                  <span>Launch in Workspace</span>
                  <ChevronRight size={13} />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(57, 255, 136, 0.06)',
          background: 'rgba(6, 10, 8, 0.8)',
          padding: '36px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(57, 255, 136, 0.08)',
                border: '1px solid rgba(57, 255, 136, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#39FF88',
              }}
            >
              <Shield size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8F5EC' }}>
                TRACEID Intelligence Platform
              </div>
              <p style={{ fontSize: '0.7rem', color: '#3D5E47', margin: 0, fontFamily: 'var(--font-mono)' }}>
                NEURAX Hackathon 3.0 • Domain 3 (AI in Cybersecurity)
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#3D5E47', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            <p style={{ margin: 0 }}>
              Strictly Public & Authorized Synthetic Data • No Private PII Scraping • EXIF Stripped
            </p>
            <p style={{ margin: '2px 0 0' }}>
              Built for Checkpoint 1–3 Evaluation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};