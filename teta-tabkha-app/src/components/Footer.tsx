const Footer = () => {
  return (
    <footer className="bg-brand-clay text-brand-white p-4 text-center font-comicNeue">
      <div className="container mx-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} Teta Tab5a. All rights reserved.</p>
        <div className="mt-2 text-sm">
          <a href="/submit-recipe" className="hover:text-brand-flour hover:underline mr-4">
            Submit Your Teta’s Recipe
          </a>
          <a href="/faq" className="hover:text-brand-flour hover:underline">
            FAQ (Why No Microwave?)
          </a>
        </div>
        {/* Placeholder for social links */}
      </div>
    </footer>
  );
};

export default Footer;
