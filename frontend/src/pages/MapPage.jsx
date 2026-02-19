const MapPage = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📍 D-Con Map
      </h1>

      <div className="w-full rounded-xl overflow-hidden shadow-xl border-4 border-white">
        <img
          src="/D-con Map.png"
          alt="D-Con Event Map"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default MapPage;
