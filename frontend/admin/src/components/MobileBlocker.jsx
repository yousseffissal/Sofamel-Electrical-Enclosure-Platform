import { useEffect, useState } from "react";

function MobileBlocker({ children }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1500);

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <>
            {children}

            {isMobile && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center p-6">
                    <div className="text-5xl mb-4">💻</div>
                    <h1 className="text-xl font-bold">Desktop Required</h1>
                    <p className="text-gray-500 mt-2">
                        Please use a computer for better experience<br />
                        and zoom out if the screen looks too big.
                    </p>
                </div>
            )}
        </>
    );
}

export default MobileBlocker;