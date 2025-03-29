export default function AboutPage() {
    return (
      <div>
        <main style={{
          backgroundColor: '#fff',
          color: '#000',
          padding: '2rem',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '1.5rem',
            color: '#c00',
          }}>
            About Spark! Bytes
          </h1>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Spark! Bytes was created to address two important issues in the Boston University community:
              reducing food waste from campus events and connecting students with free food opportunities.
            </p>
          </section>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#c00', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Event organizers at BU can post when they have excess food from their events. 
              Students and faculty can browse these postings to find available food near them.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Our platform helps reduce food waste while ensuring that no student goes hungry due to financial constraints.
            </p>
          </section>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Authors</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Akemi</h3>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Pavana</h3>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Anh</h3>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Eva</h3>
              </div>
            </div>
          </section>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Join Us</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Sign up with your BU email to start posting events or finding free food opportunities around campus.
              Together, we can build a more sustainable and supportive campus community.
            </p>
          </section>
          
          <section>
            <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Contact</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              Have questions or suggestions? Reach out to us at <a href="mailto:sparkbytes@bu.edu" style={{ color: '#c00' }}>sparkbytes@bu.edu</a>
            </p>
          </section>
        </main>
      </div>
    );
  }