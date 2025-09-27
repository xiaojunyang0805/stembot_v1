'use client';

import { useAuth } from '../providers/AuthProvider';

function HeaderNavigation() {
  const { user, loading } = useAuth();

  // Clean production version

  if (loading) {
    return (
      <div style={{display: 'flex', gap: '16px'}}>
        <div style={{
          width: '80px',
          height: '36px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px'
        }}></div>
        <div style={{
          width: '100px',
          height: '36px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px'
        }}></div>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{display: 'flex', gap: '16px'}}>
        <a href="/dashboard" style={{
          color: '#6b7280',
          textDecoration: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }}>
          Dashboard
        </a>
        <a href="/auth/logout" style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          Sign Out
        </a>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', gap: '16px'}}>
      <a href="/auth/login" style={{
        color: '#6b7280',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        transition: 'background-color 0.2s'
      }}>
        Sign In
      </a>
      <a href="/auth/register" style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '500'
      }}>
        Get Started
      </a>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <div style={{minHeight: '100vh', backgroundColor: '#f8fafc'}}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb',
            margin: 0
          }}>
            StemBot
          </h1>
          <HeaderNavigation />
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)',
        padding: '80px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
AI Research Mentor That<br />
            <span style={{color: '#2563eb'}}>Guides Your Academic Journey</span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            From question formation to publication, get continuous AI mentoring for your research projects.
            Memory-driven guidance that learns and grows with your academic work.
          </p>

          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px'}}>
            <a href="/auth/register" style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Start Your Research Journey
            </a>
            <a href="#features" style={{
              backgroundColor: 'white',
              color: '#2563eb',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              border: '2px solid #2563eb',
              fontSize: '16px'
            }}>
              Explore Features
            </a>
          </div>

          {/* Privacy Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f5f3ff',
            border: '1px solid #c4b5fd',
            borderRadius: '24px',
            padding: '12px 24px'
          }}>
            <span style={{fontSize: '20px', color: '#7c3aed', marginRight: '8px'}}>🔒</span>
            <span style={{color: '#581c87', fontWeight: '600'}}>Memory-Driven • AI-Powered • Continuous Mentoring</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{padding: '80px 24px', backgroundColor: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '64px'}}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Why Choose StemBot for Research?
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto'}}>
              Unlike traditional research tools, we provide continuous AI mentoring that remembers
              your entire research journey and guides you at every step.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px'}}>
            {/* Memory-Driven Mentoring */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🧠</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Memory-Driven Mentoring</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                AI that remembers your entire research journey, providing contextual guidance based on your project history.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Persistent project memory</div>
                <div>• Contextual recommendations</div>
                <div>• Session continuity</div>
              </div>
            </div>

            {/* Complete Research Pipeline */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🔬</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Complete Research Pipeline</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                From question formation to publication - guided support through every research phase.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Literature review assistance</div>
                <div>• Methodology design</div>
                <div>• Writing & publication support</div>
              </div>
            </div>

            {/* Academic Standards */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🎓</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Academic Excellence</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                Built for university-level research with academic rigor and scholarly standards.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Academic citation standards</div>
                <div>• Research methodology expertise</div>
                <div>• Peer review preparation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section style={{padding: '80px 24px', backgroundColor: '#f8fafc'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '64px'}}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Guided Through Every Research Stage
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280'}}>
              From initial question formation to final publication, get expert AI mentoring at each critical research phase.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px'}}>
            {/* Question Formation */}
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>❓</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px'}}>Question Formation</h3>
              <p style={{color: '#3730a3', marginBottom: '16px'}}>
                Define compelling research questions that are feasible, significant, and answerable.
              </p>
              <div style={{fontSize: '14px', color: '#2563eb', textAlign: 'left'}}>
                <div>Research gap identification</div>
                <div>Question refinement</div>
                <div>Scope definition</div>
                <div>Feasibility assessment</div>
              </div>
            </div>

            {/* Literature Review */}
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#dcfce7',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>📚</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '12px'}}>Literature Review</h3>
              <p style={{color: '#15803d', marginBottom: '16px'}}>
                Comprehensive analysis of existing research with AI-powered search and synthesis.
              </p>
              <div style={{fontSize: '14px', color: '#16a34a', textAlign: 'left'}}>
                <div>Source discovery</div>
                <div>Critical analysis</div>
                <div>Synthesis & themes</div>
                <div>Gap identification</div>
              </div>
            </div>

            {/* Methodology Design */}
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#f3e8ff',
              borderRadius: '12px',
              border: '1px solid #c084fc'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>🔬</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#6b21a8', marginBottom: '12px'}}>Methodology Design</h3>
              <p style={{color: '#7c3aed', marginBottom: '16px'}}>
                Design robust research methodologies tailored to your research questions and constraints.
              </p>
              <div style={{fontSize: '14px', color: '#8b5cf6', textAlign: 'left'}}>
                <div>Research design selection</div>
                <div>Data collection planning</div>
                <div>Analysis strategy</div>
                <div>Ethics considerations</div>
              </div>
            </div>

            {/* Writing & Publication */}
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fcd34d'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>✍️</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#b45309', marginBottom: '12px'}}>Writing & Publication</h3>
              <p style={{color: '#d97706', marginBottom: '16px'}}>
                Craft compelling academic papers with proper structure, citations, and publication readiness.
              </p>
              <div style={{fontSize: '14px', color: '#f59e0b', textAlign: 'left'}}>
                <div>Academic writing support</div>
                <div>Citation management</div>
                <div>Publication guidance</div>
                <div>Peer review prep</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        backgroundColor: '#2563eb',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            Ready to Transform Your STEM Learning?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#93c5fd',
            marginBottom: '32px'
          }}>
            Join thousands of Dutch students already using StemBot for personalized, private AI tutoring.
          </p>

          <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
            <a href="/auth/register" style={{
              backgroundColor: 'white',
              color: '#2563eb',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Start Learning Free
            </a>
          </div>

          <p style={{color: '#93c5fd', marginTop: '16px', fontSize: '14px'}}>
            No credit card required • 100% private • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '64px 24px 32px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px'}}>StemBot</h3>
          <p style={{color: '#9ca3af', marginBottom: '32px'}}>
            Privacy-first AI tutoring for Dutch STEM education.
          </p>
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '32px',
            color: '#9ca3af'
          }}>
            <p>&copy; 2024 StemBot. Made with ❤️ in the Netherlands for STEM education.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}