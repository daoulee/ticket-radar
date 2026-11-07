export const PASSWORD_RULE_MESSAGE = '비밀번호는 8자 이상, 영문 대문자·소문자와 특수문자를 각각 1개 이상 포함해 주세요.';

export function isValidNewPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 200
    && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[^A-Za-z0-9\s]/.test(value);
}
