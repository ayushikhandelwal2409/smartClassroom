import React, { useState } from "react";
import { AlertTriangle, Camera, Search } from "lucide-react";
import { useEffect } from "react";
import api from "../api/axios";

const LostFound = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: null
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchImage, setSearchImage] = useState(null);

  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("report");


  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const fetchItems = async () => {
        try {
          const res = await api.get("/api/lostfound/all");
          setResults(res.data);
        } catch (err) {
          console.error(err);
        }
    };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("image", form.image);

    try {
      const res = await api.post("/api/lostfound/add", fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Lost item added successfully!");
      fetchItems();  // refresh all items
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

    useEffect(() => {
      fetchItems();
    }, []);



  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow space-y-6 h-full max-h-[calc(100vh-7rem)] overflow-y-auto"
      style={{ 
                    scrollbarWidth: "none",
              }}
    >

      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="text-yellow-600 w-6 h-6" />
        <h2 className="text-2xl font-bold">Lost & Found</h2>
      </div>

      {/* Dropdown */}
      <div className="mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="report">Report Lost Item</option>
          <option value="search">Search Lost Item</option>
        </select>
      </div>

      {/* Report Lost Item */}
      {mode === "report" && (
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        {/* <h3 className="text-lg font-semibold mb-3">Report a Lost Item</h3> */}

        <form className="space-y-3" onSubmit={handleFormSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Item Name (e.g., Black Bag)"
            className="w-full p-3 border rounded-lg"
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            placeholder="Where did you lose it?"
            className="w-full p-3 border rounded-lg"
            onChange={handleInputChange}
            required
          ></textarea>

          <label className="flex items-center space-x-2 p-3 border bg-white rounded-lg cursor-pointer">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>{form.image ? form.image.name : "Upload Image"}</span>
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
      )}

      {/* Search Section */}
      {mode === "search" && (
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        {/* <h3 className="text-lg font-semibold mb-3">Search Lost Items</h3> */}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search by name or description"
            value={searchQuery}
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer bg-white">
            <Camera className="w-5 h-5 text-purple-600" />
            <span>{searchImage ? searchImage.name : "Upload Image"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSearchImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={async () => {
              // If user entered text
              if (searchQuery.trim() !== "") {
                try {
                  const res = await api.post("/api/lostfound/search", { query: searchQuery });
                  setResults(res.data);
                } catch (err) {
                  console.error(err);
                }
              }
              // Otherwise use image search
              else if (searchImage) {
                try {
                  const fd = new FormData();
                  fd.append("image", searchImage);

                  const res = await api.post("/api/lostfound/search-image", fd, {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  });

                  setResults(res.data);
                } catch (err) {
                  console.error(err);
                }
              }
              else {
                alert("Please enter a text or upload an image");
              }
            }}
            className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" /> Search
          </button>
        </div>
      </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-3">Reported Items</h3>

        {results.length === 0 ? (
          <p className="text-gray-500">No results yet.</p>
        ) : (
          <div className="max-h-[40vh] sm:max-h-[55vh] overflow-y-auto pr-2" 
            style={{ 
                    scrollbarWidth: "none",
                  }}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border rounded-xl shadow hover:shadow-lg transition flex flex-col"
                >
                  <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={r?.item?.image_url ? `${import.meta.env.VITE_API_URL}/${r.item.image_url}` : `https://via.placeholder.com/400x300?text=No+Image`}
                      className="w-full h-40 sm:h-48 md:h-40 object-cover"
                      alt={r?.item?.title || 'lost item'}
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 flex-1">
                    <h4 className="font-bold text-sm sm:text-base">{r?.item?.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{r?.item?.description}</p>
                  </div>

                  {/* <p className="text-xs text-blue-600 mt-2">
                    🔍 Match: {Number(r.score || 0).toFixed(3)}
                  </p> */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LostFound;
