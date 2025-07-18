import { Link } from 'wouter';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-700 dark:text-gray-300">&copy; {currentYear} ConcenTribe. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">About</Link>
            <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Privacy</Link>
            <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Terms</Link>
            <Link to="/help" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
