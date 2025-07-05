import SearchForm from "./search-form";

export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=800" 
          alt="Modern city skyline with apartment buildings" 
          className="w-full h-96 object-cover" 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Trouvez votre bien idéal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              L'expertise immobilière à votre service depuis 15 ans
            </p>
            
            <SearchForm heroMode />
          </div>
        </div>
      </div>
    </section>
  );
}
