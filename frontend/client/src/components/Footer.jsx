import { Link } from "react-router-dom";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { IoFlash } from "react-icons/io5";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            className="relative border-t border-gray-800/60 overflow-hidden"
            style={{ background: "#0D1117" }}
        >
            {/* subtle background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(245,158,11,0.08), transparent 60%)",
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
                            </div>

                            <div>
                                <p className="text-white font-semibold tracking-wide uppercase text-sm">
                                    Sofamel
                                </p>
                                <p className="text-amber-400 text-[10px] uppercase tracking-[0.2em]">
                                    Configurator
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            A modern industrial platform for designing, configuring and managing electrical cabinets
                            with real-time quotation and order tracking.
                        </p>

                        <div className="flex items-center gap-2 text-amber-400 text-xs">
                            <IoFlash size={14} />
                            Smart Electrical Engineering Platform
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h3 className="text-white text-sm font-semibold">Quick Links</h3>

                        <div className="flex flex-col gap-2 text-sm">
                            {[
                                { label: "New Configuration", to: "/app/new" },
                                { label: "My Configurations", to: "/app/configurations" },
                                { label: "My Orders", to: "/app/orders" },
                            ].map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    className="text-gray-500 hover:text-amber-400 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-white text-sm font-semibold">Contact</h3>

                        <div className="space-y-3 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <MdLocationOn className="text-amber-400" />
                                Zone industrielle Moulay Rachid,
                                Al Khalidia 4, Rue 5 N°10,
                                Casablanca, Maroc.
                            </div>

                            <div className="flex items-center gap-2">
                                <MdEmail className="text-amber-400" />
                                sofamel@sofamel.ma
                            </div>

                            <div className="flex items-center gap-2">
                                <MdPhone className="text-amber-400" />
                                +212 522 718 832
                            </div>
                        </div>
                    </div>
                </div>

                {/* bottom bar */}
                <div className="mt-10 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-600">
                        © {year} Sofamel. All rights reserved.
                    </p>

                    <div className="flex items-center gap-5 text-xs text-gray-600">
                        <Link to="/privacy" className="hover:text-gray-300 transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="hover:text-gray-300 transition-colors">
                            Terms
                        </Link>
                        <Link to="/support" className="hover:text-gray-300 transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}