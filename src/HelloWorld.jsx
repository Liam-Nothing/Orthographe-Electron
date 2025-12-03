function HelloWorld() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '4rem',
        marginBottom: '1rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        Hello World! 👋
      </h1>
      <p style={{
        fontSize: '1.5rem',
        opacity: 0.9
      }}>
        Welcome to your Electron application
      </p>
    </div>
  )
}

export default HelloWorld

