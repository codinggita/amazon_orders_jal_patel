import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-amazon-orange glow-orange inline-block">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Page not found</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
