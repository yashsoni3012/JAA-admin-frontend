const LOGIN_API_URL =
  process.env.NEXT_PUBLIC_LOGIN_API_URL || 'http://localhost:5000/api/admin/login';
const LOGOUT_API_URL =
  process.env.NEXT_PUBLIC_LOGOUT_API_URL || 'http://localhost:5000/api/admin/logout';
const FORGET_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_FORGET_PASSWORD_API_URL || 'http://localhost:5000/api/admin/forget-password';
const RESET_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_RESET_PASSWORD_API_URL || 'http://localhost:5000/api/admin/reset-password';
const CHANGE_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_CHANGE_PASSWORD_API_URL || 'http://localhost:5000/api/admin/change-password';



export const SESSION_KEY = 'jaa_admin_session';
export const TOKEN_KEY = 'token';

/**
 * Admin Login: Authenticates with http://localhost:5000/api/admin/login
 * @param {Object} credentials - { email, password }
 */
export async function adminLogin({ email, password }) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const payload = {
    email: email.trim().toLowerCase(),
    password: password.trim(),
  };

  try {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) && data.errors[0]?.message) ||
        'Invalid email or password.';
      throw new Error(errorMsg);
    }

    const token = data.token;
    const user = {
      id: data.data?.id,
      name: data.data?.fullName || data.data?.name || 'Admin',
      email: data.data?.email || payload.email,
      role: data.data?.role || 'Admin',
      avatar: data.data?.avatar || data.data?.profilePhoto || null,
    };

    const session = { user, token };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.localStorage.setItem(TOKEN_KEY, token);
      // Clean up legacy keys
      window.localStorage.removeItem('jaa_demo_session');
    }

    return session;
  } catch (error) {
    console.error('adminLogin error:', error);
    throw error;
  }
}

/**
 * Admin Logout: Notifies backend http://localhost:5000/api/admin/logout and clears session
 */
export async function adminLogout() {
  let token = null;

  if (typeof window !== 'undefined') {
    token =
      window.localStorage.getItem(TOKEN_KEY) ||
      (() => {
        try {
          const raw = window.localStorage.getItem(SESSION_KEY);
          return raw ? JSON.parse(raw)?.token : null;
        } catch {
          return null;
        }
      })();
  }

  try {
    if (token) {
      await fetch(LOGOUT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      }).catch((err) => {
        console.warn('Backend logout notification warning:', err.message);
      });
    }
  } catch (err) {
    console.warn('Logout network error:', err);
  } finally {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem('jwt');
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('jaa_demo_session');
    }
  }
}

/**
 * Returns current authenticated admin session from localStorage
 */
export function getAuthSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.user && (parsed?.token || window.localStorage.getItem(TOKEN_KEY))) {
      return {
        user: parsed.user,
        token: parsed.token || window.localStorage.getItem(TOKEN_KEY),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Admin Forgot Password: Requests a password reset link/token
 * @param {string} email
 */
export async function adminForgotPassword(email) {
  if (!email || !email.trim()) {
    throw new Error('Please enter your email address.');
  }

  const payload = {
    email: email.trim().toLowerCase(),
  };

  try {
    const response = await fetch(FORGET_PASSWORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) && data.errors[0]?.message) ||
        'Unable to process password reset request.';
      throw new Error(errorMsg);
    }

    const resetToken = data.resetToken || response.headers.get('x-reset-token') || null;

    return {
      success: true,
      message: data.message || 'If an account exists with this email, a password reset link will be sent.',
      resetToken,
    };
  } catch (error) {
    console.error('adminForgotPassword error:', error);
    throw error;
  }
}

/**
 * Admin Reset Password: Submits new password with token
 * @param {Object} params - { token, newPassword, confirmPassword, email }
 */
export async function adminResetPassword({ token, newPassword, confirmPassword, email }) {
  if (!token) {
    throw new Error('Reset token is required.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New password and confirm password do not match.');
  }

  const payload = {
    token: token.trim(),
    newPassword,
    confirmPassword,
    email: email ? email.trim().toLowerCase() : undefined,
  };

  try {
    const response = await fetch(RESET_PASSWORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) && data.errors[0]?.message) ||
        'Failed to reset password. The link or token may have expired.';
      throw new Error(errorMsg);
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully.',
    };
  } catch (error) {
    console.error('adminResetPassword error:', error);
    throw error;
  }
}

/**
 * Admin Change Password: Updates password while authenticated
 * Endpoint: POST http://localhost:5000/api/admin/change-password
 * @param {Object} params - { currentPassword, newPassword, confirmPassword }
 */
export async function adminChangePassword({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) {
    throw new Error('Current password is required.');
  }
  if (!newPassword) {
    throw new Error('New password is required.');
  }
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New password and confirm password do not match.');
  }

  let token = null;
  if (typeof window !== 'undefined') {
    token =
      window.localStorage.getItem(TOKEN_KEY) ||
      (() => {
        try {
          const raw = window.localStorage.getItem(SESSION_KEY);
          return raw ? JSON.parse(raw)?.token : null;
        } catch {
          return null;
        }
      })();
  }

  const payload = {
    currentPassword: currentPassword.trim(),
    newPassword: newPassword.trim(),
    confirmPassword: confirmPassword.trim(),
    confirmNewPassword: confirmPassword.trim(),
  };

  try {
    const response = await fetch(CHANGE_PASSWORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) && data.errors[0]?.message) ||
        'Failed to change password.';
      throw new Error(errorMsg);
    }

    return {
      success: true,
      message: data.message || 'Password changed successfully.',
    };
  } catch (error) {
    console.error('adminChangePassword error:', error);
    throw error;
  }
}


