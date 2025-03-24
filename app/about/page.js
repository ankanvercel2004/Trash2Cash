export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
      <main className="container mx-auto px-6 py-16">
        <div className="bg-white rounded-lg shadow-lg p-10">
          <h1 className="text-5xl font-extrabold text-center text-green-700 mb-6">
            About Trash2Cash
          </h1>
          <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Trash2Cash is a revolutionary platform that transforms unwanted
            trash into cash. Our mission is to create a seamless recycling
            experience that benefits both the environment and the community.
          </p>

          <div className="border-t border-gray-200 my-8"></div>

          <h2 className="text-3xl font-bold text-center text-green-700 mb-4">
            Developed By
          </h2>
          <p className="text-xl text-center text-gray-600 mb-10">
            Four dedicated students of HITK
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-6 text-center shadow hover:shadow-md transition">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-200 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-700">AD</span>
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Ankan Das
              </h3>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center shadow hover:shadow-md transition">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-200 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-700">AN</span>
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Arka Nandi
              </h3>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center shadow hover:shadow-md transition">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-200 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-700">SS</span>
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Subham Singh
              </h3>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center shadow hover:shadow-md transition">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-200 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-700">SG</span>
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Soumili Ghosh
              </h3>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white shadow py-6">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Trash to Cash. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
