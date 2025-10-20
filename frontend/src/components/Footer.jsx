import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', to: '/' },
        { name: 'About Us', to: '/about' },
        { name: 'Contact', to: '/contact' },
        { name: 'FAQ', to: '/faq' },
      ],
    },
    {
      title: 'Features',
      links: [
        { name: 'Lost & Found', to: '/lost-found' },
        { name: 'Book Bank', to: '/book-bank' },
        { name: 'Campus Connect', to: '/connect' },
        { name: 'Notice Board', to: '/noticeboard' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', to: '/privacy' },
        { name: 'Terms of Service', to: '/terms' },
        { name: 'Cookie Policy', to: '/cookies' },
        { name: 'GDPR', to: '/gdpr' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaFacebook className="h-5 w-5" />, url: 'https://facebook.com' },
    { icon: <FaTwitter className="h-5 w-5" />, url: 'https://twitter.com' },
    { icon: <FaInstagram className="h-5 w-5" />, url: 'https://instagram.com' },
    { icon: <FaLinkedin className="h-5 w-5" />, url: 'https://linkedin.com' },
    { icon: <FaGithub className="h-5 w-5" />, url: 'https://github.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-1"
          >
            <h2 className="text-2xl font-bold text-white mb-4">CampusConnect</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your one-stop platform for campus life. Connect with fellow students, find lost items,
              exchange textbooks, and make the most of your university experience.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{social.url}</span>
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="mt-8 md:mt-0"
            >
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      to={link.to}
                      className="text-base text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-white">Subscribe to our newsletter</h3>
              <p className="mt-1 text-sm text-gray-400">
                Get the latest updates, news and product offers.
              </p>
            </div>
            <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 w-full"
                required
              />
              <motion.button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Copyright and Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} CampusConnect. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
