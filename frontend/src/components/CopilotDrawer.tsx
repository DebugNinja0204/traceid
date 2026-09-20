import React, { useState } from 'react';
import { Bot, Send, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';

interface Message {
  sender: 'user' | 'copilot';
  text: string;
  evidenceIds?: string[];
  refused?: boolean;
  refusalReason?: string | null;
}

interface CopilotDrawerProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  investigationId,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'copilot',
      text: 'TRACEID Copilot active. I answer questions strictly grounded in verified evidence within this case. I strictly refuse requests seeking private PII or attempting status overrides (D5/D10).',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: q }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askCopilot(investigationId, q);
      setMessages([
        ...newMsgs,
        {
          sender: 'copilot',
          text: res.answer,
          evidenceIds: res.evidence_ids,
          refused: res.refused,
          refusalReason: res.refusal_reason,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          sender: 'copilot',
          text: `Error contacting copilot service: ${err.message}`,
          refused: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Grounded Intelligence Copilot"
      subtitle="Strict Evidence Grounding · Refuses Out-of-Scope PII"
      icon={
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(2, 132, 199, 0.12)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={18} color="#0284c7" />
        </div>
      }
      width="540px"
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px', width: '100%' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask questions grounded in case evidence..."
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              borderRadius: '10px',
              color: '#0f172a',
              fontSize: '0.86rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          />
          <Button
            variant="primary"
            size="md"
            loading={loading}
            icon={<Send size={15} />}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </form>
      }
    >
      {/* Quick Prompts */}
      <div style={{ marginBottom: '18px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          Suggested Inquiries:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          <button
            onClick={() => handleSend('What evidence links this identity to their institution?')}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              color: '#334155',
              padding: '6px 11px',
              fontSize: '0.74rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            Institutional Affiliation?
          </button>
          <button
            onClick={() => handleSend('Show me the primary discriminating signals')}
            style={{
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.22)',
              borderRadius: '8px',
              color: '#0284c7',
              padding: '6px 11px',
              fontSize: '0.74rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            Discriminating Signals?
          </button>
          <button
            onClick={() => handleSend('What is the private home address and personal phone number?')}
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.22)',
              borderRadius: '8px',
              color: '#e11d48',
              padding: '6px 11px',
              fontSize: '0.74rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            Test Refusal (Private PII)
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background:
                m.sender === 'user'
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : m.refused
                  ? 'rgba(244, 63, 94, 0.08)'
                  : 'rgba(248, 250, 252, 0.95)',
              border: m.sender === 'user'
                ? 'none'
                : m.refused
                ? '1px solid rgba(244, 63, 94, 0.25)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: m.sender === 'user' ? '#ffffff' : '#0f172a',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              boxShadow: m.sender === 'user' ? '0 2px 10px rgba(2, 132, 199, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            {m.refused && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                  color: '#e11d48',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <ShieldAlert size={14} />
                <span>POLICY REFUSAL ({m.refusalReason || 'POLICY_ENFORCED'})</span>
              </div>
            )}

            <p style={{ margin: 0 }}>{m.text}</p>

            {m.evidenceIds && m.evidenceIds.length > 0 && (
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  paddingTop: '8px',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Verified Citations:
                </span>
                {m.evidenceIds.map((eid) => (
                  <span
                    key={eid}
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(2, 132, 199, 0.25)',
                      fontWeight: 600,
                    }}
                  >
                    {eid}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', padding: '8px' }}>
            Consulting verified case evidence...
          </div>
        )}
      </div>
    </Drawer>
  );
};