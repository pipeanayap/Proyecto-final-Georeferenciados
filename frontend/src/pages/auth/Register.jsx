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
        <h1 style={styles.title}>🏙️ UrbanReport</h1>
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
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p style={styles.footer}>
          ¿Ya tienes cuenta? <Link to="/login" style={styles.link}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  card: { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: '100%', maxWidth: '420px' },
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
