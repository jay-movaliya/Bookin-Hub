import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full overflow-hidden bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('https://cdn.vectorstock.com/i/1000v/79/88/taxi-car-front-view-in-dark-background-vector-43697988.avif')" }}>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Glass-morphism forgot password container */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-96 shadow-2xl transition-all hover:shadow-3xl">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          Reset Password
        </h2>

        <p className="text-white/70 text-center mb-6">Enter your email to receive a password reset link.</p>

        <form className="space-y-6">
          {/* Email Input */}
          <div className="group relative">
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-transparent 
                       peer focus:outline-none focus:border-red-400 transition-colors"
              placeholder="Email"
            />
            <label
              htmlFor="email"
              className="absolute left-4 -top-2.5 px-1 text-white/80 text-sm transition-all
                         peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5
                         peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-red-300 bg-transparent"
            >
              Email
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-semibold
                      transform transition-all hover:scale-[1.02] hover:from-red-600 hover:to-red-700
                      active:scale-95 shadow-lg hover:shadow-red-500/20"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 flex justify-center text-sm">
          <button
            onClick={() => navigate("/riderlogin")}
            className="text-white/70 hover:text-red-300 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
