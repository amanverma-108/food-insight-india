export const Footer = () => (
  <footer className="border-t border-border bg-card px-4 py-10">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
      <div>
        <span className="font-bold text-foreground">Food<span className="text-primary">Insight</span></span>
        <p className="mt-1 max-w-xs">Helping you make smarter, healthier food choices every day.</p>
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-primary transition-colors">About</a>
        <a href="#" className="hover:text-primary transition-colors">Contact</a>
        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
      </div>
    </div>
    <p className="mt-6 text-center text-xs text-muted-foreground">© 2026 FoodInsight. All rights reserved.</p>
  </footer>
);
