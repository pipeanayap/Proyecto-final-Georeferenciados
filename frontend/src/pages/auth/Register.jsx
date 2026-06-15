import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authRegister(data);
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <h1 style={styles.title}>UrbanReport</h1>
        </div>
        <p style={styles.subtitle}>Crear cuenta de ciudadano</p>
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre completo</label>
            <input
              {...register('name', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              placeholder="Juan García" style={styles.input}
            />
            {errors.name && <span style={styles.err}>{errors.name.message}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              {...register('email', { required: 'Requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' } })}
              type="email" placeholder="tu@correo.com" style={styles.input}
            />
            {errors.email && <span style={styles.err}>{errors.email.message}</span>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Teléfono (opcional)</label>
            <input {...register('phone')} type="tel" placeholder="+52 55 1234 5678" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              {...register('password', { required: 'Requerido', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              type="password" placeholder="••••••" style={styles.input}
            />
            {errors.password && <span style={styles.err}>{errors.password.message}</span>}
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p style={styles.footer}>
          ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión</Link>
        </p>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
        body { margin: 0; background: #0e0e0e; }
        input::placeholder { color: #555; }
        input:focus, textarea:focus, select:focus { border-color: #f5a623 !important; outline: none; box-shadow: 0 0 0 3px rgba(245,166,35,0.15); }
        button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        button { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e0e', padding: '20px' },
  card: { background: 'rgba(28, 28, 30, 0.95)', padding: '44px 40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,.5)', width: '100%', maxWidth: '440px', backdropFilter: 'blur(20px)' },
  logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' },
  title: { textAlign: 'center', margin: 0, fontSize: '1.7rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { textAlign: 'center', color: '#8e8e93', marginBottom: '32px', fontSize: '0.95rem', fontWeight: 400 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#d1d1d6', letterSpacing: '0.3px' },
  input: { padding: '13px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn: { padding: '14px', background: 'linear-gradient(135deg, #f5a623 0%, #e8930c 100%)', color: '#0e0e0e', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '6px', letterSpacing: '0.3px' },
  err: { color: '#ff6b6b', fontSize: '0.78rem' },
  footer: { textAlign: 'center', marginTop: '24px', color: '#8e8e93', fontSize: '0.9rem' },
  link: { color: '#f5a623', fontWeight: 600, textDecoration: 'none' },
};
