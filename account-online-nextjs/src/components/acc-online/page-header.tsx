import LanguageSwitcher from "@/components/shared/common/language-switcher";

export const PageHeader = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src="/app/CP-bank-Logo.png"
                        alt="Bank Logo"
                        className="h-9 sm:h-11 w-auto object-contain"
                    />
                </div>
                <LanguageSwitcher variant="flag-only" />
            </div>
        </div>
    );
};
