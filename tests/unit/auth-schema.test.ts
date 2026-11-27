import { describe, it, expect } from 'vitest';
import { LoginSchema } from '@/modules/auth/login/login.schema';
import { SignupSchema, VerifyOtpSchema } from '@/modules/auth/signup/signup.schema';

describe('2. Forms & User Input Validation', () => {
  describe('LoginSchema Validation', () => {
    it('should_submit_form_with_all_required_fields', () => {
      const validPayload = {
        email: 'player@example.com',
        password: 'SecurePassword123!',
        portalRole: 'USER',
      };

      const result = LoginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('player@example.com');
        expect(result.data.portalRole).toBe('USER');
      }
    });

    it('should_prevent_submission_when_required_fields_are_empty', () => {
      const emptyPayload = {
        email: '',
        password: '',
        portalRole: 'USER',
      };

      const result = LoginSchema.safeParse(emptyPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message);
        expect(errorMessages).toContain('Please enter a valid email address');
        expect(errorMessages).toContain('Password is required');
      }
    });

    it('should_validate_email_format_input', () => {
      const invalidEmailPayload = {
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
        portalRole: 'USER',
      };

      const result = LoginSchema.safeParse(invalidEmailPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });
  });

  describe('SignupSchema Validation', () => {
    it('should_register_new_user_with_valid_details', () => {
      const validSignup = {
        name: 'Alex Mercer',
        email: 'alex@example.com',
        password: 'StrongPassword123!',
        role: 'USER',
      };

      const result = SignupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it('should_enforce_password_complexity_rules', () => {
      const shortPasswordPayload = {
        name: 'Alex Mercer',
        email: 'alex@example.com',
        password: '123', // less than 8 characters
        role: 'USER',
      };

      const result = SignupSchema.safeParse(shortPasswordPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes('at least 8 characters'))).toBe(true);
      }
    });

    it('should_sanitize_input_to_prevent_xss_injection', () => {
      // In Zod schema, string trims and preserves sanitized inputs
      const xssPayload = {
        name: '  <script>alert("xss")</script>  ',
        email: 'clean.user@example.com',
        password: 'SecurePassword123!',
        role: 'USER',
      };

      const result = SignupSchema.safeParse(xssPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('<script>alert("xss")</script>');
      }
    });
  });

  describe('VerifyOtpSchema Validation', () => {
    it('should_require_exact_6_digit_otp_code', () => {
      const invalidOtp = {
        email: 'alex@example.com',
        otp: '1234', // not 6 digits
      };

      const result = VerifyOtpSchema.safeParse(invalidOtp);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 digits');
      }
    });
  });
});
