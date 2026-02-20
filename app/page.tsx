import SignInButton from "@/app/components/SignInButton";
import Link from "next/link";

export default function Home() {
  const characters = "HELLO WORLD".split("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(168, 85, 247, 0.5),
                         0 0 20px rgba(168, 85, 247, 0.3),
                         0 0 30px rgba(168, 85, 247, 0.2);
          }
          50% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.8),
                         0 0 40px rgba(168, 85, 247, 0.6),
                         0 0 60px rgba(168, 85, 247, 0.4);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px) rotateY(90deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(0);
          }
        }
        
        @keyframes rainbow {
          0% { color: #ff0000; }
          16% { color: #ff7f00; }
          33% { color: #ffff00; }
          50% { color: #00ff00; }
          66% { color: #0000ff; }
          83% { color: #4b0082; }
          100% { color: #9400d3; }
        }
        
        .char {
          display: inline-block;
          animation: slideInLeft 0.6s ease-out forwards, float 3s ease-in-out infinite;
        }
        
        .char:nth-child(1) { animation-delay: 0s, 0s; }
        .char:nth-child(2) { animation-delay: 0.1s, 0.1s; }
        .char:nth-child(3) { animation-delay: 0.2s, 0.2s; }
        .char:nth-child(4) { animation-delay: 0.3s, 0.3s; }
        .char:nth-child(5) { animation-delay: 0.4s, 0.4s; }
        .char:nth-child(6) { animation-delay: 0.5s, 0.5s; }
        .char:nth-child(7) { animation-delay: 0.6s, 0.6s; }
        .char:nth-child(8) { animation-delay: 0.7s, 0.7s; }
        .char:nth-child(9) { animation-delay: 0.8s, 0.8s; }
        .char:nth-child(10) { animation-delay: 0.9s, 0.9s; }
        .char:nth-child(11) { animation-delay: 1s, 1s; }
        
        .hello-world {
          font-size: 7rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          animation: glow 2s ease-in-out infinite, rainbow 6s linear infinite;
          text-transform: uppercase;
          font-family: "Arial Black", sans-serif;
          perspective: 1000px;
        }
        
        .subtitle {
          animation: slideInLeft 1s ease-out 1.2s forwards;
          opacity: 0;
          color: rgba(168, 85, 247, 0.8);
          font-size: 1.25rem;
          margin-top: 2rem;
        }
      `}</style>

      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-cyan-600/20 blur-3xl" />
        
        <div className="relative z-10 text-center">
          <div className="hello-world">
            {characters.map((char, index) => (
              <span key={index} className="char">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
          
          <div className="subtitle">
            ✨ Next.js App ✨
          </div>

          <div className="mt-12 flex gap-4 justify-center">
            <SignInButton />
            <Link
              href="/data"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
            >
              View Captions
            </Link>
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
            >
              Learn Next.js
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
