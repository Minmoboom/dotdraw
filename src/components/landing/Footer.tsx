import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/signup" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Inspiration */}
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60 uppercase tracking-wider">
              Inspiration
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm opacity-80">Showcase</span>
              </li>
              <li>
                <span className="text-sm opacity-80">Discover</span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold mb-4 opacity-60 uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm opacity-80">Docs</span>
              </li>
              <li>
                <span className="text-sm opacity-80">Privacy</span>
              </li>
              <li>
                <span className="text-sm opacity-80">Terms</span>
              </li>
              <li>
                <span className="text-sm opacity-80">Refund</span>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-[#1a1a1a] text-xs font-bold">D</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                DotDraw
              </span>
            </div>
            <p className="text-xs opacity-50 leading-relaxed">
              AI design agent by greenblue-emerge Co., Ltd.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-xs opacity-40 text-center">
            &copy; {new Date().getFullYear()} DotDraw.art. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
