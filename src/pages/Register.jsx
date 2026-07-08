import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { DASHBOARD_URL, LOGIN_URL } from '../routes/route_constants';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'listener';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
    address: '',
    role: initialRole
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate(DASHBOARD_URL);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(' '));
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h1><UserPlus size={32} color="var(--primary)" /> Join Mosique</h1>
          <p>Sign up for free to start listening.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. mozart123"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>What should we call you?</label>
            <input
              type="text"
              className="form-control"
              placeholder="Display Name"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your physical address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@domain.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Create a password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="min 4 chars"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>How will you use Mosique?</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="listener">I want to listen to music (Listener)</option>
              <option value="artist">I want to upload music (Artist)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to={LOGIN_URL}>Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
