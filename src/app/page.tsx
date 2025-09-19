import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StemBot - Privacy-First AI STEM Tutoring',
  description: 'Master mathematics, science, and programming with AI tutoring that keeps your data private. Built for Dutch STEM education.',
};

export default function HomePage() {
  return (
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
            AI STEM Tutoring That<br />
            <span style={{color: '#2563eb'}}>Respects Your Privacy</span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Master mathematics, science, and programming with personalized AI tutoring.
            All processing happens locally—your learning conversations never leave your device.
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
              Start Learning Free
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
              Learn More
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
            <span style={{color: '#581c87', fontWeight: '600'}}>100% Private • Local AI Processing • GDPR Compliant</span>
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
              Why Choose StemBot?
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto'}}>
              Unlike other AI tutoring platforms, we put your privacy first while delivering
              personalized STEM education.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px'}}>
            {/* Privacy First */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🔒</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Privacy First</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                All AI processing happens locally on your device. No conversations sent to external servers.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Local Ollama AI processing</div>
                <div>• GDPR compliant</div>
                <div>• No data mining</div>
              </div>
            </div>

            {/* Adaptive Learning */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🎯</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Adaptive Learning</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                Step-by-step guidance that adapts to your learning style and pace.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Socratic questioning method</div>
                <div>• Personalized difficulty</div>
                <div>• Context-aware hints</div>
              </div>
            </div>

            {/* Dutch Education */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🇳🇱</div>
              <h3 style={{fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px'}}>Dutch Education</h3>
              <p style={{color: '#6b7280', marginBottom: '16px'}}>
                Aligned with Dutch national curriculum standards and teaching methods.
              </p>
              <div style={{fontSize: '14px', color: '#6b7280', textAlign: 'left'}}>
                <div>• Dutch/English support</div>
                <div>• VWO/HAVO alignment</div>
                <div>• Cultural context</div>
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
              Master Every STEM Subject
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280'}}>
              From basic algebra to advanced programming, get personalized tutoring across all STEM fields.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px'}}>
            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>📐</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px'}}>Mathematics</h3>
              <p style={{color: '#3730a3', marginBottom: '16px'}}>
                Algebra, geometry, calculus, statistics, and more with step-by-step solutions.
              </p>
              <div style={{fontSize: '14px', color: '#2563eb', textAlign: 'left'}}>
                <div>Quadratic equations</div>
                <div>Trigonometry</div>
                <div>Differential calculus</div>
                <div>Linear algebra</div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#dcfce7',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>⚗️</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '12px'}}>Science</h3>
              <p style={{color: '#15803d', marginBottom: '16px'}}>
                Physics, chemistry, and biology with interactive explanations and lab support.
              </p>
              <div style={{fontSize: '14px', color: '#16a34a', textAlign: 'left'}}>
                <div>Chemical reactions</div>
                <div>Physics problems</div>
                <div>Biology concepts</div>
                <div>Lab procedures</div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#f3e8ff',
              borderRadius: '12px',
              border: '1px solid #c084fc'
            }}>
              <div style={{fontSize: '64px', marginBottom: '16px'}}>💻</div>
              <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#6b21a8', marginBottom: '12px'}}>Programming</h3>
              <p style={{color: '#7c3aed', marginBottom: '16px'}}>
                Python, JavaScript, Java, and more with code debugging and project guidance.
              </p>
              <div style={{fontSize: '14px', color: '#8b5cf6', textAlign: 'left'}}>
                <div>Algorithm design</div>
                <div>Code debugging</div>
                <div>Data structures</div>
                <div>Web development</div>
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
  );
}