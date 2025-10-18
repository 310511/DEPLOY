import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-5">
      <div className="w-full px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg mb-4">HotelRBS</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted partner for finding perfect accommodations across Saudi Arabia and beyond. We connect travelers with exceptional stays worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Booking</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/destinations" className="text-muted-foreground hover:text-primary transition-colors">Browse Destinations</Link></li>
              <li><Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors">Special Offers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Group Bookings</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Corporate Travel</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Gift Cards</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Customer Service</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Booking Changes</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Cancellation Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Travel Insurance</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Press & Media</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Partner with Us</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Investor Relations</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-4 pt-2">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>&copy; 2025 HotelRBS, Inc.</p>
              <div className="flex items-center space-x-4">
                <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
                <span>·</span>
                <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
                <span>·</span>
                <Link to="#" className="hover:text-primary transition-colors">Sitemap</Link>
                <span>·</span>
                <Link to="#" className="hover:text-primary transition-colors">Company Details</Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>🌍 English (US)</span>
                <span>$ USD</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.994 1.488-1.994.703 0 1.042.219 1.042 1.219 0 .738-.469 1.844-.711 2.871-.203.855.428 1.55 1.270 1.55 1.524 0 2.687-1.615 2.687-3.955 0-2.057-1.47-3.49-3.597-3.49-2.459 0-3.909 1.844-3.909 3.490 0 .691.263 1.438.593 1.843a.327.327 0 0 1 .078.315c-.085.355-.273 1.109-.309 1.264-.047.2-.155.243-.359.146-1.357-.629-2.207-2.606-2.207-4.184 0-3.407 2.474-6.531 7.154-6.531 3.756 0 6.672 2.679 6.672 6.258 0 3.729-2.347 6.73-5.604 6.73-1.094 0-2.124-.57-2.476-1.321 0 0-.540 2.051-.672 2.56-.243.931-.900 2.098-1.338 2.804C7.717 22.849 9.813 23.019 12.017 23.019c6.624 0 11.990-5.367 11.990-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;