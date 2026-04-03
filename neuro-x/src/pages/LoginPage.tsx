import React from 'react';
import LoginForm from '../components/LoginForm.js';
import { User } from '../types/index.js';

interface LoginPageProps {
  onLogin: (user: User, token: string, shiftId: number) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return <LoginForm onLogin={onLogin} />;
}
