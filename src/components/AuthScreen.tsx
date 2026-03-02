import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxyZWN0IHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNNDAgMEw0MCA4MCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjE1LCAwLCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxwYXRoIGQ9Ik0wIDQwTDgwIDQwIiBzdHJva2U9InJnYmEoMjU1LCAyMTUsIDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-60" />

      {/* Stars decoration */}
      <div className="absolute top-20 left-10 text-amber-500/20 text-4xl animate-pulse">★</div>
      <div className="absolute top-40 right-20 text-blue-500/20 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>★</div>
      <div className="absolute bottom-40 left-20 text-amber-500/20 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>★</div>
      <div className="absolute bottom-20 right-10 text-blue-500/20 text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>★</div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8 md:mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-700/20 rounded-2xl rotate-45 transform-gpu" />
              <div className="absolute inset-1 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-xl rotate-45 transform-gpu" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl md:text-5xl">📜</span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>✝️</div>
            <div className="absolute -bottom-1 -left-2 text-xl animate-bounce" style={{ animationDuration: '2.5s' }}>🦅</div>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 mb-3 tracking-wide">
            Divine Wisdom
          </h1>
          <p className="text-amber-200/60 font-light text-sm md:text-base tracking-wider">
            Scripture & Founding Fathers
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-gradient-to-b from-[#12121a] to-[#0d0d14] border border-amber-500/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-amber-900/10">
          <h2 className="font-serif text-xl md:text-2xl text-amber-100 text-center mb-6">
            {flow === "signIn" ? "Welcome Back" : "Join the Journey"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-200/70 text-sm mb-2 font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-amber-200/70 text-sm mb-2 font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-amber-500/20 rounded-xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : flow === "signIn" ? "Enter the Sanctuary" : "Begin Your Journey"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-amber-300/70 hover:text-amber-200 text-sm transition-colors"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0f0f17] text-amber-200/40">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full py-3 md:py-4 bg-transparent border border-amber-500/30 hover:border-amber-500/50 text-amber-200/80 hover:text-amber-100 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as Guest
          </button>
        </div>

        {/* Scripture quote */}
        <p className="mt-6 md:mt-8 text-center text-amber-200/40 text-xs md:text-sm font-serif italic px-4">
          "The fear of the LORD is the beginning of wisdom"<br />
          <span className="text-amber-200/30">— Proverbs 9:10</span>
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center">
        <p className="text-[10px] md:text-xs text-amber-200/20 font-mono tracking-wider">
          Requested by <span className="text-amber-300/30">@web-user</span> · Built by <span className="text-amber-300/30">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
