/** Throws on purpose, to show that a broken variant falls back to the default one. */
export default function SignupCtaBroken(): never {
  throw new Error('SignupCtaBroken throws on purpose.');
}
