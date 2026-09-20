import React from 'react';
import { Globe, Layers, AlertOctagon, Copy, ExternalLink, Calendar, Key } from 'lucide-react';
import { ClusterItem, SourceItem } from '../api/client';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface SourcesClustersProps {
  sources: SourceItem[];
  clusters: ClusterItem[];
}

export const SourcesClusters: React.FC<SourcesClustersProps> = ({ sources, clusters }) => {
  const getReliabilityBadge = (tier: string) => {
    switch (tier) {
      case 'HIGH':
        return <Badge variant="verified" dot>HIGH TRUST</Badge>;
      case 'MEDIUM':
        return <Badge variant="corroborating" dot>MEDIUM TRUST</Badge>;
      case 'LOW':
      default:
        return <Badge variant="weak" dot>LOW TRUST</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Overview Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em', margin: 0 }}>
            Source Provenance & Independence Clusters
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Layered D9 Method: Near-duplicate syndication, mirrors, and citation chains are collapsed into single origin clusters. Status engine counts clusters, never URLs.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: '12px',
            padding: '8px 16px',
          }}
        >
          <Layers size={16} color="#0284c7" />
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 600 }}>
            {sources.length} Discovered URLs ? {clusters.length} Independent Cluster{clusters.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Sources List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sources.length === 0 ? (
          <Card variant="standard" style={{ padding: '36px', textAlign: 'center' }}>
            <Globe size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#334155', fontSize: '1rem', margin: 0 }}>No Public Sources Harvested</h4>
            <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>
              Zero authorized web pages correlated with this subject.
            </p>
          </Card>
        ) : (
          sources.map((src) => {
            const cluster = clusters.find((c) => c.id === src.cluster_id);
            const isMirror = !src.is_origin && cluster && cluster.member_count > 1;
            const hasInjectionFlag = src.injection_flags && src.injection_flags.length > 0;

            return (
              <Card
                key={src.id}
                variant="standard"
                style={{
                  border: hasInjectionFlag
                    ? '1px solid rgba(225, 29, 72, 0.35)'
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: hasInjectionFlag ? '0 4px 20px rgba(225, 29, 72, 0.08)' : '0 2px 10px rgba(15, 23, 42, 0.03)',
                  padding: '20px 24px',
                  background: '#ffffff',
                }}
              >
                {/* Source Top Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {getReliabilityBadge(src.reliability)}
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#e2e8f0' }}>
                      {src.domain}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#64748b',
                        background: 'rgba(0, 0, 0, 0.04)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {src.source_type}
                    </span>

                    {src.is_origin ? (
                      <Badge variant="origin" icon={<Key size={12} />}>
                        Cluster Origin
                      </Badge>
                    ) : isMirror ? (
                      <Badge variant="mirror" icon={<Copy size={12} />}>
                        Syndicated Copy / Mirror
                      </Badge>
                    ) : null}

                    {hasInjectionFlag && (
                      <Badge variant="flagged" icon={<AlertOctagon size={12} />}>
                        Prompt Injection Defense Active
                      </Badge>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Cluster #{src.cluster_id?.substring(0, 8)}
                  </span>
                </div>

                {/* URL and Link */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    color: '#0284c7',
                    marginBottom: '12px',
                    wordBreak: 'break-all',
                  }}
                >
                  <Globe size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#0284c7',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 500,
                    }}
                  >
                    <span>{src.url}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Provenance Box */}
                <div
                  style={{
                    background: 'rgba(248, 250, 252, 0.9)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0 }}>
                    <strong style={{ color: '#e2e8f0' }}>Reliability Provenance:</strong> {src.reliability_reason}
                  </p>
                  {isMirror && (
                    <p style={{ fontSize: '0.8rem', color: '#d97706', margin: 0, fontWeight: 500 }}>
                      ? Collapsed into origin cluster: near-duplicate content verified via minhash/shingling. Provides 0 additional independent confirmations.
                    </p>
                  )}
                  {hasInjectionFlag && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '8px 12px',
                        background: 'rgba(225, 29, 72, 0.06)',
                        borderRadius: '8px',
                        border: '1px solid rgba(225, 29, 72, 0.2)',
                      }}
                    >
                      <p style={{ fontSize: '0.8rem', color: '#e11d48', margin: 0 }}>
                        <strong>Defensive Filter (I10):</strong> Untrusted instructions detected in page body:{' '}
                        {src.injection_flags.join(', ')}. Sanitized as plain data; forbidden from orchestrator directives.
                      </p>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.74rem',
                    color: '#64748b',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '12px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={12} /> Published: {src.published_at || 'Unknown'}
                  </span>
                  <span>Retrieved: {src.retrieved_at}</span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
