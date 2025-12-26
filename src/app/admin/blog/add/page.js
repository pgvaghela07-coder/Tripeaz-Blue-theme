"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

// Dynamically import both CKEditor and ClassicEditor together with SSR disabled
const CKEditorWrapper = dynamic(
  async () => {
    try {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic"))
      .default;

    return function EditorComponent(props) {
      return <CKEditor editor={ClassicEditor} {...props} />;
    };
    } catch (error) {
      console.error("Error loading CKEditor:", error);
      // Return a fallback component
      return function EditorComponent(props) {
        return (
          <div className="h-64 border rounded-md p-4 bg-red-50 flex items-center justify-center">
            <p className="text-red-600">Error loading editor. Please refresh the page.</p>
          </div>
        );
      };
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 border rounded-md p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading editor...</p>
      </div>
    ),
  }
);

import EditorSidebar from "@/components/editor/EditorSidebar";

export default function AddBlogPage() {
  const [data, setData] = useState({
    title: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    extra_metatag: "",
    faqs: [],
    categories: [],
    tags: [],
    scheduledAt: "",
    featuredImageAlt: "",
    status: "draft",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setloading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishChoice, setPublishChoice] = useState("routes");
  const [routeForm, setRouteForm] = useState({
    from: "",
    to: "",
    name: "",
    url: "",
  });
  const [cityForm, setCityForm] = useState({
    name: "",
    url: "",
  });
  const [airportForm, setAirportForm] = useState({
    name: "",
    from: "",
    to: "",
    url: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const addFAQ = () => {
    setData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }]
    }));
  };

  const removeFAQ = (index) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFAQ = (index, field, value) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (name === "title") {
      const slugValue = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setData((prev) => ({ ...prev, slug: slugValue }));
    }
  };

  const handlePublishClick = () => {
    setRouteForm({
      from: "",
      to: "",
      name: data.title || "",
      url: data.slug || "",
    });
    setCityForm({
      name: "",
      url: data.slug || "",
    });
    setAirportForm({
      name: data.title || "",
      from: "",
      to: "",
      url: data.slug || "",
    });
    setPublishChoice("routes");
    setShowPublishModal(true);
  };


  const saveBlogWithRoutes = async (routePayload = null, cityPayload = null, airportPayload = null, publishStatus = null) => {
    setloading(true);
    try {
      // Validate required fields
      if (!data.title || !data.title.trim()) {
        toast.error("Title is required");
        setloading(false);
        return;
      }
      if (!data.slug || !data.slug.trim()) {
        toast.error("Slug is required");
        setloading(false);
        return;
      }
      if (!data.description || !data.description.trim()) {
        toast.error("Description is required");
        setloading(false);
        return;
      }
      if (!image) {
        toast.error("Featured image is required");
        setloading(false);
        return;
      }

      // Determine status - use publishStatus if provided, otherwise use data.status
      const finalStatus = publishStatus !== null ? publishStatus : (data.status || "draft");

      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("slug", data.slug.trim());
      formData.append("description", data.description);
      formData.append("metaTitle", data.metaTitle || "");
      formData.append("metaDescription", data.metaDescription || "");
      formData.append("metaKeywords", data.metaKeywords || "");
      formData.append("extra_metatag", data.extra_metatag || "");
      formData.append("faqs", JSON.stringify(data.faqs || []));
      formData.append("categories", JSON.stringify(data.categories || []));
      formData.append("tags", JSON.stringify(data.tags || []));
      formData.append("status", finalStatus);
      if (data.scheduledAt) formData.append("scheduledAt", data.scheduledAt);
      if (data.featuredImageAlt) formData.append("featuredImageAlt", data.featuredImageAlt);
      formData.append("image", image);

      console.log("Saving blog with status:", finalStatus);

      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("Blog save response:", result);
      
      if (result.success) {
        const savedBlog = result.blog;

        if (routePayload) {
          const payload = {
            name: routePayload.name?.trim() || data.title,
            from: routePayload.from?.trim(),
            to: routePayload.to?.trim(),
            url: routePayload.url?.trim() || data.slug,
            blogId: savedBlog?._id,
          };

          if (!payload.from || !payload.to || !payload.url || !payload.name) {
            toast.error("Route details are required");
            setloading(false);
            return;
          }

          try {
            const routeRes = await fetch("/api/routes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const routeData = await routeRes.json();
            if (routeData.success) {
              toast.success("Route created from blog");
            } else {
              toast.error(routeData.message || "Blog saved but route failed");
            }
          } catch (routeError) {
            console.error("Error creating route:", routeError);
            toast.error("Blog saved but route creation failed");
          }
        }

        if (cityPayload) {
          const payload = {
            name: cityPayload.name?.trim(),
            url: cityPayload.url?.trim() || data.slug,
            blogId: savedBlog?._id,
          };

          if (!payload.name || !payload.url) {
            toast.error("City details are required");
            setloading(false);
            return;
          }

          try {
            const cityRes = await fetch("/api/cities", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const cityData = await cityRes.json();
            if (cityData.success) {
              toast.success("City created from blog");
            } else {
              toast.error(cityData.message || "Blog saved but city failed");
            }
          } catch (cityError) {
            console.error("Error creating city:", cityError);
            toast.error("Blog saved but city creation failed");
          }
        }

        if (airportPayload) {
          const payload = {
            name: airportPayload.name?.trim(),
            from: airportPayload.from?.trim(),
            to: airportPayload.to?.trim(),
            url: airportPayload.url?.trim() || data.slug,
            blogId: savedBlog?._id,
          };

          if (!payload.name || !payload.from || !payload.to || !payload.url) {
            toast.error("Airport details are required");
            setloading(false);
            return;
          }

          try {
            const airportRes = await fetch("/api/airports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const airportData = await airportRes.json();
            if (airportData.success) {
              toast.success("Airport created from blog");
            } else {
              toast.error(airportData.message || "Blog saved but airport failed");
            }
          } catch (airportError) {
            console.error("Error creating airport:", airportError);
            toast.error("Blog saved but airport creation failed");
          }
        }

        toast.success(result.message || "Blog published successfully!");
        // Reset form
        setData({
          title: "",
          slug: "",
          description: "",
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          extra_metatag: "",
          faqs: [],
          categories: [],
          tags: [],
          scheduledAt: "",
          featuredImageAlt: "",
          status: "draft",
        });
        setImage(null);
        setPreview(null);
        setShowPublishModal(false);
      } else {
        const errorMessage = result.message || result.error || "Failed to save blog";
        toast.error(errorMessage);
        console.error("Blog save failed:", result);
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Something went wrong while saving blog: " + error.message);
    } finally {
      setloading(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (publishChoice === "routes") {
      if (!routeForm.from.trim() || !routeForm.to.trim()) {
        toast.error("Please fill From and To");
        return;
      }
      await saveBlogWithRoutes(
        {
          ...routeForm,
          name: routeForm.name || data.title,
          url: routeForm.url || data.slug,
        },
        null,
        null,
        data.status || "draft"
      );
    } else if (publishChoice === "cities") {
      if (!cityForm.name.trim()) {
        toast.error("Please fill City Name");
        return;
      }
      await saveBlogWithRoutes(
        null,
        {
          ...cityForm,
          url: cityForm.url || data.slug,
        },
        null,
        data.status || "draft"
      );
    } else if (publishChoice === "airport") {
      if (!airportForm.name.trim() || !airportForm.from.trim() || !airportForm.to.trim()) {
        toast.error("Please fill Airport Name, From and To");
        return;
      }
      await saveBlogWithRoutes(
        null,
        null,
        {
          ...airportForm,
          url: airportForm.url || data.slug,
        },
        data.status || "draft"
      );
    } else {
      await saveBlogWithRoutes(null, null, null, data.status || "draft");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 dark:text-black">Add New Blog</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Form - 70% */}
        <div className="w-full lg:w-[70%]">
          <form>
            <label className="block font-semibold dark:text-black">Title</label>
            <input
              type="text"
              name="title"
              value={data.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              className="w-full border rounded-md p-2 
                       bg-white text-black placeholder-gray-500 border-gray-300 
                       dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="block font-semibold mt-3 dark:text-black">Slug</label>
            <input
              type="text"
              name="slug"
              value={data.slug}
              onChange={handleChange}
              placeholder="blog-url-slug"
              className="w-full border rounded-md p-2 
                       bg-white text-black placeholder-gray-500 border-gray-300 
                       dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="block font-semibold mt-3 dark:text-black">Description</label>
            <CKEditorWrapper
              data={data.description}
              onChange={(event, editor) => {
                const editorData = editor.getData();
                setData({ ...data, description: editorData });
              }}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "outdent",
                  "indent",
                  "|",
                  "blockQuote",
                  "insertTable",
                  "mediaEmbed",
                  "undo",
                  "redo",
                ],
              }}
            />

            <div className="border-t pt-4 mt-4">
              <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-black">FAQs</h2>
              <button
                type="button"
                onClick={addFAQ}
                className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                + Add FAQ
              </button>

              {data.faqs.map((faq, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">FAQ {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeFAQ(index)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    placeholder="Enter question..."
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, "question", e.target.value)}
                    className="w-full border rounded-md p-2 mb-2 
                         bg-white text-black border-gray-300 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <textarea
                    placeholder="Enter answer..."
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                    rows="3"
                    className="w-full border rounded-md p-2 
                         bg-white text-black border-gray-300 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}

              {data.faqs.length === 0 && (
                <p className="text-gray-500 text-sm italic">No FAQs added yet. Click "Add FAQ" to add one.</p>
              )}
            </div>


        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-black">SEO Metadata</h2>

          <label className="block font-semibold dark:text-black">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            value={data.metaTitle}
            onChange={handleChange}
            className="w-full border rounded-md p-2 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={60}
          />

          <label className="block font-semibold mt-3 dark:text-black">Meta Description</label>
          <textarea
            name="metaDescription"
            value={data.metaDescription}
            onChange={handleChange}
            className="w-full border rounded-md p-2 h-20 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={160}
          />

          <label className="block font-semibold mt-3 dark:text-black">Meta Keywords</label>
          <input
            type="text"
            name="metaKeywords"
            value={data.metaKeywords}
            onChange={handleChange}
            placeholder="travel, gujarat, tourism"
            className="w-full border rounded-md p-2 
                     bg-white text-black placeholder-gray-500 border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="block font-semibold mt-3 dark:text-black">Extra Meta-Tags</label>
          <textarea
            name="extra_metatag"
            value={data.extra_metatag}
            onChange={handleChange}
            className="w-full border rounded-md p-2 h-20 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={160}
          />
        </div>

          </form>
        </div>

        {/* Sidebar - 30% */}
        <div className="w-full lg:w-80 xl:w-96">
          <EditorSidebar
            data={data}
            setData={setData}
            image={image}
            preview={preview}
            existingImage={null}
            onImageChange={handleImageChange}
            onSubmit={handlePublishClick}
            loading={loading}
            isEdit={false}
          />
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-800">After publishing</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700">Choose where to link this blog:</p>
              <div className="grid grid-cols-2 gap-3">
                {["routes", "cities", "airport", "skip"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setPublishChoice(option)}
                    className={`border rounded-md px-3 py-2 text-sm font-semibold capitalize ${
                      publishChoice === option ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {publishChoice === "routes" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">Route name</label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">From</label>
                      <input
                        type="text"
                        value={routeForm.from}
                        onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Ahmedabad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">To</label>
                      <input
                        type="text"
                        value={routeForm.to}
                        onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Vadodara"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={routeForm.url}
                      onChange={(e) => setRouteForm({ ...routeForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}

              {publishChoice === "cities" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">City Name</label>
                    <input
                      type="text"
                      value={cityForm.name}
                      onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={cityForm.url}
                      onChange={(e) => setCityForm({ ...cityForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}

              {publishChoice === "airport" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">Airport Name</label>
                    <input
                      type="text"
                      value={airportForm.name}
                      onChange={(e) => setAirportForm({ ...airportForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Enter airport name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">From</label>
                      <input
                        type="text"
                        value={airportForm.from}
                        onChange={(e) => setAirportForm({ ...airportForm, from: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Ahmedabad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">To</label>
                      <input
                        type="text"
                        value={airportForm.to}
                        onChange={(e) => setAirportForm({ ...airportForm, to: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Vadodara"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={airportForm.url}
                      onChange={(e) => setAirportForm({ ...airportForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-md border text-sm font-semibold text-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Publish & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
