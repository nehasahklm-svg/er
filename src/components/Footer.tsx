const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 sm:mt-16 border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Main Section */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold mb-2 text-foreground">Nepal Election Result Dashboard • Data for civic awareness</h3>
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong>Data Source:</strong> All election data is fetched from official Election Commission and government websites. 
            This is an independent portal not affiliated with any government agency. 
            Please verify critical information from official sources.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Election 2082. All rights reserved.
          </p>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
