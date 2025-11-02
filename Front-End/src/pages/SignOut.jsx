import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignOut = () => {
  const [isSigningOut, setIsSigningOut] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate sign out process
    const signOutTimer = setTimeout(() => {
      setIsSigningOut(false);
      // TODO: Implement actual sign out logic here
      // Clear user session, tokens, etc.
      console.log('User signed out');
      
      // Redirect to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 1500);

    return () => clearTimeout(signOutTimer);
  }, [navigate]);

  if (isSigningOut) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-indigo-600"></div>
              <span className="text-xl font-semibold">StudyPlan</span>
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Signing you out...</h1>
          <p className="text-gray-400">Please wait while we securely sign you out</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded bg-indigo-600"></div>
            <span className="text-xl font-semibold">StudyPlan</span>
          </div>
          
          {/* Success icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">You've been signed out</h1>
          <p className="text-gray-400">Thanks for using StudyPlan. You've been successfully signed out of your account.</p>
        </div>

        {/* Action buttons */}
        <div className="bg-white/5 border border-white/10 backdrop-blur rounded-xl p-8">
          <div className="space-y-4">
            <Link
              to="/signin"
              className="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors inline-block"
            >
              Sign in again
            </Link>
            
            <Link
              to="/"
              className="w-full px-6 py-3 rounded-lg border border-white/10 text-gray-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors inline-block"
            >
              Go to homepage
            </Link>
          </div>
          
          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-4">
              Your study plans and progress have been saved. Sign back in anytime to continue learning.
            </p>
            <div className="text-xs text-gray-500">
              <p>• All local data remains secure</p>
              <p>• Your study plans are still accessible</p>
              <p>• Session tokens have been cleared</p>
            </div>
          </div>
        </div>
        
        {/* Auto redirect notice */}
        <div className="mt-6 text-sm text-gray-400">
          You'll be redirected to the homepage automatically...
        </div>
      </div>
    </div>
  );
};

export default SignOut;
