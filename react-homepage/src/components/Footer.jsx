export default function Footer() {
    return (
        <footer>
            <div className="cb">
                {/* Link columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3">

                    <div className="px-8 md:px-12 py-12 border-r-faint border-b-faint border-t-faint sm:border-b-0">
                        <h4 className="funnel-kicker mb-6">Product</h4>
                        <ul className="space-y-3">
                            <li><a href="/pricing" className="funnel-body-sm hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="/compare" className="funnel-body-sm hover:text-white transition-colors">Compare</a></li>
                            <li><a href="/docs" className="funnel-body-sm hover:text-white transition-colors">Docs</a></li>
                            <li><a href="/faq" className="funnel-body-sm hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="px-8 md:px-12 py-12 border-b-faint border-r-faint border-t-faint sm:border-b-0">
                        <h4 className="funnel-kicker mb-6">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="/about" className="funnel-body-sm hover:text-white transition-colors">About</a></li>
                            <li><a href="/contact" className="funnel-body-sm hover:text-white transition-colors">Contact</a></li>
                            <li><a href="/is-this-safe" className="funnel-body-sm hover:text-white transition-colors">Security</a></li>
                        </ul>
                    </div>

                    <div className="px-8 md:px-12 py-12 col-span-2 sm:col-span-1 border-t-faint">
                        <h4 className="funnel-kicker mb-6">Legal</h4>
                        <ul className="space-y-3">
                            <li><a href="/terms" className="funnel-body-sm hover:text-white transition-colors">Terms</a></li>
                            <li><a href="/privacy" className="funnel-body-sm hover:text-white transition-colors">Privacy</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="px-8 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-faint">
                    <p className="funnel-body-sm" style={{ color: '#374151' }}>
                        &copy; {new Date().getFullYear()} Clouded Basement. All rights reserved.
                    </p>
                    <a href="/is-this-safe" className="funnel-body-sm text-blue-400/50 hover:text-blue-400 transition-colors">
                        Is Clouded Basement safe? →
                    </a>
                </div>

            </div>
        </footer>
    );
}
