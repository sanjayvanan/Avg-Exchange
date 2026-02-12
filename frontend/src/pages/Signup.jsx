import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { signupUser } from '../features/authSlice'
import { authStyles as s } from '../components/AuthStyles'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(signupUser({ email, password }))
  }

  return (
    <div className={s.wrapper}>
      <form className={s.formCard} onSubmit={handleSubmit}>
        <h3 className={s.title}>Create Account</h3>
        
        <div className="mb-4">
          <label className={s.label}>Email address</label>
          <input 
            type="email" 
            className={s.input}
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="mb-2">
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
      </form>
    </div>
  )
}

export default Signup