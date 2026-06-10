import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏙️ UrbanReport</h1>
        <p style={styles.subtitle}>Iniciar sesión</p>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
              type="email" placeholder="tu@correo.com" style={styles.input}
            />
            {errors.email && <span style={styles.err}>{errors.email.message}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              {...register('password', { required: 'Requerido' })}
              type="password" placeholder="••••••" style={styles.input}
            />
            {errors.password && <span style={styles.err}>{errors.password.message}</span>}
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={styles.footer}>
          ¿No tienes cuenta? <Link to="/register" style={styles.link}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  card: { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', margin: '0 0 4px', fontSize: '1.6rem', color: '#1e293b' },
  subtitle: { textAlign: 'center', color: '#64748b', marginBottom: '28px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.88rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  btn: { padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
  err: { color: '#ef4444', fontSize: '0.78rem' },
  footer: { textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.9rem' },
  link: { color: '#3b82f6', fontWeight: 600 },
};
