export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="text-center py-20 bg-green-50">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4 text-green-800">
              Transform Your Trash into Cash
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Join our platform to earn money by recycling waste in an eco-friendly way.
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition"
            >
              Get Started
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
                <h3 className="text-2xl font-bold mb-2">Easy Listing</h3>
                <p className="text-gray-600">
                  Quickly list your waste materials with simple, step-by-step guidance.
                </p>
              </div>
              <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
                <h3 className="text-2xl font-bold mb-2">Real-Time Pricing</h3>
                <p className="text-gray-600">
                  Get updated pricing for your waste to ensure you’re getting the best value.
                </p>
              </div>
              <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
                <h3 className="text-2xl font-bold mb-2">Scheduled Pickups</h3>
                <p className="text-gray-600">
                  Arrange waste collection at times that work best for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-8">
              About Trash to Cash
            </h2>
            <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
              Trash to Cash is dedicated to revolutionizing waste management by turning your unwanted trash into a profitable asset. Our platform simplifies waste listing, offers real-time pricing, and schedules pickups, ensuring a seamless experience for users and a positive impact on the environment.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white shadow mt-10">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          &copy; {new Date().getFullYear()} Trash to Cash. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
