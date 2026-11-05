import apiClient from '@/lib/axios';

const LOGIN_API_URL =
  process.env.NEXT_PUBLIC_LOGIN_API_URL || 'http://localhost:5000/api/admin/login';
const LOGOUT_API_URL =
  process.env.NEXT_PUBLIC_LOGOUT_API_URL || 'http://localhost:5000/api/admin/logout';
const PROFILE_API_URL =
  process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:5000/api/admin/profile';
const FORGET_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_FORGET_PASSWORD_API_URL || 'http://localhost:5000/api/admin/forget-password';
const RESET_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_RESET_PASSWORD_API_URL || 'http://localhost:5000/api/admin/reset-password';
const VERIFY_RESET_TOKEN_API_URL =
  process.env.NEXT_PUBLIC_VERIFY_RESET_TOKEN_API_URL || 'http://localhost:5000/api/admin/verify-reset-token';
const CHANGE_PASSWORD_API_URL =
  process.env.NEXT_PUBLIC_CHANGE_PASSWORD_API_URL || 'http://localhost:5000/api/admin/change-password';

export const USER_KEY = 'jaa_admin_user';
export const SESSION_KEY = 'jaa_admin_user';
export const TOKEN_KEY = 'token';

/**
 * Remove all legacy tokens and authentication keys from localStorage.
 * Cookie-based authentication stores the JWT in an HTTP-only Cookie.
 */
export function purgeLocalTokens() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('jwt');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem('jaa_demo_session');
    window.localStorage.removeItem('jaa_admin_session');
  } catch {}
}

/**
 * Admin Login: Authenticates with backend API.
 * The backend sets the JWT into an HTTP-only Cookie.
 * Frontend Axios sends withCredentials: true.
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
    purgeLocalTokens();

    const response = await apiClient.post(LOGIN_API_URL, payload, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    const user = {
      id: data.data?.id || data.data?._id,
      name: data.data?.fullName || data.data?.name || 'Admin',
      email: data.data?.email || payload.email,
      role: data.data?.role || 'Admin',
      avatar: data.data?.avatar || data.data?.profilePhoto || null,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { user };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.errors) && error.response?.data?.errors[0]?.message) ||
      error.message ||
      'Invalid email or password.';
    throw new Error(errorMsg);
  }
}

/**
 * Admin Logout: Calls backend Logout API with withCredentials: true
 * Backend clears the cookie; frontend removes local user profile state.
 */
export async function adminLogout() {
  try {
    await apiClient.post(LOGOUT_API_URL, {}, { withCredentials: true }).catch(() => {});
  } catch (err) {
    console.warn('Logout network notification notice:', err.message);
  } finally {
    purgeLocalTokens();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_KEY);
    }
  }
}

/**
 * Returns currently cached admin user profile from localStorage for immediate UI render
 */
export function getAuthSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw =
      window.localStorage.getItem(USER_KEY) ||
      window.localStorage.getItem('jaa_admin_session');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const user = parsed?.user || parsed;
    if (user && (user.email || user.name)) {
      return { user };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Verifies active cookie-based session with backend GET /api/admin/profile
 * Browser automatically sends the HTTP-only cookie with withCredentials: true.
 */
export async function verifyAuthSession() {
  try {
    const response = await apiClient.get(PROFILE_API_URL, {
      withCredentials: true,
    });

    if (response.data?.success && response.data?.data) {
      const u = response.data.data;
      const user = {
        id: u.id || u._id,
        name: u.fullName || u.name || 'Admin',
        email: u.email,
        role: u.role || 'Admin',
        avatar: u.avatar || u.profilePhoto || null,
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    }
    return null;
  } catch (err) {
    if (err.response?.status === 401) {
      purgeLocalTokens();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    return null;
  }
}

/**
 * Admin Forgot Password: Requests a password reset link/token
 */
export async function adminForgotPassword(email) {
  if (!email || !email.trim()) {
    throw new Error('Please enter your email address.');
  }

  const payload = {
    email: email.trim().toLowerCase(),
  };

  try {
    const response = await apiClient.post(FORGET_PASSWORD_API_URL, payload, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Unable to process password reset request.');
    }

    return {
      success: true,
      message: data.message || 'If an account exists with this email, a password reset link will be sent.',
      resetToken: data.resetToken || response.headers?.['x-reset-token'] || null,
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.errors) && error.response?.data?.errors[0]?.message) ||
      error.message ||
      'Unable to process password reset request.';
    throw new Error(errorMsg);
  }
}

/**
 * Admin Reset Password: Submits new password with token
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
    const response = await apiClient.post(RESET_PASSWORD_API_URL, payload, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Failed to reset password.');
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully.',
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.errors) && error.response?.data?.errors[0]?.message) ||
      error.message ||
      'Failed to reset password. The link or token may have expired.';
    throw new Error(errorMsg);
  }
}

/**
 * Admin Verify Reset Token: Look up token validity & associated email
 */
export async function adminVerifyResetToken(token) {
  if (!token) {
    return { valid: false, email: '' };
  }

  try {
    const response = await apiClient.get(
      `${VERIFY_RESET_TOKEN_API_URL}?token=${encodeURIComponent(token.trim())}`,
      { withCredentials: true }
    );

    const data = response.data;
    if (data.success) {
      return {
        valid: data.valid !== false,
        email: data.email || '',
        name: data.name || '',
      };
    }
    return {
      valid: false,
      message: data.message || 'Invalid or expired token',
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Admin Change Password: Updates password while authenticated
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

  const payload = {
    currentPassword: currentPassword.trim(),
    newPassword: newPassword.trim(),
    confirmPassword: confirmPassword.trim(),
    confirmNewPassword: confirmPassword.trim(),
  };

  try {
    const response = await apiClient.post(CHANGE_PASSWORD_API_URL, payload, {
      withCredentials: true,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Failed to change password.');
    }

    return {
      success: true,
      message: data.message || 'Password changed successfully.',
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.errors) && error.response?.data?.errors[0]?.message) ||
      error.message ||
      'Failed to change password.';
    throw new Error(errorMsg);
  }
}
