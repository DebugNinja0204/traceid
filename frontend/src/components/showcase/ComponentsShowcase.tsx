import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Bot,
  Scale,
  PlusCircle,
  Search,
  Send,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input, Textarea } from '../ui/Input';
import { Tabs } from '../ui/Tabs';
import { StatusBanner } from '../StatusBanner';

export interface ComponentsShowcaseProps {
  onOpenCopilot: () => void;
  onOpenReview: () => void;
  onOpenCreateModal: () => void;
}

export const ComponentsShowcase: React.FC<ComponentsShowcaseProps> = ({
  onOpenCopilot,
  onOpenReview,
  onOpenCreateModal,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('STRONG_MATCH');
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<string>('tab1');
  const [sampleInput, setSampleInput] = useState<string>('');

  const statusDescriptions: Record<string, { reasons: string[]; whatWouldChange: string[] }> = {
    STRONG_MATCH: {
      reasons: [
        '3 independent source clusters verified (min required: 2)',
        '2 DISCRIMINATING signals verified (Faculty keynote + Institutional appointment)',
        'Zero unresolved hard contradictions found',
      ],
      whatWouldChange: [
        'Discovery of an unresolvable identity contradiction',
        'Revocation or human rejection of the primary institutional faculty claim',
      ],
    },
    POSSIBLE_MATCH: {
      reasons: [
        '1 independent cluster with corroborating employer match',
        'Bio similarity meets corroborating threshold',
      ],
      whatWouldChange: [
        'Obtain second independent confirmation cluster to reach Strong Match',
        'Discover discriminating unique authorship claim',
      ],
    },
    AMBIGUOUS: {
      reasons: [
        '2 candidate identities match available evidence equally (Candidate 1 in Bengaluru vs Candidate 2 in Pune)',
        'Separation margin is 0 (below threshold of 1 discriminating signal)',
      ],
      whatWouldChange: [
        'Find separating discriminating signal linking one candidate uniquely',
        'Human reviewer confirmation of intended subject',
      ],
    },
    INSUFFICIENT_EVIDENCE: {
      reasons: [
        'Zero candidate matches found in authorized public corpus',
        'Subject digital footprint is sparse or non-existent',
      ],
      whatWouldChange: [
        'Supply additional authorized context identifiers (institution, co-authors)',
      ],
    },
    LIKELY_DIFFERENT: {
      reasons: [
        'Hard contradiction: Impossible chronological overlap in employment dates',
        'Conflicting physical presence in two distant geographic locations simultaneously',
      ],
      whatWouldChange: [
        'Provide official evidence explaining away the chronological conflict',
      ],
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>
      {/* Header */}
      <div>
        <Badge variant="corroborating">DESIGN SYSTEM & COMPONENT SHOWCASE</Badge>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '8px 0 4px' }}>
          TRACEID Component Architecture
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '750px', margin: 0 }}>
          Modular, reusable UI primitives and cybersecurity domain widgets built on an Apple iOS-inspired light glassmorphism aesthetic.
        </p>
      </div>

      {/* 1. Buttons System */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            1. Button System
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Supports 7 variants, 5 sizes, subtle spring physics, active tap scale, loading indicators, and icon slots.
          </p>
        </div>

        {/* Variants */}
        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Variants (Size MD)
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Sizes (Primary Variant)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Button variant="primary" size="xs">Extra Small (XS)</Button>
            <Button variant="primary" size="sm">Small (SM)</Button>
            <Button variant="primary" size="md">Medium (MD)</Button>
            <Button variant="primary" size="lg">Large (LG)</Button>
            <Button variant="primary" size="icon" icon={<Sparkles size={16} />} />
          </div>
        </div>

        {/* States */}
        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            States & Micro-Interactions
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Button variant="primary" loading>Loading State</Button>
            <Button variant="secondary" disabled>Disabled State</Button>
            <Button variant="secondary" icon={<Shield size={15} color="#0284c7" />}>
              With Prefix Icon
            </Button>
            <Button variant="primary" iconRight={<Send size={14} />}>
              With Suffix Icon
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Badge & Signal Tiers */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            2. Badges & Signal Tiers
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Categorical status indicators, signal weight tiers (D7), and live dot indicators.
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Signal Tiers (D7 Interpretable Matrix)
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Badge variant="discriminating">DISCRIMINATING (HIGH WEIGHT)</Badge>
            <Badge variant="corroborating">CORROBORATING (MEDIUM WEIGHT)</Badge>
            <Badge variant="weak">WEAK (LOW WEIGHT)</Badge>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Status & Provenance Badges
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Badge variant="verified" dot>Strong Match</Badge>
            <Badge variant="corroborating" dot>Possible Match</Badge>
            <Badge variant="mirror" dot>Ambiguous Collision</Badge>
            <Badge variant="weak" dot>Insufficient Evidence</Badge>
            <Badge variant="flagged" dot>Likely Different</Badge>
            <Badge variant="origin">Cluster Origin</Badge>
            <Badge variant="mirror">Syndicate Mirror</Badge>
            <Badge variant="flagged">Prompt Injection Flag</Badge>
          </div>
        </div>
      </Card>

      {/* 3. Cards & Glass Surfaces */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            3. Card & Glass Surfaces System
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Layered translucent frosted glass panels with smooth shadows and subtle border illumination.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Card variant="standard" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Standard Card</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Base frosted white translucent panel with soft border.
            </p>
          </Card>

          <Card variant="elevated" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Elevated Card</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Prominent drop shadow and deeper glass blur.
            </p>
          </Card>

          <Card variant="interactive" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Interactive Card</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Subtle -2px hover lift and blue glow shadow.
            </p>
          </Card>

          <Card variant="metric" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Metric Card</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Gentle top-down subtle gradient wash.
            </p>
          </Card>
        </div>
      </Card>

      {/* 4. Interactive Status Banner Switcher */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            4. Status Decision Banner Sandbox
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Toggle between the 5 auditable decision statuses to see how each scenario communicates uncertainty without fake confidence percentages (I10).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['STRONG_MATCH', 'POSSIBLE_MATCH', 'AMBIGUOUS', 'INSUFFICIENT_EVIDENCE', 'LIKELY_DIFFERENT'].map((st) => (
            <Button
              key={st}
              variant={selectedStatus === st ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedStatus(st)}
            >
              {st}
            </Button>
          ))}
        </div>

        <div style={{ marginTop: '8px' }}>
          <StatusBanner
            status={selectedStatus}
            reasons={statusDescriptions[selectedStatus]?.reasons || []}
            whatWouldChange={statusDescriptions[selectedStatus]?.whatWouldChange || []}
          />
        </div>
      </Card>

      {/* 5. Inputs & Form Controls */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            5. Form Inputs & Textareas
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Light translucent input fields with clean focus rings, icon adornments, and error validation states.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Input
            label="Standard Input"
            placeholder="Type anything here..."
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            helperText="Subtle helper label below input."
          />
          <Input
            label="Input with Search Icon"
            placeholder="Search candidate records..."
            icon={<Search size={16} />}
          />
          <Input
            label="Validation Error State"
            value="invalid-format-id"
            error="Mandatory field format: claim-[0-9]+"
          />
        </div>

        <Textarea
          label="Multi-Line Reason / Justification"
          placeholder="State institutional verification reasons..."
          rows={3}
        />
      </Card>

      {/* 6. Tabs & Segmented Control */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            6. iOS Segmented Tabs
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Animated segmented pill control with Framer Motion layout transitions.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'tab1', label: 'Primary Evidence', count: 12 },
            { id: 'tab2', label: 'Candidate Clusters', count: 3 },
            { id: 'tab3', label: 'Contradiction Audit', count: 0 },
            { id: 'tab4', label: 'Dossier Narrative' },
          ]}
          activeTab={activeShowcaseTab}
          onChange={setActiveShowcaseTab}
        />
      </Card>

      {/* 7. Drawers & Modals Sandbox Triggers */}
      <Card variant="standard" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            7. Modals & Side Drawers Triggers
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Interactive triggers to test-drive the application's side drawers and modal dialogs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            icon={<Bot size={16} />}
            onClick={onOpenCopilot}
          >
            Launch Copilot Drawer
          </Button>

          <Button
            variant="secondary"
            icon={<Scale size={16} color="#7c3aed" />}
            onClick={onOpenReview}
          >
            Launch Human Review Drawer
          </Button>

          <Button
            variant="secondary"
            icon={<PlusCircle size={16} color="#0284c7" />}
            onClick={onOpenCreateModal}
          >
            Launch Mandatory Consent Modal
          </Button>
        </div>
      </Card>
    </div>
  );
};