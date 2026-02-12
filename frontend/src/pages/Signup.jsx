import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { signupUser } from '../features/authSlice'
import { authStyles as s } from '../components/AuthStyles'
// Import the video file
import BitcoinVideo from '../assets/Bitcoin_spinning.mp4'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [videoLoaded, setVideoLoaded] = useState(false)
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(signupUser({ email, password }))
  }

  return (
    <div className={s.wrapper}>
      {/* Left Side - Video & Branding */}
      <div className={s.leftSection}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className={s.videoBg}
          onLoadedData={() => {
            setVideoLoaded(true)
            console.log('Video loaded successfully')
          }}
          onError={(e) => {
            console.error('Video error:', e)
            console.error('Video source:', BitcoinVideo)
          }}
        >
          <source src={BitcoinVideo} type="video/mp4" />
        </video>
        
        {/* Fallback background while video loads */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D68F]/10 via-[#0a0b0d] to-[#00bd7e]/10 animate-pulse" />
        )}
        
        <div className={s.overlay} />
        
        <div className={s.textContent}>
          <h1 className={s.heroTitle}>Start Your <br /> Journey Today.</h1>
          <p className={s.heroSubtitle}>
            Join millions of users buying and selling crypto on the most secure exchange platform.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className={s.rightSection}>
        <div className={s.formContainer}>
          <div className={s.header}>
            <h2 className={s.title}>Create Account</h2>
            <p className={s.subTitle}>Sign up to start trading in minutes.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={s.inputGroup}>
              <label className={s.label}>Email Address</label>
              <input 
                type="email" 
                className={s.input}
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                placeholder="name@example.com"
                required
              />
            </div>

            <div className={s.inputGroup}>
              <label className={s.label}>Password</label>
              <input 
                type="password" 
                className={s.input}
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                placeholder="Choose a strong password"
                required
              />
            </div>

            <button disabled={isLoading} className={s.submitBtn}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            {error && <div className={s.errorBox}>{error}</div>}

            <div className={s.footerText}>
              Already have an account? 
              <Link to="/login" className={s.link}>Log In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup